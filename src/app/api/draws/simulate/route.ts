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
    const { periodMonth = 9, periodYear = 2026, mode = 'random', seed = `sim-seed-${Date.now()}` } = body;

    // Fetch active subscribers with active 5 scores
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id')
      .in('status', ['active', 'trialing']);

    const activeUserIds = (subscriptions || []).map((s) => s.user_id);
    const activeSubscribersCount = activeUserIds.length || 10; // Fallback demo count

    // Calculate total prize pool
    const totalPrizePool = calculateTotalPrizePool(activeSubscribersCount);

    // Fetch previous draw rollover if any
    const { data: previousDraw } = await supabase
      .from('draws')
      .select('rollover_amount')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .maybeSingle();

    const previousRollover = previousDraw?.rollover_amount || 0;

    // Fetch scores for active users
    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('is_active', true)
      .order('played_on', { ascending: false });

    // Group user scores into 5-number ticket entries
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

    // Run dry-run simulation (Does NOT publish or mutate DB)
    const simulationResult = simulateDraw(
      drawTickets,
      mode as 'random' | 'algorithmic',
      seed,
      totalPrizePool,
      previousRollover
    );

    return NextResponse.json({
      simulation: simulationResult,
      periodMonth,
      periodYear,
      isSimulated: true,
      message: 'Simulation completed. This result has NOT been published to users or database.',
    });
  } catch (err: any) {
    console.error('Simulation error:', err);
    return NextResponse.json({ error: err.message || 'Simulation failed' }, { status: 500 });
  }
}
