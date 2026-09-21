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
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [totalWonAmount, setTotalWonAmount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [winners, setWinners] = useState<any[]>([]);
  const [drawInfo, setDrawInfo] = useState<any>(null);

  // Inline form state
  const today = new Date().toISOString().split('T')[0];
  const [inlineDate, setInlineDate] = useState(today);
  const [inlinePoints, setInlinePoints] = useState('');

  // Modal form state
  const [modalDate, setModalDate] = useState(today);
  const [modalPoints, setModalPoints] = useState('');

  const userName = profile?.full_name || 'Marcus Vance';

  const loadDashboardSummary = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      if (res.ok && data) {
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
          const planLabel = data.subscription.plan_type === 'yearly' ? 'Yearly' : 'Monthly';
          const statusLabel = data.subscription.status === 'active' ? 'Active'
            : data.subscription.status === 'past_due' ? 'Past Due'
            : data.subscription.status === 'canceled' ? 'Cancelled'
            : data.subscription.status === 'trialing' ? 'Trial'
            : data.subscription.status;
          setSubStatus(`${planLabel} Plan — ${statusLabel}`);
          setCancelAtPeriodEnd(data.subscription.cancel_at_period_end || false);
          setRenewalDate(data.subscription.current_period_end || null);
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

  const handleIncreaseCharity = () => {
    const next = charityPercent >= 50 ? 10 : charityPercent + 5;
    setCharityPercent(next);
    showToast('Charity Allocation Updated', `Your monthly contribution has been updated to ${next}%.`, 'success');
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

              <a
                href="#scores-section"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">golf_course</span>
                <span className="font-label-md text-label-md">My Scores</span>
              </a>

              <a
                href="#charity-section"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">volunteer_activism</span>
                <span className="font-label-md text-label-md">My Charity</span>
              </a>

              <a
                href="#draws-section"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">celebration</span>
                <span className="font-label-md text-label-md">Draws</span>
                <span className="ml-auto bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  4d
                </span>
              </a>

              <a
                href="#winnings-section"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">emoji_events</span>
                <span className="font-label-md text-label-md">Winnings</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-secondary"></span>
              </a>

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
            <div className="flex items-center gap-2 bg-[#FBF6E9] border border-[#E9DCB6] px-3.5 py-1.5 rounded-full text-secondary shadow-xs">
              <span className="material-symbols-outlined text-secondary text-base">volunteer_activism</span>
              <span className="font-label-md text-label-md text-on-secondary-fixed-variant font-medium">
                Supporting {charityName} ({charityPercent}% allocation)
              </span>
            </div>

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
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-fixed-dim ring-4 ring-primary-fixed/30"></span>
                  <span className="font-headline-sm text-headline-sm font-semibold text-primary">ACTIVE</span>
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                  {subStatus}
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
                  Index 8.2 • 100% Verified Attestations
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

          {/* ================= 4. QUICK INLINE ADD SCORE FORM ================= */}
          <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 lg:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-outline-variant/20">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Add Golf Score</h2>
                  <span className="bg-[#E8EFEA] text-[#2E5A44] font-label-md text-label-md px-2.5 py-0.5 rounded-full font-semibold">
                    Stableford 1–45 Pts
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Log your Stableford score and round date. Your latest 5 scores are retained automatically.
                </p>
              </div>
              <div className="flex items-center gap-2 text-label-md font-label-md text-outline">
                <span className="material-symbols-outlined text-base text-primary">info</span>
                <span>Max 5 rolling scores • 1 per date</span>
              </div>
            </div>

            <form onSubmit={handleInlineSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-4 items-end">
              {/* Date Played */}
              <div className="lg:col-span-4">
                <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-medium">Date of Round</label>
                <input
                  type="date"
                  value={inlineDate}
                  max={today}
                  onChange={(e) => setInlineDate(e.target.value)}
                  className="w-full h-12 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  required
                />
              </div>

              {/* Stableford Points */}
              <div className="lg:col-span-4">
                <label className="block font-label-md text-label-md text-on-surface mb-1.5 font-medium">Stableford Score (1–45)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={inlinePoints}
                    onChange={(e) => setInlinePoints(e.target.value)}
                    placeholder="e.g. 38"
                    className="w-full h-12 pl-3.5 pr-10 bg-surface rounded-xl border border-outline-variant/60 font-body-md text-body-md font-semibold text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    required
                  />
                  <span className="absolute right-3 top-3 text-outline text-xs font-bold uppercase">PTS</span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="lg:col-span-4">
                <button
                  type="submit"
                  className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98] shadow-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  <span>Add Score</span>
                </button>
              </div>
            </form>

            <div className="mt-3 text-xs text-on-surface-variant pt-2 border-t border-surface-container">
              One score per date allowed. Duplicate dates will be rejected. Score must be between 1 and 45.
            </div>
          </section>

          {/* ================= 5 & 6. BENTO GRID: 5 SCORES + CHARITY ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Rolling 5-Score History (Span 8) */}
            <section className="lg:col-span-8 flex flex-col gap-4" id="scores-section">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Rolling 5-Score History</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Active entries counting toward October monthly draw &amp; ranking average.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-lg text-xs font-semibold">
                    Last {scores.length} of 5 Verified
                  </span>
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xs overflow-hidden">
                {scores.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline mb-3 block">sports_score</span>
                    <p className="font-label-lg text-label-lg text-on-surface-variant">No scores yet.</p>
                    <p className="text-xs text-outline mt-1">Add your first Stableford score using the form above.</p>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-5 font-semibold">Date Played</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Stableford Score</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container text-body-sm">
                      {scores.map((s) => (
                        <tr key={s.id} className="hover:bg-surface-container-low/40 transition-colors group">
                          <td className="py-4 px-5">
                            <div className="font-semibold text-on-surface">{s.date}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#E8EFEA] text-[#2E5A44] font-headline-sm font-bold text-sm">
                              {s.score} pts
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                              <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                              Active Entry
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-1 text-on-surface-variant">
                              <button
                                onClick={() => handleDeleteScore(s.id)}
                                className="p-1.5 hover:text-error hover:bg-error-container/30 rounded-lg transition-colors"
                                title="Delete Score"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}

                <div className="p-4 bg-surface-container-low/40 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between text-body-sm text-on-surface-variant gap-2">
                  <span className="text-xs">{scores.length} of 5 active scores — newest scores replace oldest when limit is reached.</span>
                  <button 
                    onClick={() => setModalOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Add Another Score
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Right: My Charity Impact Mini-Section (Span 4) */}
            <section className="lg:col-span-4 flex flex-col gap-4" id="charity-section">
              <div>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">My Charity Allocation</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Philanthropic distribution from subscriber fees.</p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
                <div>
                  {/* Charity Badge Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-2xl text-primary">volunteer_activism</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-base font-semibold text-on-surface leading-snug">
                          {charityName || 'No charity selected'}
                        </span>
                      </div>
                      <span className="inline-flex items-center text-xs font-semibold text-secondary mt-0.5">
                        Selected Charity
                      </span>
                    </div>
                  </div>

                  {!charityName && (
                    <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      You haven&apos;t selected a charity yet. Visit your subscription settings to choose a cause.
                    </p>
                  )}

                  {/* Charity Allocation Visual */}
                  <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface">
                      <span>Your Charity Allocation</span>
                      <span className="text-primary font-bold">{charityPercent}% of subscription fee</span>
                    </div>
                    <div className="w-full bg-[#E8EFEA] h-2.5 rounded-full overflow-hidden mt-2.5">
                      <div className="bg-primary-container h-full rounded-full" style={{ width: `${charityPercent}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-outline mt-2">
                      <span>Min 10%</span>
                      <span>Max 100%</span>
                    </div>
                  </div>

                  {/* Impact stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface">
                      <div className="text-xs text-outline font-label-md">Current Share</div>
                      <div className="text-base font-bold text-on-surface mt-0.5">{charityPercent}% of Plan</div>
                    </div>
                    <div className="p-3 rounded-lg border border-outline-variant/30 bg-surface">
                      <div className="text-xs text-outline font-label-md">Matched Rounds</div>
                      <div className="text-base font-bold text-primary mt-0.5">5 Rounds ($25)</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 mt-6 pt-4 border-t border-surface-container">
                  <button
                    onClick={handleIncreaseCharity}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#E8EFEA] hover:bg-[#d8e4db] text-primary font-label-md text-label-md font-semibold transition-colors duration-150 active:scale-[0.98]"
                  >
                    Increase Contribution % ({charityPercent}%)
                  </button>
                  <Link
                    href="/charities"
                    className="w-full py-2 px-4 rounded-xl border border-outline-variant/50 hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors duration-150 text-center block"
                  >
                    Change Charity
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* ================= 7. ACTIVE DRAW & WINNINGS ================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6" id="draws-section">
            {/* Monthly Draw Eligibility Card (Span 6) */}
            <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-2xl">confirmation_number</span>
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                      Monthly Draw Participation
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${scores.length === 5 ? 'bg-[#E8EFEA] text-[#2E5A44]' : 'bg-surface-container text-outline'}`}>
                    {scores.length === 5 ? 'Qualified' : `${scores.length}/5 Scores`}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  You need 5 active scores to qualify for the monthly draw. Each score must be a valid Stableford value (1–45).
                </p>

                {/* Draw Checklist */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <span className={`material-symbols-outlined text-lg ${scores.length === 5 ? 'text-primary' : 'text-outline'}`}>
                        {scores.length === 5 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-body-sm text-on-surface font-medium">{scores.length} of 5 Scores Active</span>
                    </div>
                    <span className={`text-xs font-bold ${scores.length === 5 ? 'text-primary' : 'text-outline'}`}>
                      {scores.length === 5 ? 'Qualified' : 'Needs More Scores'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-primary text-lg">emoji_events</span>
                      <span className="text-body-sm text-on-surface font-medium">Prize Pool Tiers</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface">40% / 35% / 25%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-lg">refresh</span>
                      <span className="text-body-sm text-on-surface font-medium">Jackpot Rollover</span>
                    </div>
                    <span className="text-xs font-bold text-secondary">5-Number Match Only</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between text-xs text-outline">
                <span>5-match (40%), 4-match (35%), 3-match (25%) prize allocation</span>
                <Link href="/how-it-works" className="text-primary font-semibold hover:underline">
                  How It Works
                </Link>
              </div>
            </div>

            {/* Winnings Section (Span 6) */}
            <div
              className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
              id="winnings-section"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-2xl">trophy</span>
                    <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">My Winnings</h3>
                  </div>
                  {winners.length > 0 && (
                    <span className="bg-secondary text-on-secondary px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {winners.length} Win{winners.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {winners.length === 0 ? (
                  <div className="mt-6 text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-outline mb-3 block">emoji_events</span>
                    <p className="font-label-lg text-label-lg text-on-surface-variant">No winnings yet.</p>
                    <p className="text-xs text-outline mt-1">Qualify for the monthly draw with 5 active scores.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {winners.slice(0, 2).map((w: any) => (
                      <div key={w.id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md font-semibold text-on-surface">
                            {w.match_count}-Number Match
                          </span>
                          <span className="font-headline-sm text-headline-sm font-bold text-secondary">
                            ${Number(w.prize_amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-on-surface-variant">
                            {w.proof_status === 'approved' ? 'Verified' : w.proof_status === 'submitted' ? 'Under Review' : w.proof_status === 'rejected' ? 'Proof Rejected' : 'Awaiting Proof'}
                          </span>
                          <span className={`text-xs font-bold ${w.payout_status === 'paid' ? 'text-primary' : 'text-outline'}`}>
                            {w.payout_status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-surface-container">
                <Link
                  href="/dashboard/winners"
                  className="w-full py-2.5 px-4 rounded-xl border border-outline-variant/50 hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors text-center flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  View All Winnings & Upload Proof
                </Link>
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
    </div>
  );
}
