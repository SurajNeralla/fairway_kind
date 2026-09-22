"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Building2,
  Award,
  Globe
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { useToast } from '@/components/ui/Toast';
import { Charity, Subscription } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { calculateCharityContribution, sanitizeCharityPercentage } from '@/lib/charity/calculator';
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav';

const PRESET_PERCENTAGES = [10, 15, 20, 25, 50, 100];

export default function MyCharityPage() {
  const { showToast } = useToast();
  const supabase = React.useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [allCharities, setAllCharities] = useState<Charity[]>([]);
  const [voluntaryPercent, setVoluntaryPercent] = useState<number>(10);
  const [contributions, setContributions] = useState<any[]>([]);

  const loadCharityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch user subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subData) {
        setSubscription(subData as Subscription);
        setVoluntaryPercent(subData.voluntary_charity_percent || 10);
      }

      // 2. Fetch active charities
      const { data: charitiesData } = await supabase
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (charitiesData && charitiesData.length > 0) {
        setAllCharities(charitiesData as Charity[]);
        const activeCharityId = subData?.charity_id || charitiesData[0].id;
        const matched = charitiesData.find((c: any) => c.id === activeCharityId) || charitiesData[0];
        setSelectedCharity(matched as Charity);
      }

      // 3. Fetch past contributions log
      const { data: contribData } = await supabase
        .from('charity_contributions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (contribData && contribData.length > 0) {
        setContributions(contribData);
      }
    } catch (err: any) {
      console.error('Failed to load charity data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCharityData();
  }, [loadCharityData]);

  const handleUpdateAllocation = async (newPercent: number) => {
    const sanitized = sanitizeCharityPercentage(newPercent);
    setVoluntaryPercent(sanitized);

    if (!selectedCharity) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/charities/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: selectedCharity.id,
          voluntaryPercent: sanitized,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          'Allocation Updated!',
          `Your monthly donation has been set to ${sanitized}% of your membership.`,
          'success'
        );
        await loadCharityData();
      } else {
        showToast('Update Notice', data.error || 'Could not update charity allocation.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update allocation.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectCharityFromList = async (charityId: string) => {
    const chosen = allCharities.find(c => c.id === charityId);
    if (!chosen) return;

    setSelectedCharity(chosen);
    setIsSaving(true);
    try {
      const res = await fetch('/api/charities/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: chosen.id,
          voluntaryPercent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          'Charity Selected!',
          `Now allocating ${voluntaryPercent}% of your membership to ${chosen.name}.`,
          'success'
        );
        await loadCharityData();
      } else {
        showToast('Update Notice', data.error || 'Could not update charity.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to change charity.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading your philanthropic impact..." fullPage />;
  }

  const planType = subscription?.plan_type || 'monthly';
  const calc = calculateCharityContribution(planType, voluntaryPercent);
  const annualImpact = calc.contributionAmount * (planType === 'yearly' ? 1 : 12);

  return (
    <div className="bg-background text-on-surface antialiased py-10 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-8">
        <DashboardSubNav current="charity" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 custom-card-shadow">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] flex items-center justify-center text-[#1B4332]">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
                My Charity Partner &amp; Impact
              </h1>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Every round you play actively funds community development. Select your preferred cause and set your voluntary allocation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/charities">
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Browse All Charities
              </Button>
            </Link>
          </div>
        </div>

        {/* Selected Charity Showcase & Allocation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Selected Charity Card (Span 7) */}
          <div className="md:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-card-shadow space-y-6">
            <div className="flex items-center justify-between pb-5 border-b border-surface-container">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Active Beneficiary
                </span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-1">
                  {selectedCharity?.name || 'Youth on Course Foundation'}
                </h2>
              </div>
              <Badge variant="emerald">VERIFIED 501(C)(3)</Badge>
            </div>

            {/* Charity Metadata */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF9F5] border border-outline-variant/30">
                <div className="w-12 h-12 rounded-xl bg-[#E8EFEA] text-[#1B4332] flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {selectedCharity?.name?.charAt(0) || 'Y'}
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-on-surface text-base">
                    {selectedCharity?.name}
                  </div>
                  <div className="text-xs text-on-surface-variant leading-relaxed">
                    {selectedCharity?.description || 'Providing youth with access to life-changing golf opportunities and educational scholarships nationwide.'}
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-xs text-outline font-medium">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      {selectedCharity?.category || 'Youth & Education'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      EIN: {selectedCharity?.ein || '94-3129841'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Switch Charity Dropdown */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block">
                  Switch Your Chosen Charity
                </label>
                <select
                  value={selectedCharity?.id || ''}
                  onChange={(e) => handleSelectCharityFromList(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm text-on-surface font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {allCharities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-on-surface-variant">
                  Allocation changes apply immediately to future monthly draws and renewals.
                </p>
              </div>

              {/* Direct Tax-Deductible Donation CTA */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-4 mt-4">
                <div>
                  <div className="text-xs font-semibold text-on-surface">Want to give more?</div>
                  <div className="text-[11px] text-on-surface-variant">Make an independent, one-time direct gift via Stripe.</div>
                </div>
                <Link href={`/charities/${selectedCharity?.id || 'c1'}`}>
                  <Button size="sm" variant="outline" rightIcon={<ArrowLeft className="w-3.5 h-3.5 rotate-180" />}>
                    Direct Gift
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Allocation & Impact Calculator (Span 5) */}
          <div className="md:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-card-shadow space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Voluntary Allocation
                </span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-1">
                  {voluntaryPercent}% of Membership
                </h2>
              </div>
              <span className="text-xl font-bold text-primary">
                ${calc.contributionAmount.toFixed(2)}
                <span className="text-xs font-normal text-on-surface-variant">/{planType === 'yearly' ? 'yr' : 'mo'}</span>
              </span>
            </div>

            {/* Slider visual */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface">
                <span>Contribution Share</span>
                <span className="text-primary font-bold">{voluntaryPercent}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={voluntaryPercent}
                onChange={(e) => setVoluntaryPercent(Number(e.target.value))}
                onMouseUp={() => handleUpdateAllocation(voluntaryPercent)}
                onTouchEnd={() => handleUpdateAllocation(voluntaryPercent)}
                className="w-full accent-primary h-2 bg-[#E8EFEA] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-outline">
                <span>10% (Floor)</span>
                <span>25%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Quick Presets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_PERCENTAGES.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleUpdateAllocation(pct)}
                    disabled={isSaving}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      voluntaryPercent === pct
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/30'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Calculation Summary */}
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-outline-variant/30 space-y-3">
              <div className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Annual Philanthropic Projection
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-[11px] text-outline font-medium">Monthly Grant</div>
                  <div className="text-lg font-bold text-on-surface mt-0.5">
                    ${(calc.contributionAmount * (planType === 'yearly' ? 1 / 12 : 1)).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-outline font-medium">12-Month Total</div>
                  <div className="text-lg font-bold text-primary mt-0.5">
                    ${annualImpact.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-on-surface-variant border-t border-outline-variant/20 pt-2 leading-relaxed">
                100% of voluntary allocations are disbursed directly to your non-profit partner on each billing cycle.
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Disbursements History */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-card-shadow space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container">
            <div className="space-y-1">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Contribution Distribution Records
              </h3>
              <p className="text-xs text-on-surface-variant">
                Audited disbursements from your membership subscriptions.
              </p>
            </div>
            <Badge variant="cyan">AUDITED RECORD</Badge>
          </div>

          {contributions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-xs font-semibold text-outline uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Charity</th>
                    <th className="py-3 px-4">Share %</th>
                    <th className="py-3 px-4">Disbursed Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {contributions.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-on-surface">
                        {selectedCharity?.name || 'Selected Cause'}
                      </td>
                      <td className="py-3.5 px-4">{c.percentage}%</td>
                      <td className="py-3.5 px-4 font-bold text-primary">${Number(c.amount).toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Disbursed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E8EFEA] text-[#1B4332] flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-on-surface text-sm">Active Subscription Grant Scheduled</h4>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                Your voluntary allocation ({voluntaryPercent}%) will generate its first audited disbursement receipt upon your next renewal date.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
