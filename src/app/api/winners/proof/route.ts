import { NextResponse } from 'next/server';
import { POST as handleProofUpload } from '../[id]/proof/route';

export async function POST(request: Request) {
  try {
    const formData = await request.clone().formData();
    const winnerId = (formData.get('winner_id') as string) || (formData.get('id') as string) || 'w1';

    return handleProofUpload(request, { params: { id: winnerId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Proof upload processing failed' },
      { status: 500 }
    );
  }
}
