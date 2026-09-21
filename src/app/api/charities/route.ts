import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase.from('charities').select('*');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category && category !== 'all') {
      query = query.ilike('category', `%${category}%`);
    }

    if (search && search.trim() !== '') {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: charities, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ charities: charities || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch charities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Server-side Admin Authorization check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, logo_url, is_active = true } = body;

    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Name, description, and category are required' }, { status: 400 });
    }

    const { data: newCharity, error } = await supabase
      .from('charities')
      .insert({
        name,
        description,
        category,
        logo_url: logo_url || null,
        is_active,
        total_raised: 0.00,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ charity: newCharity, message: 'Charity created successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create charity' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, category, logo_url, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Charity ID is required for editing' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('charities')
      .update({
        name,
        description,
        category,
        logo_url,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ charity: updated, message: 'Charity updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update charity' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Charity ID is required' }, { status: 400 });
    }

    // Soft delete by setting is_active = false
    const { error } = await supabase
      .from('charities')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Charity deactivated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete charity' }, { status: 500 });
  }
}
