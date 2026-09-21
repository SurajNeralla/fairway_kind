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
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // Parallel data fetches for reporting analytics
    const [
      profilesRes,
      subsRes,
      drawsRes,
      entriesRes,
      winnersRes,
      charitiesRes,
      contributionsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id, role, created_at'),
      supabase.from('subscriptions').select('id, user_id, plan_type, status, voluntary_charity_percent, created_at'),
      supabase.from('draws').select('*').order('draw_date', { ascending: false }),
      supabase.from('draw_entries').select('id, match_count, prize_tier, prize_amount'),
      supabase.from('winners').select('*'),
      supabase.from('charities').select('*'),
      supabase.from('charity_contributions').select('amount, percentage, created_at'),
    ]);

    const profiles = profilesRes.data || [];
    const subs = subsRes.data || [];
    const draws = drawsRes.data || [];
    const entries = entriesRes.data || [];
    const winners = winnersRes.data || [];
    const charities = charitiesRes.data || [];
    const contributions = contributionsRes.data || [];

    // 1. User Statistics
    const totalUsers = profiles.length;
    const activeSubscribers = subs.filter((s) => s.status === 'active' || s.status === 'trialing').length;
    const conversionRate = totalUsers > 0 ? ((activeSubscribers / totalUsers) * 100).toFixed(1) : '0';
    const monthlyCount = subs.filter((s) => s.plan_type === 'monthly').length;
    const yearlyCount = subs.filter((s) => s.plan_type === 'yearly').length;
    const churnCount = subs.filter((s) => s.status === 'canceled').length;

    // 2. Prize Pool Statistics
    const totalPoolGenerated = draws.reduce((sum, d) => sum + (d.total_prize_pool || 0), 0);
    const tier5Total = draws.reduce((sum, d) => sum + (d.tier_5_pool || 0), 0);
    const tier4Total = draws.reduce((sum, d) => sum + (d.tier_4_pool || 0), 0);
    const tier3Total = draws.reduce((sum, d) => sum + (d.tier_3_pool || 0), 0);
    const latestRollover = draws.length > 0 ? (draws[0].rollover_amount || 0) : 0;
    const totalPaidPrizes = winners
      .filter((w) => w.payout_status === 'paid')
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0);
    const totalPendingPrizes = winners
      .filter((w) => w.payout_status !== 'paid')
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0);

    // 3. Charity Statistics
    const totalCharityRaised = charities.reduce((sum, c) => sum + (c.total_raised || 0), 0);
    const avgVoluntaryPercent = subs.length > 0
      ? (subs.reduce((sum, s) => sum + (s.voluntary_charity_percent || 10), 0) / subs.length).toFixed(1)
      : '10.0';

    const charityBreakdown = charities.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      totalRaised: c.total_raised || 0,
      percentageOfTotal: totalCharityRaised > 0 ? (((c.total_raised || 0) / totalCharityRaised) * 100).toFixed(1) : '0',
    }));

    // 4. Draw Statistics
    const totalDraws = draws.length;
    const totalTicketsEntered = entries.length;
    const tier5Wins = winners.filter((w) => w.prize_tier === 'tier_5_match').length;
    const tier4Wins = winners.filter((w) => w.prize_tier === 'tier_4_match').length;
    const tier3Wins = winners.filter((w) => w.prize_tier === 'tier_3_match').length;

    return NextResponse.json({
      userStats: {
        totalUsers,
        activeSubscribers,
        conversionRate: `${conversionRate}%`,
        monthlyCount,
        yearlyCount,
        churnCount,
      },
      prizeStats: {
        totalPoolGenerated,
        tier5Total,
        tier4Total,
        tier3Total,
        latestRollover,
        totalPaidPrizes,
        totalPendingPrizes,
      },
      charityStats: {
        totalCharityRaised,
        avgVoluntaryPercent: `${avgVoluntaryPercent}%`,
        charityBreakdown,
        totalContributionsLogged: contributions.length,
      },
      drawStats: {
        totalDraws,
        totalTicketsEntered,
        tier5Wins,
        tier4Wins,
        tier3Wins,
        totalWinners: winners.length,
      },
    });
  } catch (err: any) {
    console.error('Admin reports API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate reports' }, { status: 500 });
  }
}
