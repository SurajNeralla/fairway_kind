"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Target, Heart, Trophy, Calendar, Plus, Upload, CheckCircle2,
  ShieldCheck, AlertTriangle, Edit3, Trash2, CreditCard, RefreshCw,
  ExternalLink, Sparkles, Eye, Clock, XCircle, ArrowRight, Bell, Shield
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import { useToast } from '@/components/ui/Toast';
import { GolfScore, Winner, Charity } from '@/lib/types';
import { validateScoreValue, validateScoreDate } from '@/lib/scores/score-engine';
import { calculateCharityContribution } from '@/lib/charity/calculator';

interface DashboardData {
  profile: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
  } | null;
  subscription: {
    id: string;
    user_id: string;
    plan_type: 'monthly' | 'yearly';
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
    charity_id?: string;
    voluntary_charity_percent: number;
    current_period_start?: string;
    current_period_end?: string;
    cancel_at_period_end: boolean;
    charities?: Charity;
  } | null;
  activeScores: GolfScore[];
  allScores: GolfScore[];
  drawEntries: any[];
  publishedDraws: any[];
  winners: Winner[];
  charities: Charity[];
  stats: {
    isSubscriptionActive: boolean;
    activeScoreCount: number;
    drawsEntered: number;
    totalWon: number;
    pendingWinnings: number;
    winCount: number;
    planType: string | null;
    status: string | null;
    renewalDate: string | null;
    cancelAtPeriodEnd: boolean;
    charityName: string | null;
    voluntaryPercent: number;
    monthlyPrice: number;
  };
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    action?: string;
    actionHref?: string;
  }>;
}

