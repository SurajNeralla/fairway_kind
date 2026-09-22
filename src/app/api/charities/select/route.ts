import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
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
    const sanitizedPercent = sanitizeCharityPercentage(Number(voluntaryPercent || 10));

    const adminClient = createAdminClient();

    // Verify charity exists
    const { data: charityExists } = await adminClient
      .from('charities')
      .select('id, name')
      .eq('id', charityId)
      .maybeSingle();

    if (!charityExists) {
      return NextResponse.json({ error: 'Selected charity not found' }, { status: 404 });
    }

    // Fetch existing user subscription (latest active/created)
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscription) {
      // Calculate exact dollar contribution based on plan type and percentage
      const calc = calculateCharityContribution(subscription.plan_type, sanitizedPercent);

      // Update user subscription record with selected charity and percentage
      const { data: updatedSub, error: updateErr } = await adminClient
        .from('subscriptions')
        .update({
          charity_id: charityId,
          voluntary_charity_percent: sanitizedPercent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)
        .select('*, charities(*)')
        .single();

      if (updateErr) {
        console.error('Subscription update error:', updateErr);
        return NextResponse.json({ error: updateErr.message }, { status: 400 });
      }

      // Record charity contribution log
      await adminClient.from('charity_contributions').insert({
        user_id: user.id,
        subscription_id: subscription.id,
        charity_id: charityId,
        amount: calc.contributionAmount,
        percentage: sanitizedPercent,
      });

      return NextResponse.json({
        subscription: updatedSub,
        charity: charityExists,
        contributionAmount: calc.contributionAmount,
        percentage: sanitizedPercent,
        message: 'Charity selection and contribution percentage updated successfully.',
      });
    } else {
      // Create pending subscription record with chosen charity
      const { data: newSub, error: insertErr } = await adminClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_customer_id: `cus_pending_${user.id.slice(0, 8)}`,
          plan_type: 'monthly',
          status: 'incomplete',
          charity_id: charityId,
          voluntary_charity_percent: sanitizedPercent,
        })
        .select('*, charities(*)')
        .single();

      if (insertErr) {
        console.error('Subscription insert error:', insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 400 });
      }

      return NextResponse.json({
        subscription: newSub,
        charity: charityExists,
        contributionAmount: 2.9,
        percentage: sanitizedPercent,
        message: 'Charity selection saved for your membership.',
      });
    }
  } catch (err: any) {
    console.error('Charity select handler exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to update charity selection' }, { status: 500 });
  }
}
