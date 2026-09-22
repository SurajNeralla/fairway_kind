import { NextResponse } from 'next/server';
import { createClientFromRequest, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/admin/users — List users with search, filters, pagination, scores, subscription, and wins
export async function GET(request: Request) {
  try {
    const supabase = createClientFromRequest(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Fetch all profiles using service role client
    let query = adminClient
      .from('profiles')
      .select('id, email, full_name, role, created_at');

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    if (roleFilter) {
      query = query.eq('role', roleFilter);
    }

    const { data: profiles, error: profilesErr } = await query.order(sortBy, { ascending: sortOrder });

    if (profilesErr) {
      return NextResponse.json({ error: profilesErr.message }, { status: 400 });
    }

    // Parallel fetch subscriptions, scores, and winners
    const [
      { data: subscriptions, error: subsErr },
      { data: scores, error: scoresErr },
      { data: winners, error: winnersErr }
    ] = await Promise.all([
      adminClient.from('subscriptions').select('*'),
      adminClient.from('scores').select('id, user_id, score, played_on, is_active').order('played_on', { ascending: false }),
      adminClient.from('winners').select('id, user_id, prize_amount, prize_tier, payout_status, proof_status, created_at')
    ]);

    if (subsErr) console.error('Admin users API subs error:', subsErr);
    if (scoresErr) console.error('Admin users API scores error:', scoresErr);
    if (winnersErr) console.error('Admin users API winners error:', winnersErr);

    // Map into enriched user records
    const subMap: Record<string, any> = {};
    (subscriptions || []).forEach((s) => {
      if (!subMap[s.user_id] || s.status === 'active') {
        subMap[s.user_id] = s;
      }
    });

    const scoreMap: Record<string, any[]> = {};
    (scores || []).forEach((s) => {
      if (!scoreMap[s.user_id]) scoreMap[s.user_id] = [];
      scoreMap[s.user_id].push(s);
    });

    const winnerMap: Record<string, any[]> = {};
    (winners || []).forEach((w) => {
      if (!winnerMap[w.user_id]) winnerMap[w.user_id] = [];
      winnerMap[w.user_id].push(w);
    });

    let enrichedUsers = (profiles || []).map((p) => {
      const userScores = scoreMap[p.id] || [];
      const userWins = winnerMap[p.id] || [];
      const userSub = subMap[p.id] || null;

      return {
        ...p,
        subscription: userSub,
        activeScoreCount: userScores.filter((s) => s.is_active).length,
        activeScores: userScores.filter((s) => s.is_active).slice(0, 5),
        allScores: userScores,
        wins: userWins,
        totalWinnings: userWins
          .filter((w) => w.payout_status === 'paid')
          .reduce((sum: number, w: any) => sum + (w.prize_amount || 0), 0),
      };
    });

    // Filter by subscription status if specified
    if (statusFilter) {
      enrichedUsers = enrichedUsers.filter((u) => {
        if (statusFilter === 'none') return !u.subscription;
        return u.subscription?.status === statusFilter;
      });
    }

    const totalCount = enrichedUsers.length;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = enrichedUsers.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      users: paginatedUsers,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch users' }, { status: 500 });
  }
}

// PATCH /api/admin/users — Update user profile (role, full_name) with audit logging
export async function PATCH(request: Request) {
  try {
    const supabase = createClientFromRequest(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role, fullName } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Prevent admin from downgrading themselves
    if (userId === user.id && role && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot remove your own admin role.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (role && ['user', 'admin'].includes(role)) {
      updatePayload.role = role;
    }

    if (fullName && fullName.trim()) {
      updatePayload.full_name = fullName.trim();
    }

    const { error: updateErr } = await adminClient
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // Audit log
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      action: 'admin_update_user_profile',
      entity_type: 'profile',
      entity_id: userId,
      details: updatePayload,
    });

    return NextResponse.json({
      message: 'User profile updated successfully.',
      updated: updatePayload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Profile update failed' }, { status: 500 });
  }
}
