export interface PlanDetails {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  interval: 'month' | 'year';
  priceId: string;
  description: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<'monthly' | 'yearly', PlanDetails> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Hero Plan',
    price: 29,
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_MONTHLY_ID || 'price_monthly_dh_mock',
    description: 'Full entry into monthly prize pools ($25k+) with minimum 10% charity grant.',
    features: [
      'Log up to 5 Stableford golf scores (1–45 range)',
      'Entry into 5-match (40%), 4-match (35%), 3-match (25%) prize pools',
      'Unclaimed 5-match jackpot rolls over to next month',
      'Minimum 10% automatically remitted to chosen charity',
      'Voluntary charity contribution slider up to 100%',
      'Instant winner proof submission and ACH bank payout workflow',
    ],
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Hero Plan',
    price: 290,
    interval: 'year',
    priceId: process.env.STRIPE_PRICE_YEARLY_ID || 'price_yearly_dh_mock',
    description: 'Save 17% (2 months free) with annual subscription & priority support.',
    features: [
      'All Monthly Hero Plan features included',
      '2 Months Free (Save $58/year)',
      'Official GHIN handicap integration & attested scorecard parsing',
      'Certified annual 501(c)(3) tax receipts for charity grants',
      'Priority winner proof verification queue',
    ],
  },
};
