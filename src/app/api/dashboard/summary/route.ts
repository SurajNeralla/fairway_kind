import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/summary
 * Returns all data needed to hydrate the subscriber dashboard in one round-trip.
 * Subscriber-only — admins are redirected to /admin from middleware.
 */
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run all fetches in parallel
    const [
      profileResult,
      subscriptionResult,
      scoresResult,
      drawEntriesResult,
      publishedDrawsResult,
      winnersResult,
      charitiesResult,
    ] = await Promise.all([
      // Profile
      supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .eq('id', user.id)
        .limit(1)
        .maybeSingle(),

      // Subscription + charity join
      supabase
        .from('subscriptions')
        .select('*, charities(id, name, category, logo_url, total_raised, is_active)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Active scores newest first
      supabase
        .from('scores')
        .select('id, score, played_on, is_active, created_at')
        .eq('user_id', user.id)
        .order('played_on', { ascending: false })
        .order('created_at', { ascending: false }),

      // Draw entries with draw info
      supabase
        .from('draw_entries')
        .select('id, draw_id, entry_numbers, match_count, prize_tier, prize_amount, created_at, draws(id, title, period_month, period_year, draw_date, status, winning_numbers, total_prize_pool)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Latest 5 published draws (for upcoming / recent context)
      supabase
        .from('draws')
        .select('id, title, period_month, period_year, draw_date, status, winning_numbers, total_prize_pool, tier_5_pool, tier_4_pool, tier_3_pool, rollover_amount')
        .eq('status', 'published')
        .order('draw_date', { ascending: false })
        .limit(5),

      // Winners with proofs
      supabase
        .from('winners')
        .select('id, draw_id, match_count, prize_tier, prize_amount, proof_status, payout_status, admin_notes, created_at, updated_at, draws(title, period_month, period_year, draw_date), winner_proofs(id, file_name, status, rejection_reason, reviewed_at, created_at)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Active charities for change-charity selector
      supabase
        .from('charities')
        .select('id, name, category, logo_url, total_raised, description')
        .eq('is_active', true)
        .order('name'),
    ]);

    const profile = profileResult.data;
    const subscription = subscriptionResult.data;
    const allScores = scoresResult.data || [];
    const drawEntries = drawEntriesResult.data || [];
    const publishedDraws = publishedDrawsResult.data || [];
    const winners = winnersResult.data || [];
    const charities = charitiesResult.data || [];

    // Compute derived stats
    const activeScores = allScores.filter((s) => s.is_active !== false).slice(0, 5);
    const isSubscriptionActive = subscription?.status === 'active' || subscription?.status === 'trialing';
    const drawsEntered = drawEntries.length;
    const totalWon = winners
      .filter((w) => w.payout_status === 'paid')
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0);
    const pendingWinnings = winners
      .filter((w) => w.payout_status !== 'paid' && w.prize_amount > 0)
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0);

    // Notification generation
    const notifications: Array<{ id: string; type: string; title: string; message: string; action?: string; actionHref?: string }> = [];

    if (!isSubscriptionActive) {
      notifications.push({
        id: 'sub-inactive',
        type: 'warning',
        title: 'Subscription Inactive',
        message: 'Renew your subscription to qualify for the next monthly draw.',
        action: 'Manage Subscription',
        actionHref: '/dashboard/subscription',
      });
    }

    if (isSubscriptionActive && activeScores.length < 5) {
      notifications.push({
        id: 'scores-low',
        type: 'info',
        title: `${5 - activeScores.length} Score${5 - activeScores.length > 1 ? 's' : ''} Needed`,
        message: `You need ${5 - activeScores.length} more score${5 - activeScores.length > 1 ? 's' : ''} to fully qualify for the monthly draw.`,
        action: 'Add Scores',
        actionHref: '/dashboard/scores',
      });
    }

    if (isSubscriptionActive && activeScores.length === 5) {
      notifications.push({
        id: 'draw-qualified',
        type: 'success',
        title: 'Fully Qualified for Draw!',
        message: 'Your 5 scores are active and your draw ticket is live.',
      });
    }

    const proofPendingWinners = winners.filter((w) => w.proof_status === 'pending_submission');
    if (proofPendingWinners.length > 0) {
      notifications.push({
        id: 'proof-needed',
        type: 'warning',
        title: `${proofPendingWinners.length} Win${proofPendingWinners.length > 1 ? 's' : ''} Awaiting Proof`,
        message: 'Upload your scorecard proof to unlock your prize payout.',
        action: 'Upload Proof',
        actionHref: '/dashboard/winners',
      });
    }

    const rejectedWinners = winners.filter((w) => w.proof_status === 'rejected');
    if (rejectedWinners.length > 0) {
      notifications.push({
        id: 'proof-rejected',
        type: 'error',
        title: 'Proof Rejected — Resubmit Required',
        message: 'Admin rejected your proof. Please upload a clearer document.',
        action: 'Re-upload Proof',
        actionHref: '/dashboard/winners',
      });
    }

    const approvedUnpaid = winners.filter((w) => w.proof_status === 'approved' && w.payout_status !== 'paid');
    if (approvedUnpaid.length > 0) {
      notifications.push({
        id: 'payout-pending',
        type: 'success',
        title: 'Payout Processing',
        message: `$${approvedUnpaid.reduce((s, w) => s + w.prize_amount, 0).toLocaleString()} approved — your payout is being arranged.`,
      });
    }

    if (!subscription?.charity_id && isSubscriptionActive) {
      notifications.push({
        id: 'no-charity',
        type: 'info',
        title: 'No Charity Selected',
        message: 'Choose a charity to direct your contribution.',
        action: 'Choose Charity',
        actionHref: '/dashboard/subscription',
      });
    }

    return NextResponse.json({
      profile,
      subscription,
      activeScores,
      allScores,
      drawEntries,
      publishedDraws,
      winners,
      charities,
      stats: {
        isSubscriptionActive,
        activeScoreCount: activeScores.length,
        drawsEntered,
        totalWon,
        pendingWinnings,
        winCount: winners.length,
        planType: subscription?.plan_type || null,
        status: subscription?.status || null,
        renewalDate: subscription?.current_period_end || null,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
        charityName: (subscription as any)?.charities?.name || null,
        voluntaryPercent: subscription?.voluntary_charity_percent || 10,
        monthlyPrice: subscription?.plan_type === 'yearly' ? 24.16 : 29,
      },
      notifications,
    });
  } catch (err: any) {
    console.error('Dashboard summary error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load dashboard' }, { status: 500 });
  }
}