export default function UserDashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Score Modal States
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<GolfScore | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [scoreFormError, setScoreFormError] = useState('');
  const [isScoreSubmitting, setIsScoreSubmitting] = useState(false);

  // Delete Score Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scoreToDelete, setScoreToDelete] = useState<GolfScore | null>(null);

  // Charity Modal States
  const [charityModalOpen, setCharityModalOpen] = useState(false);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [voluntaryPercent, setVoluntaryPercent] = useState(10);
  const [isCharitySubmitting, setIsCharitySubmitting] = useState(false);

  // Proof Upload Modal States
  const [proofModalWinner, setProofModalWinner] = useState<Winner | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isProofUploading, setIsProofUploading] = useState(false);
  const [proofError, setProofError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stripe Portal Loading State
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Fetch Dashboard Summary Data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/summary');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load dashboard.');
      }
      setData(json);
      if (json.subscription) {
        setSelectedCharityId(json.subscription.charity_id || (json.charities?.[0]?.id || ''));
        setVoluntaryPercent(json.subscription.voluntary_charity_percent || 10);
      }
    } catch (err: any) {
      console.error('Error loading dashboard summary:', err);
      setError(err.message || 'Could not connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- Score Management Handlers ---
  const openAddScoreModal = () => {
    setEditingScore(null);
    setScoreInput('');
    setDateInput(new Date().toISOString().split('T')[0]);
    setScoreFormError('');
    setScoreModalOpen(true);
  };

  const openEditScoreModal = (scoreItem: GolfScore) => {
    setEditingScore(scoreItem);
    setScoreInput(scoreItem.score.toString());
    setDateInput(scoreItem.played_on);
    setScoreFormError('');
    setScoreModalOpen(true);
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreFormError('');

    const numScore = Number(scoreInput);
    const scoreVal = validateScoreValue(numScore);
    if (!scoreVal.isValid) {
      setScoreFormError(scoreVal.error || 'Invalid score.');
      return;
    }

    const otherDates = (data?.allScores || [])
      .filter((s) => s.id !== editingScore?.id)
      .map((s) => s.played_on);

    const dateVal = validateScoreDate(dateInput, otherDates);
    if (!dateVal.isValid) {
      setScoreFormError(dateVal.error || 'Invalid played date.');
      return;
    }

    setIsScoreSubmitting(true);
    try {
      const isEditing = Boolean(editingScore);
      const res = await fetch('/api/scores', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingScore?.id,
          score: numScore,
          played_on: dateInput,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setScoreFormError(json.error || 'Failed to save score.');
        showToast('Error', json.error || 'Could not save score.', 'error');
      } else {
        showToast(
          isEditing ? 'Score Updated' : 'Score Added!',
          isEditing ? 'Golf score updated successfully.' : 'New score logged into your rolling 5.',
          'success'
        );
        setScoreModalOpen(false);
        await fetchDashboardData();
      }
    } catch (err: any) {
      setScoreFormError(err.message || 'Network error.');
    } finally {
      setIsScoreSubmitting(false);
    }
  };

  const confirmDeleteScore = (scoreItem: GolfScore) => {
    setScoreToDelete(scoreItem);
    setDeleteModalOpen(true);
  };

  const handleDeleteScore = async () => {
    if (!scoreToDelete) return;
    setIsScoreSubmitting(true);
    try {
      const res = await fetch(`/api/scores?id=${scoreToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        showToast('Delete Failed', json.error || 'Could not delete score.', 'error');
      } else {
        showToast('Score Deleted', 'Golf score removed successfully.', 'info');
        setDeleteModalOpen(false);
        setScoreToDelete(null);
        await fetchDashboardData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsScoreSubmitting(false);
    }
  };

  // --- Charity Management Handlers ---
  const handleSaveCharity = async () => {
    if (!selectedCharityId) {
      showToast('Selection Required', 'Please select a charity cause.', 'error');
      return;
    }

    setIsCharitySubmitting(true);
    try {
      const res = await fetch('/api/charities/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: selectedCharityId,
          voluntaryPercent,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast('Error', json.error || 'Could not update charity settings.', 'error');
      } else {
        showToast('Charity Updated!', json.message, 'success');
        setCharityModalOpen(false);
        await fetchDashboardData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsCharitySubmitting(false);
    }
  };

  // --- Proof Upload Handlers ---
  const handleUploadProof = async () => {
    if (!proofModalWinner || !proofFile) {
      setProofError('Please choose a scorecard proof file.');
      return;
    }

    setIsProofUploading(true);
    setProofError('');
    try {
      const formData = new FormData();
      formData.append('proof', proofFile);

      const res = await fetch(`/api/winners/${proofModalWinner.id}/proof`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setProofError(json.error || 'Proof upload failed.');
        showToast('Upload Failed', json.error, 'error');
      } else {
        showToast('Proof Submitted!', 'Your scorecard proof has been submitted for admin review.', 'success');
        setProofModalWinner(null);
        setProofFile(null);
        await fetchDashboardData();
      }
    } catch (err: any) {
      setProofError(err.message || 'Upload error.');
    } finally {
      setIsProofUploading(false);
    }
  };

  // --- Stripe Billing Portal Handler ---
  const handleOpenStripePortal = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      const json = await res.json();
      if (json.url) {
        if (json.simulated) {
          showToast('Portal Simulated', 'Subscription state toggled.', 'info');
          await fetchDashboardData();
        } else {
          window.location.href = json.url;
        }
      } else {
        showToast('Portal Error', json.error || 'Could not open billing portal.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsPortalLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Dashboard Unavailable"
          message={error || 'Unable to load your subscriber dashboard data.'}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  const {
    profile,
    subscription,
    activeScores,
    publishedDraws,
    winners,
    charities,
    stats,
    notifications,
  } = data;

  const currentPlanLabel = subscription?.plan_type === 'yearly' ? 'Yearly Hero' : 'Monthly Hero';
  const renewalDateFormatted = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-IE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  const upcomingDraw = publishedDraws?.[0];
  const currentCharity = subscription?.charities || charities.find((c) => c.id === subscription?.charity_id);

  // Charity calculation
  const charityCalc = calculateCharityContribution(
    subscription?.plan_type || 'monthly',
    subscription?.voluntary_charity_percent || 10
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ── Contextual Notification Banners ── */}
      {notifications && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                n.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  : n.type === 'warning'
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                  : n.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">{n.title}</h4>
                  <p className="text-xs opacity-90 mt-0.5">{n.message}</p>
                </div>
              </div>
              {n.action && n.actionHref && (
                <Link href={n.actionHref}>
                  <Button
                    variant={n.type === 'error' ? 'danger' : n.type === 'warning' ? 'gold' : 'primary'}
                    size="sm"
                    className="shrink-0 text-xs"
                  >
                    {n.action}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Subscriber Overview Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'}!
            </h1>
            <Badge
              variant={
                stats.isSubscriptionActive
                  ? 'emerald'
                  : stats.status === 'past_due'
                  ? 'amber'
                  : 'rose'
              }
            >
              {stats.isSubscriptionActive ? 'Active Subscriber' : (stats.status || 'No Subscription').toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Member since{' '}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('en-IE', {
                  month: 'short',
                  year: 'numeric',
                })
              : '2026'}{' '}
            • {profile?.email}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openAddScoreModal}
          >
            Add Golf Score
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchDashboardData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── 4 KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Scores */}
        <Card variant="glass" className="space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Scores</span>
            <Target className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <span className="block text-2xl font-extrabold text-white">
            {activeScores.length} / 5
          </span>
          <span className={`text-[10px] font-medium block ${activeScores.length === 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {activeScores.length === 5 ? '✓ Fully Qualified for Draw' : `${5 - activeScores.length} more needed`}
          </span>
        </Card>

        {/* Target Charity */}
        <Card variant="glass" className="space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Charity</span>
            <Heart className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="block text-base font-bold text-white truncate">
            {currentCharity?.name || 'No Charity Selected'}
          </span>
          <span className="text-[10px] text-emerald-400 font-medium block">
            {stats.voluntaryPercent}% Voluntary Grant (${charityCalc.contributionAmount.toFixed(2)}/mo)
          </span>
        </Card>

        {/* Next Draw */}
        <Card variant="glass" className="space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Draw Entry</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <span className="block text-xl font-extrabold text-amber-400">
            {upcomingDraw ? `Period ${upcomingDraw.period_month}/${upcomingDraw.period_year}` : 'Next Monthly Draw'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {upcomingDraw ? `Est. Pool: $${upcomingDraw.total_prize_pool.toLocaleString()}` : 'Entry active with 5 scores'}
          </span>
        </Card>

        {/* Total Winnings */}
        <Link href="/dashboard/winners" className="block transition-transform hover:scale-[1.02]">
          <Card variant="glass" className="space-y-2 h-full border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Winnings</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <span className="block text-2xl font-extrabold text-amber-400">
              ${stats.totalWon.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium block">
              {stats.pendingWinnings > 0
                ? `$${stats.pendingWinnings.toLocaleString()} Pending Verification →`
                : 'View Winnings Portal →'}
            </span>
          </Card>
        </Link>
      </div>

      {/* ── Golf Score Section (Rolling 5 & CRUD) ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Active 5 Golf Scores</h2>
              <Badge variant="cyan">{activeScores.length} / 5 Active</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Stableford format (1–45 points). Only 1 score per date allowed. Adding a 6th score automatically replaces your oldest date score.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={openAddScoreModal}
          >
            Log Score
          </Button>
        </div>

        {activeScores.length === 0 ? (
          <EmptyState
            title="No Golf Scores Logged"
            description="Log your latest 5 Stableford scores to qualify your ticket for the upcoming monthly draw."
            actionLabel="Add Your First Score"
            onAction={openAddScoreModal}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {activeScores.map((item, idx) => (
                <Card
                  key={item.id}
                  variant="glass"
                  className="space-y-2 text-center relative overflow-hidden group hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                      Score #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditScoreModal(item)}
                        className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors"
                        title="Edit Score"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDeleteScore(item)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Score"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <span className="block text-3xl font-extrabold text-white group-hover:text-[#00F0FF] transition-colors">
                    {item.score}
                  </span>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-[#00F0FF]" />
                    <span>{item.played_on}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-semibold">
                    Active Ticket Number
                  </div>
                </Card>
              ))}

              {/* Empty placeholder slots if < 5 */}
              {Array.from({ length: Math.max(0, 5 - activeScores.length) }).map((_, i) => (
                <div
                  key={i}
                  onClick={openAddScoreModal}
                  className="p-4 rounded-2xl border border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-900/30 flex flex-col items-center justify-center space-y-2 text-center cursor-pointer transition-colors min-h-[140px]"
                >
                  <Plus className="w-6 h-6 text-slate-600 hover:text-[#00F0FF]" />
                  <span className="text-xs text-slate-500 font-medium">Add Score #{activeScores.length + i + 1}</span>
                  <span className="text-[10px] text-slate-600">Needed to qualify</span>
                </div>
              ))}
            </div>

            {/* Active Ticket Banner */}
            {activeScores.length === 5 && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Sparkles className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span>
                    Your active 5-score ticket numbers for the next draw:{' '}
                    <strong className="font-mono text-white tracking-wider">
                      [{activeScores.map((s) => s.score).join(', ')}]
                    </strong>
                  </span>
                </div>
                <Link href="/dashboard/scores">
                  <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300">
                    Manage Full Score History →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2-Column: Subscription & Charity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Subscription Card */}
        <Card variant="glass" className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Membership Plan</span>
              <h3 className="text-lg font-bold text-white capitalize">
                {currentPlanLabel}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-white">${stats.monthlyPrice.toFixed(0)}</span>
              <span className="text-xs text-slate-400">/mo</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Subscription Status</span>
              <Badge
                variant={
                  stats.isSubscriptionActive
                    ? 'emerald'
                    : stats.status === 'past_due'
                    ? 'amber'
                    : 'rose'
                }
              >
                {(stats.status || 'inactive').toUpperCase()}
              </Badge>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Renewal / Period End</span>
              <span className="text-slate-200 font-mono">{renewalDateFormatted}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Auto-Renewal</span>
              <span className={subscription?.cancel_at_period_end ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                {subscription?.cancel_at_period_end ? 'Expires at period end' : 'Renews Automatically'}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-400">Draw Eligibility</span>
              <span className={stats.isSubscriptionActive ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                {stats.isSubscriptionActive ? '✓ Eligible' : '✗ Inactive — Subscribe to Enter'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={isPortalLoading}
              onClick={handleOpenStripePortal}
              leftIcon={<CreditCard className="w-3.5 h-3.5 text-[#00F0FF]" />}
            >
              Manage via Stripe Portal
            </Button>
            <Link href="/dashboard/subscription">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                View Billing Details →
              </Button>
            </Link>
          </div>
        </Card>

        {/* Charity Card */}
        <Card variant="glow" className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Voluntary Giving</span>
              <h3 className="text-lg font-bold text-white">
                {currentCharity?.name || 'Charity Cause'}
              </h3>
            </div>
            <Badge variant="emerald">{stats.voluntaryPercent}% Grant</Badge>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {currentCharity?.description || 'Your voluntary contribution is automatically granted from your membership fee.'}
          </p>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="text-white font-semibold">{currentCharity?.category || 'General Giving'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Your Monthly Contribution:</span>
              <span className="text-emerald-400 font-extrabold font-mono">
                ${charityCalc.contributionAmount.toFixed(2)}/mo
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Raised by Community:</span>
              <span className="text-white font-mono">
                ${(currentCharity?.total_raised || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="charity"
              size="sm"
              leftIcon={<Heart className="w-3.5 h-3.5" />}
              onClick={() => setCharityModalOpen(true)}
            >
              Change Charity & Allocation
            </Button>
            <Link href="/charities">
              <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                Browse All Charities →
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Draw Participation Section ── */}
      <Card variant="glass" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Monthly Draw Participation</h2>
            </div>
            <p className="text-xs text-slate-400">
              Total draws entered: <strong>{stats.drawsEntered}</strong> • Monthly draws are deterministic and auditable.
            </p>
          </div>
          <Link href="/dashboard/draws">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Full Draw History
            </Button>
          </Link>
        </div>

        {publishedDraws && publishedDraws.length > 0 ? (
          <div className="space-y-4">
            {publishedDraws.slice(0, 2).map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="gold" size="sm">Period {d.period_month}/{d.period_year}</Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(d.draw_date).toLocaleDateString('en-IE', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{d.title}</h4>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Winning 5:</span>
                    <div className="flex gap-1.5">
                      {(d.winning_numbers || [10, 20, 30, 40, 45]).map((n: number, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-950 border border-amber-500/30 text-amber-300 font-bold text-xs"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-[10px] text-slate-500 uppercase font-mono">Total Prize Pool</span>
                  <span className="block text-xl font-extrabold text-amber-400">
                    ${d.total_prize_pool.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Published Draws Yet"
            description="Draw results are published at the end of each monthly period. Ensure you have 5 active scores logged to participate!"
          />
        )}
      </Card>

      {/* ── Winnings & Verification Center ── */}
      <Card variant="glass" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Prize Winnings & Verification Portal</h2>
            </div>
            <p className="text-xs text-slate-400">
              Submit scorecard proof for your prize wins to unlock payout.
            </p>
          </div>
          <Link href="/dashboard/winners">
            <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Winnings Console
            </Button>
          </Link>
        </div>

        {winners.length === 0 ? (
          <EmptyState
            title="No Prize Wins Yet"
            description="You haven't won any draws yet. Keep your 5 scores updated — your lucky match could be next month!"
            icon={<Trophy className="w-10 h-10 text-slate-600" />}
          />
        ) : (
          <div className="space-y-3">
            {winners.map((w) => {
              const canUploadProof = w.proof_status === 'pending_submission' || w.proof_status === 'rejected';

              return (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/30 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="gold" size="sm">
                        {w.prize_tier.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge
                        variant={
                          w.proof_status === 'approved'
                            ? 'emerald'
                            : w.proof_status === 'submitted'
                            ? 'cyan'
                            : w.proof_status === 'rejected'
                            ? 'rose'
                            : 'amber'
                        }
                        size="sm"
                      >
                        {w.proof_status === 'pending_submission'
                          ? 'Proof Required'
                          : w.proof_status === 'submitted'
                          ? 'Under Admin Review'
                          : w.proof_status === 'approved'
                          ? 'Proof Approved'
                          : 'Proof Rejected'}
                      </Badge>
                      <Badge variant={w.payout_status === 'paid' ? 'emerald' : 'slate'} size="sm">
                        {w.payout_status === 'paid' ? 'Paid ✓' : `Payout: ${w.payout_status}`}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {(w as any).draws?.title || 'Monthly Draw Win'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {w.match_count} matching numbers • Prize:{' '}
                      <strong className="text-amber-400 font-extrabold text-sm">
                        ${w.prize_amount.toLocaleString()}
                      </strong>
                    </p>

                    {w.proof_status === 'rejected' && w.admin_notes && (
                      <div className="mt-1 p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 text-[11px] text-rose-300">
                        Admin Note: {w.admin_notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {canUploadProof && (
                      <Button
                        variant={w.proof_status === 'rejected' ? 'danger' : 'primary'}
                        size="sm"
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setProofModalWinner(w);
                          setProofFile(null);
                          setProofError('');
                        }}
                      >
                        {w.proof_status === 'rejected' ? 'Re-upload Proof' : 'Upload Proof'}
                      </Button>
                    )}
                    <Link href="/dashboard/winners">
                      <Button variant="ghost" size="sm" className="text-xs text-slate-300">
                        Details →
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Modal: Add / Edit Golf Score ── */}
      <Modal
        isOpen={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        title={editingScore ? 'Edit Golf Score' : 'Log New Golf Score'}
        maxWidth="md"
      >
        <form onSubmit={handleScoreSubmit} className="space-y-5">
          {scoreFormError && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{scoreFormError}</span>
            </div>
          )}

          <Input
            label="Stableford Score (1–45 points)"
            type="number"
            min={1}
            max={45}
            placeholder="e.g. 38"
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            helperText="Points must be between 1 and 45 inclusive."
            required
          />

          <Input
            label="Date Played"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            helperText="Only one score allowed per day. Future dates prohibited."
            required
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant={editingScore ? 'gold' : 'primary'}
              className="flex-1"
              isLoading={isScoreSubmitting}
            >
              {editingScore ? 'Update Score' : 'Submit to Rolling 5'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setScoreModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Delete Score Confirmation ── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Golf Score"
        maxWidth="sm"
      >
        {scoreToDelete && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Are you sure you want to delete this score?
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
              Score: <strong>{scoreToDelete.score} points</strong> on <strong>{scoreToDelete.played_on}</strong>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="danger"
                className="flex-1"
                isLoading={isScoreSubmitting}
                onClick={handleDeleteScore}
              >
                Confirm Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal: Change Charity & Allocation ── */}
      <Modal
        isOpen={charityModalOpen}
        onClose={() => setCharityModalOpen(false)}
        title="Change Charity & Voluntary Grant"
        maxWidth="md"
      >
        <div className="space-y-5">
          <Select
            label="Select Charity Partner"
            value={selectedCharityId}
            onChange={(e) => setSelectedCharityId(e.target.value)}
            options={charities.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.category})`,
            }))}
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
              <span>10% (Minimum)</span>
              <span>100% (Full Membership Grant)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex justify-between items-center">
            <span>Estimated Grant:</span>
            <span className="text-emerald-400 font-bold font-mono">
              ${calculateCharityContribution(subscription?.plan_type || 'monthly', voluntaryPercent).contributionAmount.toFixed(2)}/mo
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="charity"
              className="flex-1"
              isLoading={isCharitySubmitting}
              onClick={handleSaveCharity}
            >
              Save Charity Grant
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCharityModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Upload Winner Proof ── */}
      <Modal
        isOpen={!!proofModalWinner}
        onClose={() => setProofModalWinner(null)}
        title="Upload Scorecard Proof"
        maxWidth="md"
      >
        {proofModalWinner && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs space-y-1">
              <p className="font-bold text-amber-300">
                Prize Win: ${proofModalWinner.prize_amount.toLocaleString()} ({proofModalWinner.prize_tier.replace('_', ' ').toUpperCase()})
              </p>
              <p className="text-slate-400">
                Upload your official scorecard or handicap certificate to verify your score.
              </p>
            </div>

            {proofError && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{proofError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select File (PDF, JPG, PNG, WEBP • Max 5MB)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setProofFile(file);
                }}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
              />
              {proofFile && (
                <p className="mt-2 text-xs text-emerald-400 font-medium">
                  Selected: {proofFile.name} ({(proofFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="gold"
                className="flex-1"
                isLoading={isProofUploading}
                onClick={handleUploadProof}
                disabled={!proofFile}
              >
                Submit Proof for Verification
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setProofModalWinner(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
