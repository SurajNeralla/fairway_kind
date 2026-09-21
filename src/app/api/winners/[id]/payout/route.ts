import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canProcessPayout } from '@/lib/winners/winner-engine';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin-only action
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required.' }, { status: 403 });
    }

    const winnerId = params.id;
    const body = await request.json();
    const { transactionReference, paymentMethod = 'bank_transfer' } = body;

    // Fetch current winner
    const { data: winner, error: fetchErr } = await supabase
      .from('winners')
      .select('*')
      .eq('id', winnerId)
      .single();

    if (fetchErr || !winner) {
      return NextResponse.json({ error: 'Winner not found.' }, { status: 404 });
    }

    // CRITICAL GUARD: Cannot pay unless proof is strictly 'approved'
    if (!canProcessPayout(winner)) {
      let reason = '';
      if (winner.proof_status !== 'approved') {
        reason = `Proof must be "approved" before marking payout. Current proof status: "${winner.proof_status}".`;
      } else if (winner.payout_status === 'paid') {
        reason = 'Payout has already been marked as paid. Duplicate payout prevented.';
      }
      return NextResponse.json({ error: reason }, { status: 400 });
    }

    // Update winner payout_status to 'paid'
    const { error: updateWinnerErr } = await supabase
      .from('winners')
      .update({
        payout_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', winnerId);

    if (updateWinnerErr) {
      return NextResponse.json({ error: updateWinnerErr.message }, { status: 400 });
    }

    // Create a formal payout record
    const { data: payoutRecord, error: payoutInsertErr } = await supabase
      .from('payouts')
      .insert({
        winner_id: winnerId,
        user_id: winner.user_id,
        amount: winner.prize_amount,
        payment_method: paymentMethod,
        transaction_reference: transactionReference || null,
        status: 'paid',
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (payoutInsertErr) {
      console.error('Payout record insert error:', payoutInsertErr.message);
      // Non-fatal: winner has been marked paid, log error but proceed
    }

    // Write audit log entry
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'winner_payout_marked_paid',
      entity_type: 'winner',
      entity_id: winnerId,
      details: {
        prize_amount: winner.prize_amount,
        prize_tier: winner.prize_tier,
        payment_method: paymentMethod,
        transaction_reference: transactionReference || null,
        payout_record_id: payoutRecord?.id || null,
      },
    });

    return NextResponse.json({
      message: 'Payout successfully marked as paid.',
      winner_id: winnerId,
      amount_paid: winner.prize_amount,
      payout: payoutRecord || null,
    });
  } catch (err: any) {
    console.error('Payout marking error:', err);
    return NextResponse.json({ error: err.message || 'Payout action failed' }, { status: 500 });
  }
}
