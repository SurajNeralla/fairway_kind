import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateScoreValue, validateScoreDate } from '@/lib/scores/score-engine';
import { isSubscriptionActive } from '@/lib/subscription/access';
import { Subscription } from '@/lib/types';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    // Fetch user's active scores (newest date first)
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_on', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ scores: scores || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    // Subscription check
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!isSubscriptionActive(subData as Subscription | null)) {
      return NextResponse.json({
        error: 'Active subscription required to enter and manage golf scores.',
      }, { status: 403 });
    }

    const body = await request.json();
    const { score, played_on } = body;

    const numScore = Number(score);
    const scoreVal = validateScoreValue(numScore);
    if (!scoreVal.isValid) {
      return NextResponse.json({ error: scoreVal.error }, { status: 400 });
    }

    // Fetch existing user dates
    const { data: existingScores } = await supabase
      .from('scores')
      .select('played_on')
      .eq('user_id', user.id);

    const existingDates = (existingScores || []).map(s => s.played_on);
    const dateVal = validateScoreDate(played_on, existingDates);
    if (!dateVal.isValid) {
      return NextResponse.json({ error: dateVal.error }, { status: 400 });
    }

    // Insert new score
    const { data: inserted, error: insertErr } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        score: numScore,
        played_on: played_on,
        is_active: true,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    // Enforce Rolling 5 requirement: Fetch all user scores ordered newest first
    const { data: allScores } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_on', { ascending: false })
      .order('created_at', { ascending: false });

    if (allScores && allScores.length > 5) {
      const activeIds = allScores.slice(0, 5).map(s => s.id);
      const overflowIds = allScores.slice(5).map(s => s.id);

      // Mark top 5 active
      await supabase
        .from('scores')
        .update({ is_active: true })
        .in('id', activeIds);

      // Deactivate/trim overflow
      await supabase
        .from('scores')
        .update({ is_active: false })
        .in('id', overflowIds);
    }

    return NextResponse.json({ score: inserted, message: 'Score added successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add score' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    const body = await request.json();
    const { id, score, played_on } = body;

    if (!id) {
      return NextResponse.json({ error: 'Score ID is required for editing.' }, { status: 400 });
    }

    const numScore = Number(score);
    const scoreVal = validateScoreValue(numScore);
    if (!scoreVal.isValid) {
      return NextResponse.json({ error: scoreVal.error }, { status: 400 });
    }

    // Fetch existing dates excluding current record ID
    const { data: existingScores } = await supabase
      .from('scores')
      .select('id, played_on')
      .eq('user_id', user.id);

    const otherDates = (existingScores || [])
      .filter(s => s.id !== id)
      .map(s => s.played_on);

    const dateVal = validateScoreDate(played_on, otherDates);
    if (!dateVal.isValid) {
      return NextResponse.json({ error: dateVal.error }, { status: 400 });
    }

    const { data: updated, error: updateErr } = await supabase
      .from('scores')
      .update({
        score: numScore,
        played_on: played_on,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({ score: updated, message: 'Score updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update score' }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Score ID is required for deletion.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Re-evaluate remaining scores: Ensure top 5 newest are is_active = true
    const { data: remainingScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', user.id)
      .order('played_on', { ascending: false })
      .order('created_at', { ascending: false });

    if (remainingScores && remainingScores.length > 0) {
      const activeIds = remainingScores.slice(0, 5).map(s => s.id);
      await supabase
        .from('scores')
        .update({ is_active: true })
        .in('id', activeIds);
    }

    return NextResponse.json({ message: 'Score deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete score' }, { status: 500 });
  }
}
