import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateProofFile, canSubmitProof } from '@/lib/winners/winner-engine';

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

    const winnerId = params.id;

    // Fetch winner record — user can only upload their own proof
    const { data: winner, error: winnerFetchErr } = await supabase
      .from('winners')
      .select('*')
      .eq('id', winnerId)
      .eq('user_id', user.id)
      .single();

    if (winnerFetchErr || !winner) {
      return NextResponse.json(
        { error: 'Winner record not found or access denied.' },
        { status: 404 }
      );
    }

    // Enforce state machine: only pending_submission or rejected can upload
    if (!canSubmitProof(winner)) {
      return NextResponse.json(
        { error: `Proof cannot be submitted in the current status: "${winner.proof_status}". Only pending or rejected winners may submit.` },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('proof') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No proof file provided.' }, { status: 400 });
    }

    // Validate file: extension, MIME type, size
    const validation = validateProofFile(file.name, file.size, file.type);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Construct a private, namespaced storage path
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `winner-proofs/${user.id}/${winnerId}/${timestamp}_${safeFileName}`;

    // Upload file to Supabase Storage bucket (private bucket: winner-proofs)
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from('winner-proofs')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return NextResponse.json(
        { error: `File upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // Get signed URL (1-week expiry) to store in DB
    const { data: signedUrlData, error: signedUrlErr } = await supabase.storage
      .from('winner-proofs')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days

    if (signedUrlErr || !signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: 'File stored but could not generate signed URL.' },
        { status: 500 }
      );
    }

    // Insert winner_proofs record
    const { data: proof, error: proofInsertErr } = await supabase
      .from('winner_proofs')
      .insert({
        winner_id: winnerId,
        user_id: user.id,
        proof_file_url: signedUrlData.signedUrl,
        file_name: file.name,
        file_size_bytes: file.size,
        status: 'submitted',
      })
      .select()
      .single();

    if (proofInsertErr) {
      return NextResponse.json({ error: proofInsertErr.message }, { status: 400 });
    }

    // Update winner's proof_status to 'submitted'
    const { error: winnerUpdateErr } = await supabase
      .from('winners')
      .update({
        proof_status: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', winnerId);

    if (winnerUpdateErr) {
      return NextResponse.json({ error: winnerUpdateErr.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Proof submitted successfully. Pending admin review.',
      proof,
    });
  } catch (err: any) {
    console.error('Proof upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
