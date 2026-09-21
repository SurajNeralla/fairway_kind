"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heart, ShieldCheck, CreditCard, RefreshCw, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Subscription, Charity } from '@/lib/types';
import { getStatusBadgeVariant } from '@/lib/subscription/access';
import { LoadingState } from '@/components/ui/LoadingState';

function SubscriptionManager() {
  const searchParams = useSearchParams();
  const statusQuery = searchParams.get('status');
  const { showToast } = useToast();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [voluntaryPercent, setVoluntaryPercent] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch User Subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (subData) {
          setSubscription(subData as Subscription);
          setSelectedCharityId(subData.charity_id || '');
          setVoluntaryPercent(subData.voluntary_charity_percent || 10);
        }

        // Fetch Charities Catalog
        const { data: charitiesData } = await supabase
          .from('charities')
          .select('*')
          .eq('is_active', true);

        if (charitiesData && charitiesData.length > 0) {
          setCharities(charitiesData as Charity[]);
          if (!selectedCharityId) setSelectedCharityId(charitiesData[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (statusQuery === 'success' || statusQuery === 'simulated_success') {
      showToast('Subscription Active!', 'Thank you for supporting Digital Heroes.', 'success');
    }
  }, [statusQuery]);

  const handleUpdateCharitySettings = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('subscriptions')
        .update({
          charity_id: selectedCharityId || null,
          voluntary_charity_percent: voluntaryPercent,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        showToast('Update Failed', error.message, 'error');
      } else {
        showToast('Settings Saved', 'Charity allocation updated successfully.', 'success');
        await fetchData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenStripePortal = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      const data = await res.json();

      if (data.url) {
        if (data.simulated) {
          showToast('Portal Action Simulated', 'Subscription cancellation state toggled.', 'info');
          await fetchData();
        } else {
          window.location.href = data.url;
        }
      } else {
        showToast('Portal Error', data.error || 'Could not open Billing Portal', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateState = async (targetStatus: 'active' | 'past_due' | 'canceled') => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: `cus_simulated_${user.id.substring(0, 6)}`,
        stripe_subscription_id: `sub_simulated_${Date.now()}`,
        plan_type: 'monthly',
        status: targetStatus,
        charity_id: selectedCharityId || null,
        voluntary_charity_percent: voluntaryPercent,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: targetStatus === 'canceled',
        updated_at: new Date().toISOString(),
      });

      showToast('State Simulated', `Subscription status set to ${targetStatus.toUpperCase()}`, 'info');
      await fetchData();
    } catch (err: any) {
      showToast('Simulation Error', err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading subscription data..." fullPage />;
  }

  const status = subscription?.status || 'incomplete';
  const badgeVariant = getStatusBadgeVariant(status);
  const monthlyPrice = subscription?.plan_type === 'yearly' ? 24.16 : 29;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Subscription & Billing</h1>
            <Badge variant={badgeVariant}>{status.toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Manage your plan membership, voluntary charity contribution, and Stripe payment methods.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          isLoading={isProcessing}
          onClick={handleOpenStripePortal}
          leftIcon={<CreditCard className="w-4 h-4 text-[#00F0FF]" />}
        >
          Manage via Stripe Portal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Active Plan Card */}
        <Card variant="glass" className="md:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Current Plan</span>
              <h3 className="text-lg font-bold text-white capitalize">
                {subscription?.plan_type || 'Monthly'} Hero Subscription
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-white">${monthlyPrice.toFixed(0)}</span>
              <span className="text-xs text-slate-400">/mo</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Status</span>
              <Badge variant={badgeVariant}>{status}</Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Current Period Start</span>
              <span className="text-slate-200 font-mono">
                {subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Renewal / End Date</span>
              <span className="text-slate-200 font-mono">
                {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Auto-Renew Status</span>
              <span className={subscription?.cancel_at_period_end ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                {subscription?.cancel_at_period_end ? 'Cancels at period end' : 'Renews Automatically'}
              </span>
            </div>
          </div>

          {subscription?.cancel_at_period_end && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Your subscription is scheduled to expire at the end of the current period.</span>
            </div>
          )}
        </Card>

        {/* Charity Allocation Card */}
        <Card variant="glow" className="md:col-span-5 space-y-6">
          <div className="space-y-1">
            <Badge variant="emerald">Voluntary Allocation</Badge>
            <h3 className="text-base font-bold text-white">Charity Grant Settings</h3>
          </div>

          <Select
            label="Selected Charity"
            value={selectedCharityId}
            onChange={(e) => setSelectedCharityId(e.target.value)}
            options={
              charities.length > 0
                ? charities.map((c) => ({ value: c.id, label: c.name }))
                : [
                    { value: 'c1', label: 'Youth on Course Foundation' },
                    { value: 'c2', label: 'Clean Oceans & Coastal Wetlands' },
                    { value: 'c3', label: 'St. Jude Children’s Research Hospital' },
                  ]
            }
          />

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Voluntary Grant Percentage</span>
              <span className="text-emerald-400 font-bold">{voluntaryPercent}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={voluntaryPercent}
              onChange={(e) => setVoluntaryPercent(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Min 10%</span>
              <span>100% Max</span>
            </div>
          </div>

          <Button
            variant="charity"
            className="w-full text-xs"
            isLoading={isProcessing}
            onClick={handleUpdateCharitySettings}
          >
            Save Charity Allocation
          </Button>

          {/* Dev Simulation Suite */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Dev Mode Status Simulators</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleSimulateState('active')}
                className="py-1 px-2 text-[10px] rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900"
              >
                Set Active
              </button>
              <button
                onClick={() => handleSimulateState('past_due')}
                className="py-1 px-2 text-[10px] rounded bg-amber-950 border border-amber-500/30 text-amber-400 hover:bg-amber-900"
              >
                Set Past Due
              </button>
              <button
                onClick={() => handleSimulateState('canceled')}
                className="py-1 px-2 text-[10px] rounded bg-rose-950 border border-rose-500/30 text-rose-400 hover:bg-rose-900"
              >
                Set Canceled
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading subscription manager..." fullPage />}>
      <SubscriptionManager />
    </Suspense>
  );
}
