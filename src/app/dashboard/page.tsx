"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FairwayKindLogo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';

interface ScoreItem {
  id: string;
  date: string;
  score: number;
  played_on: string;
}

export default function SubscriberDashboard() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { showToast } = useToast();

  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [charityPercent, setCharityPercent] = useState(10);
  const [charityName, setCharityName] = useState('');
  const [subStatus, setSubStatus] = useState('');
  const [subscriptionRawStatus, setSubscriptionRawStatus] = useState<string>('inactive');
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [totalWonAmount, setTotalWonAmount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [winners, setWinners] = useState<any[]>([]);
  const [drawInfo, setDrawInfo] = useState<any>(null);

  const [charityId, setCharityId] = useState<string>('');
  const [editingScore, setEditingScore] = useState<ScoreItem | null>(null);
  const [editScorePoints, setEditScorePoints] = useState('');
  const [editScoreDate, setEditScoreDate] = useState('');
  const [isEditingScore, setIsEditingScore] = useState(false);

  // Inline form state
  const today = new Date().toISOString().split('T')[0];
  const [inlineDate, setInlineDate] = useState(today);
  const [inlinePoints, setInlinePoints] = useState('');

  // Modal form state
  const [modalDate, setModalDate] = useState(today);
  const [modalPoints, setModalPoints] = useState('');

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Fairway Golfer';

  const loadDashboardSummary = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      if (res.ok && data) {
        if (data.subscription?.charity_id) {
          setCharityId(data.subscription.charity_id);
        }
        if (data.activeScores && data.activeScores.length > 0) {
          const mappedScores: ScoreItem[] = data.activeScores.map((s: any) => ({
            id: s.id,
            date: new Date(s.played_on + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            score: s.score,
            played_on: s.played_on,
          }));
          setScores(mappedScores);
        } else {
          setScores([]);
        }
        if (data.subscription?.voluntary_charity_percent) {
          setCharityPercent(data.subscription.voluntary_charity_percent);
        }
        const charityDisplayName = data.stats?.charityName || (data.subscription as any)?.charities?.name || '';
        if (charityDisplayName) {
          setCharityName(charityDisplayName);
        }
        if (data.subscription?.status) {
          setSubscriptionRawStatus(data.subscription.status);
          const planLabel = data.subscription.plan_type === 'yearly' ? 'Yearly' : 'Monthly';
          const statusLabel = data.subscription.status === 'active' ? 'Active'
            : data.subscription.status === 'past_due' ? 'Past Due'
            : data.subscription.status === 'canceled' ? 'Cancelled'
            : data.subscription.status === 'trialing' ? 'Trial'
            : data.subscription.status;
          setSubStatus(`${planLabel} Plan — ${statusLabel}`);
          setCancelAtPeriodEnd(data.subscription.cancel_at_period_end || false);
          setRenewalDate(data.subscription.current_period_end || null);
        } else {
          setSubscriptionRawStatus('inactive');
          setSubStatus('No Active Plan');
          setRenewalDate(null);
        }
        if (data.stats?.totalWon !== undefined) {
          setTotalWonAmount(data.stats.totalWon);
        }
        if (data.winners) {
          setWinners(data.winners);
        }
        if (data.publishedDraws && data.publishedDraws.length > 0) {
          setDrawInfo(data.publishedDraws[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    }
  };

  useEffect(() => {
    loadDashboardSummary();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged Out', 'You have been signed out.', 'info');
      router.push('/login');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(inlinePoints, 10);
    if (isNaN(pts) || pts < 1 || pts > 45) {
      showToast('Invalid Score', 'Stableford points must be between 1 and 45.', 'error');
      return;
    }
    if (!inlineDate) {
      showToast('Date Required', 'Please enter the date of the round.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: pts,
          played_on: inlineDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Score Saved!', 'Score added to your rolling 5 entries.', 'success');
        setInlinePoints('');
        setInlineDate(today);
        await loadDashboardSummary();
      } else {
        showToast('Error', data.error || 'Failed to submit score.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Score submit error', 'error');
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(modalPoints, 10);
    if (isNaN(pts) || pts < 1 || pts > 45) {
      showToast('Invalid Score', 'Stableford points must be between 1 and 45.', 'error');
      return;
    }
    if (!modalDate) {
      showToast('Date Required', 'Please enter the date of the round.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: pts,
          played_on: modalDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Score Added!', 'Score saved to your rolling 5 entries.', 'success');
        setModalOpen(false);
        setModalPoints('');
        setModalDate(today);
        await loadDashboardSummary();
      } else {
        showToast('Error', data.error || 'Failed to submit score.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Score submit error', 'error');
    }
  };

  const handleDeleteScore = async (id: string) => {
    try {
      const res = await fetch(`/api/scores?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Round Deleted', 'Round score removed from rolling 5 history.', 'info');
        await loadDashboardSummary();
      } else {
        setScores(prev => prev.filter(s => s.id !== id));
      }
    } catch {
      setScores(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleIncreaseCharity = async () => {
    const next = charityPercent >= 50 ? 10 : charityPercent + 5;
    setCharityPercent(next);
    if (charityId) {
      try {
        const res = await fetch('/api/charities/select', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ charityId, voluntaryPercent: next }),
        });
        if (res.ok) {
          showToast('Charity Allocation Updated', `Your monthly contribution has been updated to ${next}%.`, 'success');
          await loadDashboardSummary();
        } else {
          const errData = await res.json();
          showToast('Notice', errData.error || 'Failed to persist charity allocation.', 'error');
        }
      } catch (err: any) {
        showToast('Error', err.message || 'Update failed', 'error');
      }
    } else {
      showToast('Charity Allocation Updated', `Your monthly contribution has been updated to ${next}%.`, 'success');
    }
  };

  const handleOpenEditModal = (score: ScoreItem) => {
    setEditingScore(score);
    setEditScorePoints(score.score.toString());
    setEditScoreDate(score.played_on);
  };

  const handleEditScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScore) return;
    const pts = parseInt(editScorePoints, 10);
    if (isNaN(pts) || pts < 1 || pts > 45) {
      showToast('Invalid Score', 'Stableford points must be between 1 and 45.', 'error');
      return;
    }
    if (!editScoreDate) {
      showToast('Date Required', 'Please enter round date.', 'error');
      return;
    }

    setIsEditingScore(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingScore.id,
          score: pts,
          played_on: editScoreDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Score Updated!', 'Score modified in your rolling 5 entries.', 'success');
        setEditingScore(null);
        await loadDashboardSummary();
      } else {
        showToast('Error', data.error || 'Failed to update score.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Score update error', 'error');
    } finally {
      setIsEditingScore(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased h-full flex flex-row overflow-hidden min-h-screen">
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="docked left-0 top-0 h-screen w-64 flex flex-col bg-surface-container-low border-r border-outline-variant/30 flex-shrink-0 z-30 select-none">
        <div className="w-64 h-full p-4 flex flex-col justify-between">
          {/* Brand & Primary Nav */}
          <div className="flex flex-col gap-6">
            {/* Logo Area */}
            <div className="px-2 pt-2 pb-1 flex items-center justify-between">
              <Link href="/">
                <FairwayKindLogo className="h-12 w-auto" />
              </Link>
            </div>

            {/* Quick CTA Button from SideNavBar spec */}
            <div className="px-1">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-primary-container text-on-primary py-2.5 px-4 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 hover:bg-primary transition-all duration-150 active:scale-[0.98] shadow-sm font-semibold"
              >
                <span className="material-symbols-outlined text-lg leading-none">add</span>
                <span>Add Score</span>
              </button>
            </div>

            {/* Tab Items */}
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98] ${
                  activeTab === 'overview'
                    ? 'bg-surface-container-highest text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-primary">dashboard</span>
                <span className="font-label-md text-label-md">Overview</span>
              </button>

              <Link
                href="/dashboard/scores"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">golf_course</span>
                <span className="font-label-md text-label-md">My Scores</span>
              </Link>

              <Link
                href="/dashboard/charity"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">volunteer_activism</span>
                <span className="font-label-md text-label-md">My Charity</span>
              </Link>

              <Link
                href="/dashboard/draws"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">celebration</span>
                <span className="font-label-md text-label-md">Draws</span>
                <span className="ml-auto bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  4d
                </span>
              </Link>

              <Link
                href="/dashboard/winnings"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">emoji_events</span>
                <span className="font-label-md text-label-md">Winnings</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-secondary"></span>
              </Link>

              <Link
                href="/dashboard/subscription"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">settings</span>
                <span className="font-label-md text-label-md">Settings</span>
              </Link>
            </nav>
          </div>

          {/* Footer & Subscriber Pill */}
          <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/30">
            <div className="flex flex-col gap-0.5">
              <a
                href="mailto:support@fairwaykind.com"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2 flex items-center gap-3 transition-colors duration-150 text-body-sm font-body-sm"
              >
                <span className="material-symbols-outlined text-lg">help_outline</span>
                <span className="font-label-md text-label-md">Support</span>
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-xl px-3 py-2 flex items-center gap-3 transition-colors duration-150 text-body-sm font-body-sm"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                <span className="font-label-md text-label-md">Log Out</span>
              </button>
            </div>

            {/* Subscriber Pill with Active Member Badge */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm border border-outline-variant/40">
                  {userName.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-surface-container-lowest rounded-full"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-sm font-semibold truncate text-on-surface">
                    {userName}
                  </span>
                </div>
                <span className="inline-flex items-center text-[10px] font-bold text-primary tracking-wide">
                  {subStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
        {/* Top Sticky Header Bar */}
        <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 lg:px-10 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md text-headline-sm text-on-surface font-semibold">
                Welcome back, {userName.split(' ')[0]}.
              </h1>
              <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-md text-[11px] border border-outline-variant/40">
                Draw in 4 days
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Your next monthly draw entries lock on Oct 31 at 23:59 PT.
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Charity Impact Pill */}
            <Link
              href="/dashboard/charity"
              className="flex items-center gap-2 bg-[#FBF6E9] border border-[#E9DCB6] hover:bg-[#f5ebd2] px-3.5 py-1.5 rounded-full text-secondary shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-secondary text-base">volunteer_activism</span>
              <span className="font-label-md text-label-md text-on-secondary-fixed-variant font-medium">
                Supporting {charityName} ({charityPercent}% allocation)
              </span>
            </Link>

            {/* Add Score Trigger */}
            <button
              onClick={() => setModalOpen(true)}
              className="bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-lg leading-none">add_circle</span>
              <span>Add Score</span>
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="px-6 lg:px-10 py-8 flex flex-col gap-8 max-w-[1360px] w-full">
          {/* ================= 3. TOP METRICS ROW ================= */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Subscription Status */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-outline-variant transition-colors">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-outline font-semibold">
                  Subscription Status
                </span>
                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                    subscriptionRawStatus === 'active'
                      ? 'bg-primary ring-4 ring-primary-fixed/30'
                      : subscriptionRawStatus === 'past_due'
                      ? 'bg-amber-500 ring-4 ring-amber-500/20'
                      : subscriptionRawStatus === 'canceled'
                      ? 'bg-rose-500 ring-4 ring-rose-500/20'
                      : 'bg-outline ring-4 ring-outline/20'
                  }`}></span>
                  <span className={`font-headline-sm text-headline-sm font-semibold uppercase ${
                    subscriptionRawStatus === 'active'
                      ? 'text-primary'
                      : subscriptionRawStatus === 'past_due'
                      ? 'text-amber-600 dark:text-amber-400'
                      : subscriptionRawStatus === 'canceled'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-outline'
                  }`}>
                    {subscriptionRawStatus === 'active' ? 'ACTIVE' : subscriptionRawStatus === 'past_due' ? 'PAST DUE' : subscriptionRawStatus === 'canceled' ? 'CANCELLED' : 'INACTIVE'}
                  </span>
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                  {subStatus || 'No Active Plan'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>{cancelAtPeriodEnd ? 'Expires' : 'Next Renewal'}</span>
                <span className="font-semibold text-on-surface">
                  {renewalDate ? new Date(renewalDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>

            {/* Charitable Impact to Date */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-outline-variant transition-colors">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-outline font-semibold">
                  Impact Contributed
                </span>
                <span className="material-symbols-outlined text-secondary text-xl">favorite</span>
              </div>
              <div className="mt-4">
                <div className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  {charityPercent}% Allocation
                </div>
                <p className="font-label-md text-label-md text-primary font-medium mt-1">
                  Minimum 10% of subscription fee
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between gap-2 text-body-sm text-on-surface-variant">
                <span className="shrink-0">Beneficiary</span>
                <span className="font-semibold text-on-surface truncate text-right">{charityName || 'No charity selected'}</span>
              </div>
            </div>

            {/* Next Monthly Draw Pool */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-outline-variant transition-colors relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary-fixed/20 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-outline font-semibold">
                  Next Draw Pool
                </span>
                <span className="material-symbols-outlined text-secondary text-xl">stars</span>
              </div>
              <div className="mt-4">
                <div className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  {drawInfo ? `$${Number(drawInfo.total_prize_pool || 0).toLocaleString()}` : 'Accumulating'}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FBF6E9] text-secondary border border-[#E9DCB6]">
                    {drawInfo ? `Draw ${drawInfo.period_month}/${drawInfo.period_year}` : 'Next Monthly Draw'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">Prize Pool Split</span>
                <span className="font-semibold text-secondary-fixed-dim dark:text-secondary flex items-center gap-1">
                  40% / 35% / 25%
                </span>
              </div>
            </div>

            {/* Current Handicap / Stableford Avg */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-outline-variant transition-colors">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm tracking-wider uppercase text-outline font-semibold">
                  Avg Stableford (5 Rds)
                </span>
                <span className="material-symbols-outlined text-primary text-xl">analytics</span>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                    {(scores.reduce((a, b) => a + b.score, 0) / (scores.length || 1)).toFixed(1)}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant">pts / round</span>
                </div>
                <p className="font-label-md text-label-md text-[#2E5A44] font-medium mt-1">
                  {scores.length > 0 ? '100% Verified Attestations' : 'No scores yet'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>Draw Status</span>
                <span className="font-semibold text-primary inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                  {scores.length}/5 Entries Valid
                </span>
              </div>
            </div>
          </section>

          {/* ================= 4. DEDICATED SECTIONS PORTAL ================= */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Member Modules &amp; Services</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Each service is managed on its own dedicated page, just like the Settings page.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: My Scores */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">golf_course</span>
                    </div>
                    <span className="bg-surface-container text-on-surface-variant font-label-sm text-xs px-3 py-1 rounded-full font-bold">
                      {scores.length}/5 Scores
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      My Golf Scores
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Log your official Stableford scores (1–45) and track your rolling 5 active rounds for draw qualification.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Avg Stableford:</span>
                    <span className="font-bold text-primary">
                      {(scores.reduce((a, b) => a + b.score, 0) / (scores.length || 1)).toFixed(1)} pts
                    </span>
                  </div>
                </div>
                <div className="pt-6 border-t border-surface-container mt-6">
                  <Link
                    href="/dashboard/scores"
                    className="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Open Scores Page</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Card 2: My Charity */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-secondary/40 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8EFEA] text-[#1B4332] flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
                    </div>
                    <span className="bg-[#E8EFEA] text-[#1B4332] font-label-sm text-xs px-3 py-1 rounded-full font-bold">
                      {charityPercent}% Allocation
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-secondary transition-colors">
                      My Charity Partner
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Supporting <strong className="text-on-surface">{charityName || 'Selected Cause'}</strong>. Customize your voluntary allocation (10% to 100%).
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Monthly Impact:</span>
                    <span className="font-bold text-primary">
                      ${((29 * charityPercent) / 100).toFixed(2)}/mo
                    </span>
                  </div>
                </div>
                <div className="pt-6 border-t border-surface-container mt-6">
                  <Link
                    href="/dashboard/charity"
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-outline-variant/30"
                  >
                    <span>Open Charity Page</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Card 3: Draws */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-fixed/40 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">celebration</span>
                    </div>
                    <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs px-3 py-1 rounded-full font-bold">
                      End of Month
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      Monthly Draws
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Check your draw qualification, active 5-stroke participation tickets, winning numbers, and prize splits.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Draw Status:</span>
                    <span className={`font-bold ${scores.length === 5 ? 'text-primary' : 'text-outline'}`}>
                      {scores.length === 5 ? 'Qualified (5/5)' : `${scores.length}/5 Scores`}
                    </span>
                  </div>
                </div>
                <div className="pt-6 border-t border-surface-container mt-6">
                  <Link
                    href="/dashboard/draws"
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-outline-variant/30"
                  >
                    <span>Open Draws Page</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Card 4: Winnings */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-secondary flex items-center justify-center border border-outline-variant/30">
                      <span className="material-symbols-outlined text-2xl">emoji_events</span>
                    </div>
                    <span className="bg-surface-container text-on-surface-variant font-label-sm text-xs px-3 py-1 rounded-full font-bold">
                      {winners.length} Won
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      My Winnings &amp; Payouts
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Submit scorecard proof, track compliance audit reviews, and monitor direct bank prize disbursements.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Total Won:</span>
                    <span className="font-bold text-secondary">${totalWonAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-surface-container mt-6">
                  <Link
                    href="/dashboard/winnings"
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-outline-variant/30"
                  >
                    <span>Open Winnings Page</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Card 5: Settings */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-on-surface flex items-center justify-center border border-outline-variant/30">
                      <span className="material-symbols-outlined text-2xl">settings</span>
                    </div>
                    <span className="bg-primary-fixed/30 text-primary font-label-sm text-xs px-3 py-1 rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      Subscription &amp; Settings
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      Manage your plan membership, Stripe billing portal, payment cards, and account preferences.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Billing Plan:</span>
                    <span className="font-bold text-on-surface">{subStatus.split('—')[0] || 'Monthly Plan'}</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-surface-container mt-6">
                  <Link
                    href="/dashboard/subscription"
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-outline-variant/30"
                  >
                    <span>Open Settings Page</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ================= EDITORIAL FOOTER ================= */}
          <footer className="mt-8 border-t border-outline-variant/30 py-10 text-on-surface-variant">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="text-headline-sm font-headline-sm font-semibold text-primary">FairwayKind</span>
                <span className="text-outline">|</span>
                <span className="text-body-sm text-outline">Feel, Not Fairway.</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-label-sm">
                <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
                <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
                <Link href="/charities" className="hover:text-primary transition-colors">Charity Partners</Link>
                <span className="hover:text-primary transition-colors cursor-pointer">Responsible Play</span>
                <a href="#impact" className="hover:text-primary transition-colors">Impact Report</a>
                <a href="mailto:support@fairwaykind.com" className="hover:text-primary transition-colors">Contact Us</a>
              </div>
            </div>
            <div className="mt-6 text-center md:text-left text-xs text-outline leading-relaxed">
              © 2024 FairwayKind Technologies Inc. All rights reserved. Skill-based performance draws with philanthropic allocation; strictly non-gambling mechanics.
            </div>
          </footer>
        </div>
      </main>

      {/* ================= ADD SCORE MODAL PANEL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative transform transition-all">
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-outline hover:text-on-surface p-2 rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] text-[#2E5A44] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">golf_course</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Add Attested Round</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Stableford scoring • Range: 1–45 points</p>
              </div>
            </div>

            {/* Form inside modal */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Date Played</label>
                <input
                  type="date"
                  required
                  max={today}
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Stableford Score (1–45)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={modalPoints}
                  onChange={(e) => setModalPoints(e.target.value)}
                  placeholder="e.g. 38"
                  className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
                <span className="text-[11px] text-outline mt-1 block">Valid range: 1–45. One score per date. Duplicate dates will be rejected.</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-on-surface-variant hover:text-on-surface font-label-md text-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-xl transition-all duration-150 active:scale-[0.98] shadow-sm font-semibold"
                >
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT SCORE MODAL PANEL ================= */}
      {editingScore && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative transform transition-all">
            <button
              onClick={() => setEditingScore(null)}
              className="absolute top-5 right-5 text-outline hover:text-on-surface p-2 rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFEA] text-[#2E5A44] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">edit</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Edit Attested Score</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Update score or date played for this round</p>
              </div>
            </div>

            <form onSubmit={handleEditScore} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Date Played</label>
                <input
                  type="date"
                  required
                  max={today}
                  value={editScoreDate}
                  onChange={(e) => setEditScoreDate(e.target.value)}
                  className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Stableford Score (1–45)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={editScorePoints}
                  onChange={(e) => setEditScorePoints(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingScore(null)}
                  className="px-4 py-2.5 text-on-surface-variant hover:text-on-surface font-label-md text-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingScore}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-xl transition-all duration-150 active:scale-[0.98] shadow-sm font-semibold"
                >
                  {isEditingScore ? 'Updating...' : 'Update Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
