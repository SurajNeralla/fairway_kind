import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canApproveOrRejectProof, canProcessPayout } from '@/lib/winners/winner-engine';

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
    const { action, notes } = body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject".' },
        { status: 400 }
      );
    }

    if (action === 'reject' && (!notes || notes.trim() === '')) {
      return NextResponse.json(
        { error: 'Rejection reason (notes) is required when rejecting a proof.' },
        { status: 400 }
      );
    }

    // Fetch current winner
    const { data: winner, error: fetchErr } = await supabase
      .from('winners')
      .select('*')
      .eq('id', winnerId)
      .single();

    if (fetchErr || !winner) {
      return NextResponse.json({ error: 'Winner not found.' }, { status: 404 });
    }

    // Enforce state machine: can only review submitted proofs
    if (!canApproveOrRejectProof(winner)) {
      return NextResponse.json(
        { error: `Winner proof cannot be reviewed. Current status: "${winner.proof_status}". Only "submitted" proofs can be reviewed.` },
        { status: 400 }
      );
    }

    const newProofStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update winner proof_status and admin notes
    const { error: updateWinnerErr } = await supabase
      .from('winners')
      .update({
        proof_status: newProofStatus,
        admin_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', winnerId);

    if (updateWinnerErr) {
      return NextResponse.json({ error: updateWinnerErr.message }, { status: 400 });
    }

    // Update the latest winner_proof record with review details
    const { data: latestProof } = await supabase
      .from('winner_proofs')
      .select('id')
      .eq('winner_id', winnerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestProof) {
      await supabase
        .from('winner_proofs')
        .update({
          status: newProofStatus,
          rejection_reason: action === 'reject' ? notes : null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', latestProof.id);
    }

    // Write audit log entry
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: `winner_proof_${action}`,
      entity_type: 'winner',
      entity_id: winnerId,
      details: {
        new_status: newProofStatus,
        notes: notes || null,
        winner_id: winnerId,
        prize_amount: winner.prize_amount,
        prize_tier: winner.prize_tier,
      },
    });

    return NextResponse.json({
      message: `Winner proof ${action}d successfully.`,
      new_status: newProofStatus,
    });
  } catch (err: any) {
    console.error('Winner review error:', err);
    return NextResponse.json({ error: err.message || 'Review action failed' }, { status: 500 });
  }
}
