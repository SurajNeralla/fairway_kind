import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
  const supabaseAdmin = createAdminClient();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === 'production') {
    console.error('SUPABASE_SERVICE_ROLE_KEY is required for webhook processing in production.');
    return NextResponse.json({ error: 'Server configuration error: missing service role key' }, { status: 500 });
  }

  const body = await request.text();
  const signature = headers().get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && !webhookSecret.includes('mock')) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Development mode fallback event parsing
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Idempotency check using audit_logs or processed event IDs
  const { data: existingEvent } = await supabaseAdmin
    .from('audit_logs')
    .select('id')
    .eq('entity_type', 'stripe_event')
    .eq('action', event.id)
    .limit(1)
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json({ message: 'Event already processed' }, { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planType = (session.metadata?.plan_type as 'monthly' | 'yearly') || 'monthly';
        const charityId = session.metadata?.charity_id || null;
        const voluntaryPercent = Number(session.metadata?.voluntary_percent || 10);

        if (userId) {
          const periodEnd = new Date();
          if (planType === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          }

          await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string || `sub_${session.id}`,
            plan_type: planType,
            status: 'active',
            charity_id: charityId,
            voluntary_charity_percent: voluntaryPercent,
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd.toISOString(),
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (customerId) {
          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('id, user_id, plan_type')
            .eq('stripe_customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (sub) {
            const periodEnd = new Date();
            if (sub.plan_type === 'yearly') {
              periodEnd.setFullYear(periodEnd.getFullYear() + 1);
            } else {
              periodEnd.setMonth(periodEnd.getMonth() + 1);
            }

            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', sub.id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (customerId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        let statusMapped: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' = 'active';
        if (subscription.status === 'canceled') statusMapped = 'canceled';
        if (subscription.status === 'past_due') statusMapped = 'past_due';
        if (subscription.status === 'incomplete') statusMapped = 'incomplete';
        if (subscription.status === 'trialing') statusMapped = 'trialing';

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: statusMapped,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Record event processing in audit logs for idempotency
    await supabaseAdmin.from('audit_logs').insert({
      action: event.id,
      entity_type: 'stripe_event',
      details: { type: event.type },
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
