import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeCharityPercentage, calculateCharityContribution } from '@/lib/charity/calculator';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    const body = await request.json();
    const { charityId, voluntaryPercent } = body;

    if (!charityId) {
      return NextResponse.json({ error: 'Charity ID is required' }, { status: 400 });
    }

    // Server-side enforcement of 10% minimum percentage
    const sanitizedPercent = sanitizeCharityPercentage(Number(voluntaryPercent));

    // Fetch existing user subscription (latest active/created)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription record found' }, { status: 404 });
    }

    // Calculate exact dollar contribution based on plan type and percentage
    const calc = calculateCharityContribution(subscription.plan_type, sanitizedPercent);

    // Update user subscription record with selected charity and percentage by primary key
    const { data: updatedSub, error: updateErr } = await supabase
      .from('subscriptions')
      .update({
        charity_id: charityId,
        voluntary_charity_percent: sanitizedPercent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)
      .select()
      .limit(1)
      .maybeSingle();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // Record charity contribution log
    await supabase.from('charity_contributions').insert({
      user_id: user.id,
      subscription_id: subscription.id,
      charity_id: charityId,
      amount: calc.contributionAmount,
      percentage: sanitizedPercent,
    });

    return NextResponse.json({
      subscription: updatedSub,
      contributionAmount: calc.contributionAmount,
      percentage: sanitizedPercent,
      message: 'Charity selection and contribution percentage updated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update charity selection' }, { status: 500 });
  }
}
