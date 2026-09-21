import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { simulateDraw, calculateTotalPrizePool, DrawTicket } from '@/lib/draws/draw-engine';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    // Admin authorization check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { periodMonth = 9, periodYear = 2026, mode = 'random', seed = `publish-seed-${Date.now()}` } = body;

    // Check if draw already published for this period
    const { data: existingPublished } = await supabase
      .from('draws')
      .select('id, status')
      .eq('period_month', periodMonth)
      .eq('period_year', periodYear)
      .eq('status', 'published')
      .maybeSingle();

    if (existingPublished) {
      return NextResponse.json({
        error: `Draw for period ${periodMonth}/${periodYear} has already been published. Duplicate publication prevented.`,
      }, { status: 400 });
    }

    // Fetch active subscribers with active 5 scores
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id')
      .in('status', ['active', 'trialing']);

    const activeUserIds = (subscriptions || []).map((s) => s.user_id);
    const activeSubscribersCount = activeUserIds.length || 10;
    const totalPrizePool = calculateTotalPrizePool(activeSubscribersCount);

    const { data: previousDraw } = await supabase
      .from('draws')
      .select('rollover_amount')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .maybeSingle();

    const previousRollover = previousDraw?.rollover_amount || 0;

    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('is_active', true)
      .order('played_on', { ascending: false });

    const ticketsByUser: Record<string, { numbers: number[]; scoreIds: string[] }> = {};
    (scores || []).forEach((s) => {
      if (!ticketsByUser[s.user_id]) {
        ticketsByUser[s.user_id] = { numbers: [], scoreIds: [] };
      }
      if (ticketsByUser[s.user_id].numbers.length < 5) {
        ticketsByUser[s.user_id].numbers.push(s.score);
        ticketsByUser[s.user_id].scoreIds.push(s.id);
      }
    });

    const drawTickets: DrawTicket[] = [];
    Object.keys(ticketsByUser).forEach((uid) => {
      if (ticketsByUser[uid].numbers.length === 5) {
        drawTickets.push({
          userId: uid,
          numbers: ticketsByUser[uid].numbers,
          scoreIds: ticketsByUser[uid].scoreIds,
        });
      }
    });

    const finalResult = simulateDraw(
      drawTickets,
      mode as 'random' | 'algorithmic',
      seed,
      totalPrizePool,
      previousRollover
    );

    // Commit Published Draw Record to DB
    const { data: newDraw, error: drawErr } = await supabase
      .from('draws')
      .insert({
        title: `FairwayKind Monthly Draw — ${periodMonth}/${periodYear}`,
        period_month: periodMonth,
        period_year: periodYear,
        draw_date: new Date().toISOString(),
        status: 'published',
        mode,
        winning_numbers: finalResult.winningNumbers,
        total_prize_pool: totalPrizePool,
        tier_5_pool: finalResult.tier5.totalTierPool,
        tier_4_pool: finalResult.tier4.totalTierPool,
        tier_3_pool: finalResult.tier3.totalTierPool,
        rollover_amount: finalResult.nextRollover,
      })
      .select()
      .single();

    if (drawErr) {
      return NextResponse.json({ error: drawErr.message }, { status: 400 });
    }

    // Insert Draw Entries & Winners
    for (const ticket of drawTickets) {
      const { matchCount, tier } = finalResult.winningNumbers.length === 5
        ? (await import('@/lib/draws/draw-engine')).evaluateTicketMatch(ticket.numbers, finalResult.winningNumbers)
        : { matchCount: 0, tier: 'none' as const };

      let prizeAmount = 0;
      if (tier === 'tier_5_match') prizeAmount = finalResult.tier5.prizePerWinner;
      else if (tier === 'tier_4_match') prizeAmount = finalResult.tier4.prizePerWinner;
      else if (tier === 'tier_3_match') prizeAmount = finalResult.tier3.prizePerWinner;

      const { data: entry } = await supabase
        .from('draw_entries')
        .insert({
          draw_id: newDraw.id,
          user_id: ticket.userId,
          entry_numbers: ticket.numbers,
          score_ids: ticket.scoreIds,
          match_count: matchCount,
          prize_tier: tier,
          prize_amount: prizeAmount,
        })
        .select()
        .single();

      if (entry && matchCount >= 3 && tier !== 'none') {
        await supabase.from('winners').insert({
          draw_id: newDraw.id,
          draw_entry_id: entry.id,
          user_id: ticket.userId,
          match_count: matchCount,
          prize_tier: tier,
          prize_amount: prizeAmount,
          proof_status: 'pending_submission',
          payout_status: 'unpaid',
        });
      }
    }

    // Record audit trail for sensitive draw publication
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'publish_draw',
      entity_type: 'draw',
      entity_id: newDraw.id,
      details: {
        period_month: periodMonth,
        period_year: periodYear,
        mode,
        winning_numbers: finalResult.winningNumbers,
        total_prize_pool: totalPrizePool,
        tier_5_winners: finalResult.tier5.winnerCount,
        tier_4_winners: finalResult.tier4.winnerCount,
        tier_3_winners: finalResult.tier3.winnerCount,
        rollover: finalResult.nextRollover,
      },
    });

    return NextResponse.json({
      draw: newDraw,
      summary: finalResult,
      message: 'Draw successfully published! Winners created in database.',
    });
  } catch (err: any) {
    console.error('Publish draw error:', err);
    return NextResponse.json({ error: err.message || 'Publishing draw failed' }, { status: 500 });
  }
}
