import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const client = isAdmin ? createAdminClient() : supabase;

    let query = client.from('winners').select(`
      *,
      draws (title, period_month, period_year, draw_date),
      winner_proofs (*),
      profiles (full_name, email)
    `);

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: winners, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ winners: winners || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch winners' }, { status: 500 });
  }
}
