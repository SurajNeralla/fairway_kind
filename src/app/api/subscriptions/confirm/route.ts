import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { sessionId, planType = 'monthly', charityId, voluntaryPercent = 10, status = 'active' } = body;

    const adminClient = createAdminClient();
    let stripeCustomerId = `cus_${user.id.substring(0, 8)}`;
    let stripeSubscriptionId = `sub_${Date.now()}`;
    let finalPlanType = planType;
    let finalCharityId = charityId;
    let finalVoluntaryPercent = Number(voluntaryPercent);
    let finalStatus = status;

    // If Stripe session ID is provided, verify directly with Stripe API
    if (sessionId && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session) {
          stripeCustomerId = (session.customer as string) || stripeCustomerId;
          stripeSubscriptionId = (session.subscription as string) || `sub_${session.id}`;
          finalPlanType = (session.metadata?.plan_type as any) || finalPlanType;
          finalCharityId = session.metadata?.charity_id || finalCharityId;
          finalVoluntaryPercent = Number(session.metadata?.voluntary_percent || finalVoluntaryPercent);
          finalStatus = 'active';
        }
      } catch (stripeErr: any) {
        console.warn('Could not retrieve Stripe session directly:', stripeErr.message);
      }
    }

    const periodEnd = new Date();
    if (finalPlanType === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Upsert subscription using admin service role (bypassing RLS)
    const { data: updatedSub, error: subError } = await adminClient
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          plan_type: finalPlanType,
          status: finalStatus,
          charity_id: finalCharityId || null,
          voluntary_charity_percent: finalVoluntaryPercent,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: finalStatus === 'canceled',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (subError) {
      console.error('Failed to upsert subscription:', subError);
      return NextResponse.json({ error: subError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSub,
    });
  } catch (err: any) {
    console.error('Subscription confirmation error:', err);
    return NextResponse.json({ error: err.message || 'Confirmation failed' }, { status: 500 });
  }
}
