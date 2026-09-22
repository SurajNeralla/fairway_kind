"use client";

import React, { useState } from 'react';
import { Check, ArrowRight, Lock, Heart, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';

export default function SubscribePage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [charityPercent, setCharityPercent] = useState<number>(10);
  const [selectedCharity, setSelectedCharity] = useState('c1000000-0000-0000-0000-000000000001');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    async function checkSub() {
      if (!user) return;
      const supabase = createClient();
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub?.status === 'active' || sub?.status === 'trialing') {
        window.location.href = '/dashboard';
      }
    }
    checkSub();
  }, [user]);

  const price = billingCycle === 'monthly' ? 29 : 290;
  const charityAmount = (price * (charityPercent / 100)).toFixed(2);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: billingCycle,
          charityId: selectedCharity,
          voluntaryPercent: charityPercent,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        showToast('Authentication Required', 'Please sign in or create an account first.', 'info');
        window.location.href = `/login?next=/subscribe`;
        return;
      }

      if (data.url) {
        if (data.simulated) {
          showToast('Simulation Active', 'Subscription updated successfully for testing.', 'success');
        }
        window.location.href = data.url;
      } else {
        showToast('Checkout Error', data.error || 'Failed to initialize Stripe Checkout.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface antialiased py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Transparent Membership
          </div>
          <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-background tracking-tight font-semibold">
            Select Your Fairway<span className="text-primary">Kind</span> Plan
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Gain full entry into monthly prize draws while funding your preferred verified charity.
          </p>
        </div>

        {/* Plan Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-surface-container border border-outline-variant/40">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Monthly ($29/mo)
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Yearly ($290/yr — Save 17%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Plan Feature Summary */}
          <div className="md:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-surface-container">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold capitalize">{billingCycle} Membership</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Full platform access &amp; monthly draw entries</p>
              </div>
              <div className="text-right">
                <span className="font-headline-lg text-headline-lg font-bold text-primary">${price}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-body-sm text-on-surface">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Log official Stableford golf scores (1–45 point range)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Full entry into 5-match (40%), 4-match (35%), 3-match (25%) prize pools</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Unclaimed 5-match pool automatically rolls over to next month</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Official winner score proof verification and payout tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Minimum 10% (and up to 100%) directly remitted to your chosen charity</span>
              </div>
            </div>
          </div>

          {/* Charity Customizer */}
          <div className="md:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-floating-shadow space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed/30 text-primary font-label-sm text-label-sm font-semibold">
                <Heart className="w-3.5 h-3.5" />
                Charity Customizer
              </div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Select Cause &amp; Contribution</h3>
            </div>

            <Select
              label="Target Non-Profit Charity"
              value={selectedCharity}
              onChange={(e) => setSelectedCharity(e.target.value)}
              options={[
                { value: 'c1000000-0000-0000-0000-000000000001', label: 'Akshaya Patra Foundation — Nutritious mid-day school meals' },
                { value: 'c2000000-0000-0000-0000-000000000002', label: 'CRY – Child Rights and You — Child education & healthcare' },
                { value: 'c3000000-0000-0000-0000-000000000003', label: 'Goonj — Community development & disaster relief' },
                { value: 'c4000000-0000-0000-0000-000000000004', label: 'Teach For India — Underserved schools education' },
                { value: 'c5000000-0000-0000-0000-000000000005', label: 'Smile Foundation — Education & livelihood development' },
              ]}
            />

            <div className="space-y-2">
              <div className="flex justify-between text-body-sm font-body-sm">
                <span className="text-on-surface font-medium">Voluntary Contribution %</span>
                <span className="text-primary font-bold">{charityPercent}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={charityPercent}
                onChange={(e) => setCharityPercent(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-surface-variant rounded-lg"
              />
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Min 10% Required</span>
                <span>100% Maximum</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-body-sm flex items-center justify-between">
              <span className="text-on-surface-variant">{billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Grant to Charity:</span>
              <span className="text-primary font-bold text-base">${charityAmount}</span>
            </div>

            <Button
              variant="primary"
              className="w-full h-12 rounded-full font-semibold"
              isLoading={isLoading}
              onClick={handleCheckout}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Subscribe to FairwayKind
            </Button>

            <p className="text-xs text-center text-on-surface-variant flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              256-bit SSL encrypted • Instant online cancellation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
