import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { charityId, amount, donorEmail, donorName } = body;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1) {
      return NextResponse.json({ error: 'Minimum donation amount is $1.00.' }, { status: 400 });
    }

    if (!charityId) {
      return NextResponse.json({ error: 'Charity ID is required.' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch charity details
    const { data: charity, error: charityErr } = await supabase
      .from('charities')
      .select('*')
      .eq('id', charityId)
      .single();

    if (charityErr || !charity) {
      return NextResponse.json({ error: 'Charity not found.' }, { status: 404 });
    }

    const email = donorEmail || user?.email || undefined;
    const baseUrl = APP_CONFIG.url || 'https://fairway-kind-app.vercel.app';

    // Create Stripe Checkout Session in 'payment' mode for one-time donation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Direct Donation: ${charity.name}`,
              description: `100% Tax-deductible direct charitable grant to ${charity.name} via FairwayKind Philanthropy Escrow`,
            },
            unit_amount: Math.round(amountNum * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${baseUrl}/charities?donation=success&charity=${encodeURIComponent(charity.name)}&amount=${amountNum.toFixed(2)}`,
      cancel_url: `${baseUrl}/charities?donation=cancelled`,
      metadata: {
        type: 'independent_donation',
        charity_id: charity.id,
        charity_name: charity.name,
        amount: amountNum.toString(),
        user_id: user?.id || 'anonymous',
        donor_name: donorName || 'Anonymous Donor',
      },
    });

    // Log the donation intent to audit logs
    await supabase.from('audit_logs').insert({
      action: 'direct_donation_initiated',
      entity_type: 'charity_donation',
      actor_id: user?.id || null,
      details: {
        charity_id: charity.id,
        charity_name: charity.name,
        amount: amountNum,
        stripe_session_id: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Donation Checkout Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create donation checkout session' }, { status: 500 });
  }
}
