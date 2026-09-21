import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
    }

    const body = await request.json();
    const { planType = 'monthly', charityId, voluntaryPercent = 10 } = body;

    const selectedPlan = SUBSCRIPTION_PLANS[planType as 'monthly' | 'yearly'];
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan type selected' }, { status: 400 });
    }

    const charityPct = Math.max(10, Math.min(100, Number(voluntaryPercent)));

    // Fetch existing user profile & subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    // Create Stripe Customer if not existing (or test mode mock)
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: profile?.full_name || user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;
      } catch (err: any) {
        // Fallback for test/mock environment without live Stripe connection
        customerId = `cus_mock_${user.id.substring(0, 8)}`;
      }
    }

    const baseUrl = APP_CONFIG.url;

    // Check if live Stripe keys are present or if running in mock mode
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: selectedPlan.name,
                description: `${selectedPlan.description} (${charityPct}% allocated to charity)`,
              },
              unit_amount: selectedPlan.price * 100,
              recurring: {
                interval: selectedPlan.interval,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${baseUrl}/dashboard/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/subscribe?status=cancelled`,
        metadata: {
          user_id: user.id,
          plan_type: planType,
          charity_id: charityId || '',
          voluntary_percent: charityPct.toString(),
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // Test/Dev Simulation Mode: Directly update DB subscription for local testing
    const periodEnd = new Date();
    if (planType === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: `sub_simulated_${Date.now()}`,
      plan_type: planType,
      status: 'active',
      charity_id: charityId || null,
      voluntary_charity_percent: charityPct,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      url: `${baseUrl}/dashboard/subscription?status=simulated_success`,
      simulated: true,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
