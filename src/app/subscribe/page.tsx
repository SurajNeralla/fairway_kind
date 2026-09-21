"use client";

import React, { useState } from 'react';
import { Check, ArrowRight, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

export default function SubscribePage() {
  const { showToast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [charityPercent, setCharityPercent] = useState<number>(10);
  const [selectedCharity, setSelectedCharity] = useState('c1000000-0000-0000-0000-000000000001');
  const [isLoading, setIsLoading] = useState(false);

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
          showToast('Dev Simulation Active', 'Subscription updated successfully for testing.', 'success');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="cyan">Membership Plans</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Select Your Digital Heroes Plan
        </h1>
        <p className="text-sm text-slate-400">
          Gain full entry into monthly prize pools ($25k+) while funding your preferred charity.
        </p>
      </div>

      {/* Plan Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all ${
              billingCycle === 'monthly' ? 'bg-[#00F0FF] text-[#090D16]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly ($29/mo)
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all ${
              billingCycle === 'yearly' ? 'bg-[#00F0FF] text-[#090D16]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Yearly ($290/yr — Save 17%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Plan Feature Summary */}
        <Card variant="glass" className="md:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white capitalize">{billingCycle} Membership</h3>
              <p className="text-xs text-slate-400">Full platform access & monthly draw tickets</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-white">${price}</span>
              <span className="text-xs text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Log up to 5 Stableford golf scores (1–45 range)</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full entry into 5-match (40%), 4-match (35%), 3-match (25%) prize pools</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unclaimed 5-match jackpot rolls over to next month</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant winner proof submission and ACH bank payout workflow</span>
            </div>
          </div>
        </Card>

        {/* Charity Customizer */}
        <Card variant="glow" className="md:col-span-5 space-y-6">
          <div className="space-y-1">
            <Badge variant="emerald">Charity Customizer</Badge>
            <h3 className="text-base font-bold text-white">Select Cause & Contribution</h3>
          </div>

          <Select
            label="Target Non-Profit Charity"
            value={selectedCharity}
            onChange={(e) => setSelectedCharity(e.target.value)}
            options={[
              { value: 'c1000000-0000-0000-0000-000000000001', label: 'Youth on Course Foundation' },
              { value: 'c2000000-0000-0000-0000-000000000002', label: 'Clean Oceans & Coastal Wetlands' },
              { value: 'c3000000-0000-0000-0000-000000000003', label: 'St. Jude Children’s Hospital' },
              { value: 'c4000000-0000-0000-0000-000000000004', label: 'Veterans Golf Alliance' },
            ]}
          />

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Voluntary Contribution %</span>
              <span className="text-emerald-400 font-bold">{charityPercent}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={charityPercent}
              onChange={(e) => setCharityPercent(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Min 10% Required</span>
              <span>100% Maximum</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">Grant to Charity ({billingCycle}):</span>
            <span className="text-emerald-400 font-bold text-sm">${charityAmount}</span>
          </div>

          <Button
            variant="charity"
            className="w-full"
            isLoading={isLoading}
            onClick={handleCheckout}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Proceed to Stripe Payment
          </Button>

          <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            PCI-compliant payment architecture via Stripe.
          </p>
        </Card>
      </div>
    </div>
  );
}
