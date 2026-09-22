"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heart, ShieldCheck, CreditCard, RefreshCw, AlertTriangle, ArrowRight, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { Subscription, Charity } from '@/lib/types';
import { getStatusBadgeVariant } from '@/lib/subscription/access';
import { LoadingState } from '@/components/ui/LoadingState';
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav';

function SubscriptionManager() {
  const searchParams = useSearchParams();
  const statusQuery = searchParams.get('status');
  const sessionId = searchParams.get('session_id');
  const { showToast } = useToast();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [voluntaryPercent, setVoluntaryPercent] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const supabase = React.useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch User Subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subData) {
          setSubscription(subData as Subscription);
          setSelectedCharityId(prev => prev || subData.charity_id || '');
          setVoluntaryPercent(subData.voluntary_charity_percent || 10);
        }

        // Fetch Charities Catalog
        const { data: charitiesData } = await supabase
          .from('charities')
          .select('*')
          .eq('is_active', true);

        if (charitiesData && charitiesData.length > 0) {
          setCharities(charitiesData as Charity[]);
          setSelectedCharityId(prev => prev || charitiesData[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const syncAndLoad = async () => {
      if (statusQuery === 'success' || sessionId) {
        try {
          await fetch('/api/subscriptions/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (isMounted) {
            showToast('Subscription Active!', 'Thank you for supporting FairwayKind.', 'success');
          }
        } catch (e) {
          console.error('Auto sync error:', e);
        }
      }
      if (isMounted) {
        await fetchData();
      }
    };

    syncAndLoad();

    return () => {
      isMounted = false;
    };
  }, [fetchData, statusQuery, sessionId, showToast]);

  const handleUpdateCharitySettings = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/charities/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: selectedCharityId,
          voluntaryPercent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('Update Failed', data.error || 'Failed to update charity settings', 'error');
      } else {
        showToast('Settings Saved', `Charity allocation updated to ${voluntaryPercent}%.`, 'success');
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
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast('Portal Error', data.error || 'Failed to open billing portal.', 'error');
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
      const res = await fetch('/api/subscriptions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          charityId: selectedCharityId || null,
          voluntaryPercent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update simulation state');
      }

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
    <div className="bg-background text-on-surface antialiased py-10">
      <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-6">
        <DashboardSubNav current="settings" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 custom-card-shadow">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Subscription & Billing</h1>
              <Badge variant={badgeVariant}>{status.toUpperCase()}</Badge>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Manage your plan membership, voluntary charity contribution, and payment methods.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            isLoading={isProcessing}
            onClick={handleOpenStripePortal}
            leftIcon={<CreditCard className="w-4 h-4 text-primary" />}
          >
            Manage via Stripe Portal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Active Plan Card */}
          <div className="md:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-card-shadow space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-surface-container">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Current Plan</span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface capitalize mt-1">
                  {subscription?.plan_type || 'Monthly'} FairwayKind Membership
                </h3>
              </div>
              <div className="text-right">
                <span className="font-headline-lg text-headline-lg font-bold text-primary">${monthlyPrice.toFixed(0)}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">/mo</span>
              </div>
            </div>

            <div className="space-y-3.5 text-body-sm font-body-sm">
              <div className="flex justify-between py-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Status</span>
                <Badge variant={badgeVariant}>{status}</Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Current Period Start</span>
                <span className="text-on-surface font-medium">
                  {subscription?.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-container">
                <span className="text-on-surface-variant">Renewal / End Date</span>
                <span className="text-on-surface font-medium">
                  {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-on-surface-variant">Auto-Renew Status</span>
                <span className={subscription?.cancel_at_period_end ? 'text-error font-semibold' : 'text-primary font-semibold'}>
                  {subscription?.cancel_at_period_end ? 'Cancels at period end' : 'Renews Automatically'}
                </span>
              </div>
            </div>

            {subscription?.cancel_at_period_end && (
              <div className="p-4 rounded-2xl bg-error-container text-body-sm text-on-error-container flex items-center gap-2.5 border border-error/30">
                <AlertTriangle className="w-5 h-5 text-error shrink-0" />
                <span>Your membership is scheduled to expire at the end of the current billing cycle.</span>
              </div>
            )}
          </div>

          {/* Charity Allocation Card */}
          <div className="md:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-floating-shadow space-y-6">
            <div className="space-y-1">
              <Badge variant="emerald">Voluntary Allocation</Badge>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Charity Grant Settings</h3>
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
              <div className="flex justify-between text-body-sm font-body-sm">
                <span className="text-on-surface font-medium">Voluntary Grant Percentage</span>
                <span className="text-primary font-bold">{voluntaryPercent}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={voluntaryPercent}
                onChange={(e) => setVoluntaryPercent(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-surface-variant rounded-lg"
              />
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Min 10%</span>
                <span>100% Max</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full h-11 rounded-xl font-semibold"
              isLoading={isProcessing}
              onClick={handleUpdateCharitySettings}
            >
              Save Charity Allocation
            </Button>

            {/* Simulation Suite */}
            <div className="pt-4 border-t border-surface-container space-y-2">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Dev Status Simulator</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSimulateState('active')}
                  className="py-1.5 px-2 text-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold border border-outline-variant/40"
                >
                  Set Active
                </button>
                <button
                  onClick={() => handleSimulateState('past_due')}
                  className="py-1.5 px-2 text-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-semibold border border-outline-variant/40"
                >
                  Set Past Due
                </button>
                <button
                  onClick={() => handleSimulateState('canceled')}
                  className="py-1.5 px-2 text-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-error font-semibold border border-outline-variant/40"
                >
                  Set Canceled
                </button>
              </div>
            </div>
          </div>
        </div>
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
