import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check user role
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      isAdmin = profile?.role === 'admin';
    }

    let query = supabase.from('draws').select('*');

    if (!isAdmin) {
      query = query.eq('status', 'published');
    }

    const { data: draws, error } = await query.order('draw_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ draws: draws || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch draws' }, { status: 500 });
  }
}
