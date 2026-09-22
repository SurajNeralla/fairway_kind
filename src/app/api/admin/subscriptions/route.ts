import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const adminClient = createAdminClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const plan = searchParams.get('plan') || '';
    const search = searchParams.get('search') || '';

    // Fetch subscriptions with profile and charity joined using service role client
    let query = adminClient
      .from('subscriptions')
      .select(`
        *,
        profiles (id, email, full_name, role),
        charities (id, name, category, logo_url)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (plan) {
      query = query.eq('plan_type', plan);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let filtered = subscriptions || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((sub: any) =>
        sub.profiles?.email?.toLowerCase().includes(s) ||
        sub.profiles?.full_name?.toLowerCase().includes(s) ||
        sub.charities?.name?.toLowerCase().includes(s) ||
        sub.stripe_customer_id?.toLowerCase().includes(s)
      );
    }

    return NextResponse.json({
      subscriptions: filtered,
      total: filtered.length,
      counts: {
        total: (subscriptions || []).length,
        active: (subscriptions || []).filter((s) => s.status === 'active' || s.status === 'trialing').length,
        pastDue: (subscriptions || []).filter((s) => s.status === 'past_due').length,
        canceled: (subscriptions || []).filter((s) => s.status === 'canceled').length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
