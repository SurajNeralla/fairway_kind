import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription record found' }, { status: 404 });
    }

    const baseUrl = APP_CONFIG.url;
    let customerId = subscription?.stripe_customer_id;

    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
      let isValidCustomer = false;
      if (customerId && !customerId.startsWith('cus_new_') && !customerId.startsWith('pending_') && !customerId.startsWith('cus_mock_')) {
        try {
          const cust = await stripe.customers.retrieve(customerId);
          if (cust && !('deleted' in cust && cust.deleted)) {
            isValidCustomer = true;
          }
        } catch {
          isValidCustomer = false;
        }
      }

      if (!isValidCustomer) {
        try {
          const newCust = await stripe.customers.create({
            email: user.email,
            metadata: { user_id: user.id },
          });
          customerId = newCust.id;
          await supabase.from('subscriptions').update({ stripe_customer_id: customerId }).eq('user_id', user.id);
        } catch (e: any) {
          console.error('Failed to create customer for portal:', e);
        }
      }

      try {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${baseUrl}/dashboard/subscription`,
        });

        return NextResponse.json({ url: portalSession.url });
      } catch (portalErr: any) {
        return NextResponse.json({
          error: portalErr.message || 'Stripe Customer Portal is not configured in this mode.',
        }, { status: 400 });
      }
    }

    // Dev Simulation Mode: Toggle subscription cancellation status for local testing
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('cancel_at_period_end')
      .eq('id', subscription.id)
      .limit(1)
      .maybeSingle();

    const newCancelState = !currentSub?.cancel_at_period_end;

    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: newCancelState,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      url: `${baseUrl}/dashboard/subscription?status=portal_simulated&action=${newCancelState ? 'cancelled' : 'renewed'}`,
      simulated: true,
    });
  } catch (error: any) {
    console.error('Portal API error:', error);
    return NextResponse.json({ error: error.message || 'Portal session failed' }, { status: 500 });
  }
}
