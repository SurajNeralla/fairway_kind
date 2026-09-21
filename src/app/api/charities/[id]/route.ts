import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    const { data: charity, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }

    return NextResponse.json({ charity });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch charity details' }, { status: 500 });
  }
}
