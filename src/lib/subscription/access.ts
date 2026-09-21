import { Subscription, SubscriptionStatus } from '@/lib/types';

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  return subscription.status === 'active' || subscription.status === 'trialing';
}

export function getStatusBadgeVariant(status: SubscriptionStatus): 'emerald' | 'cyan' | 'gold' | 'rose' | 'neutral' {
  switch (status) {
    case 'active':
      return 'emerald';
    case 'trialing':
      return 'cyan';
    case 'past_due':
      return 'gold';
    case 'canceled':
      return 'rose';
    case 'incomplete':
    default:
      return 'neutral';
  }
}
