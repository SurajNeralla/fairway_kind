import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    // Run parallel queries for aggregate stats
    const [
      profilesResult,
      subscriptionsResult,
      drawsResult,
      winnersResult,
      charitiesResult,
      auditLogsResult,
    ] = await Promise.all([
      // Total registered users
      supabase.from('profiles').select('id, role', { count: 'exact' }),

      // Subscriptions by status
      supabase.from('subscriptions').select('id, status, plan_type, voluntary_charity_percent'),

      // Draws
      supabase.from('draws').select('id, total_prize_pool, rollover_amount, status, created_at'),

      // Winners & payouts
      supabase.from('winners').select('id, prize_amount, payout_status, proof_status'),

      // Charities total raised
      supabase.from('charities').select('id, name, total_raised, is_active'),

      // Recent audit logs
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    const totalUsers = profilesResult.count || 0;
    const adminCount = (profilesResult.data || []).filter((p) => p.role === 'admin').length;

    const subscriptions = subscriptionsResult.data || [];
    const activeSubscribers = subscriptions.filter((s) => s.status === 'active' || s.status === 'trialing').length;
    const pastDueSubscribers = subscriptions.filter((s) => s.status === 'past_due').length;
    const canceledSubscribers = subscriptions.filter((s) => s.status === 'canceled').length;

    const draws = drawsResult.data || [];
    const publishedDrawsCount = draws.filter((d) => d.status === 'published').length;
    const totalPrizePoolSum = draws.reduce((sum, d) => sum + (d.total_prize_pool || 0), 0);
    const latestRollover = draws.length > 0 ? (draws[draws.length - 1].rollover_amount || 0) : 0;

    const winners = winnersResult.data || [];
    const totalWinnersCount = winners.length;
    const pendingProofsCount = winners.filter((w) => w.proof_status === 'submitted').length;
    const approvedAwaitingPayoutCount = winners.filter((w) => w.proof_status === 'approved' && w.payout_status !== 'paid').length;
    const totalPaidOutSum = winners
      .filter((w) => w.payout_status === 'paid')
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0);

    const charities = charitiesResult.data || [];
    const totalCharityRaised = charities.reduce((sum, c) => sum + (c.total_raised || 0), 0);

    return NextResponse.json({
      metrics: {
        totalUsers,
        adminCount,
        activeSubscribers,
        pastDueSubscribers,
        canceledSubscribers,
        publishedDrawsCount,
        totalPrizePoolSum,
        latestRollover,
        totalWinnersCount,
        pendingProofsCount,
        approvedAwaitingPayoutCount,
        totalPaidOutSum,
        totalCharityRaised,
        activeCharitiesCount: charities.filter((c) => c.is_active).length,
      },
      recentActivity: auditLogsResult.data || [],
    });
  } catch (err: any) {
    console.error('Admin overview API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load admin overview' }, { status: 500 });
  }
}
