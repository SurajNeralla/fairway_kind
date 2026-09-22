"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, Users, Heart, Trophy, ArrowLeft, RefreshCw, DollarSign, ShieldAlert, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { useToast } from '@/components/ui/Toast';

interface ReportsData {
  userStats: {
    totalUsers: number;
    activeSubscribers: number;
    conversionRate: string;
    monthlyCount: number;
    yearlyCount: number;
    churnCount: number;
  };
  prizeStats: {
    totalPoolGenerated: number;
    tier5Total: number;
    tier4Total: number;
    tier3Total: number;
    latestRollover: number;
    totalPaidPrizes: number;
    totalPendingPrizes: number;
  };
  charityStats: {
    totalCharityRaised: number;
    avgVoluntaryPercent: string;
    charityBreakdown: Array<{
      id: string;
      name: string;
      category: string;
      totalRaised: number;
      percentageOfTotal: string;
    }>;
    totalContributionsLogged: number;
  };
  drawStats: {
    totalDraws: number;
    totalTicketsEntered: number;
    tier5Wins: number;
    tier4Wins: number;
    tier3Wins: number;
    totalWinners: number;
  };
}

export default function AdminReportsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        showToast('Error', json.error || 'Failed to load reports', 'error');
      }
    } catch {
      showToast('Network Error', 'Could not load reports data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="bg-background text-on-surface min-h-screen py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
              title="Back to Admin Console"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-secondary-fixed/40 text-secondary font-label-sm text-label-sm font-bold uppercase">
                Regulatory &amp; Operations
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface font-headline-md mt-1">
                Platform Reports &amp; Live Analytics
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={fetchReports}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            Refresh Analytics
          </Button>
        </div>

        {isLoading ? (
          <Card variant="solid" className="p-16 bg-surface-container-lowest border border-outline-variant/30">
            <LoadingState message="Aggregating live subscription, draw, and charity metrics..." />
          </Card>
        ) : data ? (
          <div className="space-y-8">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card variant="solid" className="p-6 bg-surface-container-lowest border border-outline-variant/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Members</span>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-on-surface">{data.userStats.totalUsers}</div>
                <p className="text-xs text-on-surface-variant mt-1">
                  {data.userStats.activeSubscribers} active subscribers ({data.userStats.conversionRate} rate)
                </p>
              </Card>

              <Card variant="solid" className="p-6 bg-surface-container-lowest border border-outline-variant/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Prize Pool Generated</span>
                  <Trophy className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-primary">${data.prizeStats.totalPoolGenerated.toLocaleString()}</div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Rollover reserve: ${data.prizeStats.latestRollover.toLocaleString()}
                </p>
              </Card>

              <Card variant="solid" className="p-6 bg-surface-container-lowest border border-outline-variant/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Charity Distributed</span>
                  <Heart className="w-5 h-5 text-tertiary" />
                </div>
                <div className="text-3xl font-bold text-on-surface">${data.charityStats.totalCharityRaised.toLocaleString()}</div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Average allocation: {data.charityStats.avgVoluntaryPercent}
                </p>
              </Card>

              <Card variant="solid" className="p-6 bg-surface-container-lowest border border-outline-variant/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Prizes Paid Out</span>
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-secondary">${data.prizeStats.totalPaidPrizes.toLocaleString()}</div>
                <p className="text-xs text-on-surface-variant mt-1">
                  ${data.prizeStats.totalPendingPrizes.toLocaleString()} pending scorecard review
                </p>
              </Card>
            </div>

            {/* Grid 2: Subscriptions & Draws */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Subscription Breakdown */}
              <Card variant="solid" className="p-6 bg-surface-container-lowest border border-outline-variant/30 space-y-4">
                <h3 className="text-lg font-bold text-on-surface font-headline-sm">Subscription Membership Health</h3>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <span className="text-xs font-medium text-on-surface">Monthly Subscribers ($29/mo)</span>
                    <span className="font-bold text-primary">{data.userStats.monthlyCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <span className="text-xs font-medium text-on-surface">Yearly Subscribers ($290/yr)</span>
                    <span className="font-bold text-primary">{data.userStats.yearlyCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <span className="text-xs font-medium text-on-surface">Canceled / Lapsed Subscriptions</span>
                    <span className="font-bold text-error">{data.userStats.churnCount}</span>
                  </div>
                </div>
              </Card>

              {/* Draw Statistics */}
              <Card variant="solid" className="p-6 bg-surface-container-lowest border border-outline-variant/30 space-y-4">
                <h3 className="text-lg font-bold text-on-surface font-headline-sm">Draw System Metrics</h3>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <span className="text-xs font-medium text-on-surface">Total Official Draws</span>
                    <span className="font-bold text-on-surface">{data.drawStats.totalDraws}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <span className="text-xs font-medium text-on-surface">Total Tickets Evaluated</span>
                    <span className="font-bold text-on-surface">{data.drawStats.totalTicketsEntered}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <span className="text-xs font-medium text-on-surface">Total Winners (3, 4, &amp; 5 Matches)</span>
                    <span className="font-bold text-secondary">
                      {data.drawStats.totalWinners} ({data.drawStats.tier5Wins} Grand, {data.drawStats.tier4Wins} Tier 4, {data.drawStats.tier3Wins} Tier 3)
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charity Breakdown Table */}
            <Card variant="solid" className="p-6 bg-surface-container-lowest border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface font-headline-sm">Partner Charity Contributions Breakdown</h3>
                  <p className="text-xs text-on-surface-variant">Live funds attributed and distributed to verified 501(c)(3) entities.</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-fixed/30 px-3 py-1 rounded-full">
                  {data.charityStats.totalContributionsLogged} Allocations Logged
                </span>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-semibold">Charity Partner</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold text-right">Total Raised</th>
                      <th className="py-3 px-4 font-semibold text-right">Share of Giving</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container text-body-sm">
                    {data.charityStats.charityBreakdown.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-on-surface">{c.name}</td>
                        <td className="py-3.5 px-4 text-xs text-on-surface-variant">{c.category}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-primary">${c.totalRaised.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-secondary">{c.percentageOfTotal}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
