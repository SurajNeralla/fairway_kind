"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield, Users, Trophy, Heart, FileCheck, DollarSign, Play, RefreshCw,
  CheckCircle2, XCircle, Search, Filter, Edit3, Trash2, ArrowRight,
  TrendingUp, BarChart3, Clock, AlertTriangle, ChevronLeft, ChevronRight,
  Award, Eye, Lock, Sparkles, ExternalLink, Activity, Layers, CreditCard, Plus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { Charity, Winner } from '@/lib/types';

type AdminTab = 'overview' | 'users' | 'subscriptions' | 'draws' | 'charities' | 'winners' | 'reports';

export default function AdminControlCenterPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Overview & Activity Data
  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Users Tab State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSubFilter, setUserSubFilter] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState<'user' | 'admin'>('user');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Subscriptions Tab State
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subStatusFilter, setSubStatusFilter] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Charities Tab State
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charityModalOpen, setCharityModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [charityName, setCharityName] = useState('');
  const [charityCategory, setCharityCategory] = useState('Youth & Sports Access');
  const [charityDesc, setCharityDesc] = useState('');
  const [charityLogo, setCharityLogo] = useState('⛳');
  const [isSavingCharity, setIsSavingCharity] = useState(false);

  // Winners Preview State
  const [winners, setWinners] = useState<Winner[]>([]);

  // Reports Tab State
  const [reportsData, setReportsData] = useState<any>(null);

  // Load Overview Data
  const loadOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (res.ok) {
        setOverviewMetrics(data.metrics);
        setRecentActivity(data.recentActivity || []);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Error loading overview:', err);
      setError(err.message || 'Failed to load overview data.');
    }
  };

  // Load Users Data
  const loadUsers = async () => {
    try {
      const query = new URLSearchParams({
        search: userSearch,
        role: userRoleFilter,
        status: userSubFilter,
        page: userPage.toString(),
        limit: '15',
      });
      const res = await fetch(`/api/admin/users?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setUserTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Load Subscriptions Data
  const loadSubscriptions = async () => {
    try {
      const query = new URLSearchParams({
        status: subStatusFilter,
        search: subSearch,
      });
      const res = await fetch(`/api/admin/subscriptions?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    }
  };

  // Load Charities Data
  const loadCharities = async () => {
    try {
      const res = await fetch('/api/charities?includeInactive=true');
      const data = await res.json();
      if (res.ok) {
        setCharities(data.charities || []);
      }
    } catch (err) {
      console.error('Error loading charities:', err);
    }
  };

  // Load Winners Data
  const loadWinners = async () => {
    try {
      const res = await fetch('/api/winners');
      const data = await res.json();
      if (res.ok) {
        setWinners(data.winners || []);
      }
    } catch (err) {
      console.error('Error loading winners:', err);
    }
  };

  // Load Reports Data
  const loadReports = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (res.ok) {
        setReportsData(data);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  // Initial Data Load
  const refreshAll = async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([
      loadOverview(),
      loadUsers(),
      loadSubscriptions(),
      loadCharities(),
      loadWinners(),
      loadReports(),
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Reload Users when filters change
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [userSearch, userRoleFilter, userSubFilter, userPage]);

  // Reload Subscriptions when filters change
  useEffect(() => {
    if (activeTab === 'subscriptions') {
      loadSubscriptions();
    }
  }, [subStatusFilter, subSearch]);

  // --- User Edit Handlers ---
  const openEditUser = (user: any) => {
    setEditingUser(user);
    setEditUserName(user.full_name || '');
    setEditUserRole(user.role || 'user');
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsUpdatingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          role: editUserRole,
          fullName: editUserName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Profile Updated', data.message, 'success');
        setEditingUser(null);
        await loadUsers();
        await loadOverview();
      } else {
        showToast('Update Failed', data.error, 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // --- Charity Handlers ---
  const openAddCharity = () => {
    setEditingCharity(null);
    setCharityName('');
    setCharityCategory('Youth & Sports Access');
    setCharityDesc('');
    setCharityLogo('⛳');
    setCharityModalOpen(true);
  };

  const openEditCharity = (charity: Charity) => {
    setEditingCharity(charity);
    setCharityName(charity.name);
    setCharityCategory(charity.category);
    setCharityDesc(charity.description);
    setCharityLogo(charity.logo_url || '💙');
    setCharityModalOpen(true);
  };

  const handleSaveCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCharity(true);
    try {
      const isEdit = Boolean(editingCharity);
      const res = await fetch('/api/charities', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCharity?.id,
          name: charityName,
          category: charityCategory,
          description: charityDesc,
          logo_url: charityLogo,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? 'Charity Updated' : 'Charity Created', 'Catalog successfully updated.', 'success');
        setCharityModalOpen(false);
        await loadCharities();
        await loadOverview();
      } else {
        showToast('Error', data.error, 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSavingCharity(false);
    }
  };

  const handleDeactivateCharity = async (id: string) => {
    try {
      const res = await fetch(`/api/charities?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast('Charity Deactivated', 'Charity has been marked inactive.', 'info');
        await loadCharities();
      } else {
        showToast('Error', data.error, 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading Admin Control Suite..." fullPage />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState title="Admin Access Failed" message={error} onRetry={refreshAll} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Admin Top Navigation Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Control Center
            </h1>
            <Badge variant="gold">Root Administrator</Badge>
          </div>
          <p className="text-xs text-slate-400">
            System oversight: Users, Subscriptions, Draw Engine, Charities, Winners & Analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={refreshAll}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
          { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, count: overviewMetrics?.totalUsers },
          { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-4 h-4" />, count: overviewMetrics?.activeSubscribers },
          { id: 'draws', label: 'Draw Studio', icon: <Trophy className="w-4 h-4" /> },
          { id: 'charities', label: 'Charity Management', icon: <Heart className="w-4 h-4" />, count: charities.length },
          { id: 'winners', label: 'Winner Verification', icon: <Award className="w-4 h-4" />, count: overviewMetrics?.pendingProofsCount },
          { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/40 shadow-gold-glow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. OVERVIEW TAB                                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && overviewMetrics && (
        <div className="space-y-8">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Users', value: overviewMetrics.totalUsers, color: 'text-white' },
              { label: 'Active Subscribers', value: overviewMetrics.activeSubscribers, color: 'text-emerald-400' },
              { label: 'Prize Pool Sum', value: `$${overviewMetrics.totalPrizePoolSum.toLocaleString()}`, color: 'text-[#00F0FF]' },
              { label: 'Jackpot Rollover', value: `$${overviewMetrics.latestRollover.toLocaleString()}`, color: 'text-amber-400' },
              { label: 'Charity Raised', value: `$${overviewMetrics.totalCharityRaised.toLocaleString()}`, color: 'text-emerald-400' },
              { label: 'Total Paid Out', value: `$${overviewMetrics.totalPaidOutSum.toLocaleString()}`, color: 'text-emerald-400' },
            ].map((kpi) => (
              <Card key={kpi.label} variant="glass" className="space-y-1 text-center p-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{kpi.label}</span>
                <span className={`block text-xl font-extrabold ${kpi.color}`}>{kpi.value}</span>
              </Card>
            ))}
          </div>

          {/* Quick Actions Bar */}
          <Card variant="glow" className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Direct Control Studio</span>
              <p className="text-xs text-slate-300">Run simulations, verify winner proofs, or manage 501(c)(3) charities.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/admin/draws">
                <Button variant="gold" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />}>
                  Open Draw Studio
                </Button>
              </Link>
              <Link href="/admin/winners">
                <Button variant="primary" size="sm" leftIcon={<Award className="w-3.5 h-3.5" />}>
                  Review Proofs ({overviewMetrics.pendingProofsCount})
                </Button>
              </Link>
              <Button variant="outline" size="sm" leftIcon={<Heart className="w-3.5 h-3.5" />} onClick={openAddCharity}>
                Add Charity
              </Button>
            </div>
          </Card>

          {/* Activity & System Health Log */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Recent System Audit Logs
            </h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white">{log.action}</span>
                      <p className="text-slate-400 font-mono text-[11px]">
                        Entity: {log.entity_type} • ID: {log.entity_id?.slice(0, 8)}... • Actor: {log.actor_id?.slice(0, 8)}...
                      </p>
                    </div>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {new Date(log.created_at).toLocaleString('en-IE')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Audit Records" description="System audit actions will appear here automatically." />
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. USER MANAGEMENT TAB                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1">
              <Input
                label="Search Users"
                placeholder="Name or email address..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                label="Role Filter"
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                options={[
                  { value: '', label: 'All Roles' },
                  { value: 'user', label: 'Users Only' },
                  { value: 'admin', label: 'Admins Only' },
                ]}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Subscription State"
                value={userSubFilter}
                onChange={(e) => {
                  setUserSubFilter(e.target.value);
                  setUserPage(1);
                }}
                options={[
                  { value: '', label: 'All Subscriptions' },
                  { value: 'active', label: 'Active' },
                  { value: 'past_due', label: 'Past Due' },
                  { value: 'canceled', label: 'Canceled' },
                  { value: 'none', label: 'No Subscription' },
                ]}
              />
            </div>
          </div>

          {/* Users Table */}
          {users.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User / Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Scores (Active/5)</TableHead>
                    <TableHead>Winnings Paid</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-semibold text-white">
                        <div>
                          <span>{u.full_name || 'Unnamed Golfer'}</span>
                          <span className="block text-xs text-slate-400 font-mono">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'gold' : 'slate'}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.subscription ? (
                          <Badge variant={u.subscription.status === 'active' ? 'emerald' : 'rose'}>
                            {u.subscription.status.toUpperCase()} ({u.subscription.plan_type})
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.activeScoreCount === 5 ? 'cyan' : 'slate'}>
                          {u.activeScoreCount} / 5 Scores
                        </Badge>
                      </TableCell>
                      <TableCell className="font-extrabold text-amber-400 font-mono">
                        ${(u.totalWinnings || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditUser(u)}
                          className="text-slate-400 hover:text-[#00F0FF]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {userTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
                  <span>Page {userPage} of {userTotalPages}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={userPage >= userTotalPages}
                      onClick={() => setUserPage((p) => p + 1)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState title="No Users Found" description="No users match your current filter parameters." />
          )}

          {/* Edit User Modal */}
          <Modal
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            title="Inspect & Edit User Profile"
            maxWidth="md"
          >
            {editingUser && (
              <div className="space-y-4 text-xs">
                <Input
                  label="Full Name"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                />

                <Select
                  label="System Role"
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as 'user' | 'admin')}
                  options={[
                    { value: 'user', label: 'Standard Golfer (User)' },
                    { value: 'admin', label: 'System Administrator (Admin)' },
                  ]}
                />

                {/* Scores preview */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-300 block">Active 5 Golf Scores</span>
                  {editingUser.activeScores && editingUser.activeScores.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {editingUser.activeScores.map((s: any, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-mono text-xs">
                          {s.score} pts ({s.played_on})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">No active scores logged.</span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="primary" className="flex-1" isLoading={isUpdatingUser} onClick={handleSaveUser}>
                    Save User Profile
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. SUBSCRIPTION MANAGEMENT TAB                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1">
              <Input
                label="Search Subscriptions"
                placeholder="Member email, customer ID, or charity name..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Filter by Status"
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Subscriptions' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'past_due', label: 'Past Due' },
                  { value: 'canceled', label: 'Canceled / Lapsed' },
                ]}
              />
            </div>
          </div>

          {subscriptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscriber</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Charity Allocation</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead className="text-right">Stripe Customer ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-semibold text-white">
                      <div>
                        <span>{sub.profiles?.full_name || 'Member'}</span>
                        <span className="block text-xs text-slate-400 font-mono">{sub.profiles?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="cyan">{sub.plan_type?.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'active' ? 'emerald' : sub.status === 'past_due' ? 'amber' : 'rose'}>
                        {sub.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-white">
                        {sub.charities?.name || 'Unassigned'} ({sub.voluntary_charity_percent}%)
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('en-IE') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-slate-400">
                      {sub.stripe_customer_id || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No Subscriptions Found" description="No subscription records match the query." />
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. DRAW STUDIO TAB                                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'draws' && (
        <div className="space-y-6">
          <Card variant="glow" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" /> Dedicated Draw Studio Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Execute PRNG & algorithmic simulations, calculate tier splits, and commit published winners to database.
                </p>
              </div>
              <Link href="/admin/draws">
                <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Open Full Draw Studio Console
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">Tier 5 (40% Pool)</span>
                <span className="block text-lg font-bold text-white">$10,000.00 + $2,500 Rollover</span>
                <span className="text-slate-400 text-[10px]">5 Matches Required</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">Tier 4 (35% Pool)</span>
                <span className="block text-lg font-bold text-white">$8,750.00</span>
                <span className="text-slate-400 text-[10px]">4 Matches Required</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">Tier 3 (25% Pool)</span>
                <span className="block text-lg font-bold text-white">$6,250.00</span>
                <span className="text-slate-400 text-[10px]">3 Matches Required</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. CHARITY MANAGEMENT TAB                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'charities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-400" /> Active 501(c)(3) Partner Charities
            </h3>
            <Button variant="charity" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openAddCharity}>
              Add Partner Charity
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Charity Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Raised</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charities.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-white flex items-center gap-2">
                    <span className="text-lg">{c.logo_url || '💙'}</span>
                    <span>{c.name}</span>
                  </TableCell>
                  <TableCell><Badge variant="neutral">{c.category}</Badge></TableCell>
                  <TableCell className="font-extrabold text-emerald-400">
                    ${(c.total_raised || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {c.is_active ? <Badge variant="emerald">Active</Badge> : <Badge variant="rose">Inactive</Badge>}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditCharity(c)} className="text-slate-400 hover:text-amber-400 p-1.5">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    {c.is_active && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeactivateCharity(c.id)} className="text-slate-400 hover:text-rose-400 p-1.5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Charity Modal */}
          <Modal
            isOpen={charityModalOpen}
            onClose={() => setCharityModalOpen(false)}
            title={editingCharity ? 'Edit Partner Charity' : 'Add New Partner Charity'}
            maxWidth="md"
          >
            <form onSubmit={handleSaveCharity} className="space-y-4">
              <Input
                label="Charity Name"
                value={charityName}
                onChange={(e) => setCharityName(e.target.value)}
                required
              />
              <Select
                label="Category"
                value={charityCategory}
                onChange={(e) => setCharityCategory(e.target.value)}
                options={[
                  { value: 'Youth & Sports Access', label: 'Youth & Sports Access' },
                  { value: 'Ecological Stewardship', label: 'Ecological Stewardship' },
                  { value: 'Pediatric Health', label: 'Pediatric Health' },
                  { value: 'Veteran Welfare', label: 'Veteran Welfare' },
                ]}
              />
              <Input
                label="Logo Emoji / Icon"
                value={charityLogo}
                onChange={(e) => setCharityLogo(e.target.value)}
              />
              <div className="space-y-1 text-xs">
                <label className="text-slate-300 font-semibold uppercase">Description</label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl glass-input text-xs p-3 text-white"
                  value={charityDesc}
                  onChange={(e) => setCharityDesc(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="charity" className="w-full" isLoading={isSavingCharity}>
                {editingCharity ? 'Save Changes' : 'Create Charity'}
              </Button>
            </form>
          </Modal>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. WINNER MANAGEMENT TAB                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'winners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Winner Verification Queue
              </h3>
              <p className="text-xs text-slate-400">Review official scorecards, approve/reject proof, and mark payouts paid.</p>
            </div>
            <Link href="/admin/winners">
              <Button variant="gold" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Open Full Verification Console
              </Button>
            </Link>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Winner ID</TableHead>
                <TableHead>Prize Tier</TableHead>
                <TableHead>Prize Amount</TableHead>
                <TableHead>Proof Status</TableHead>
                <TableHead>Payout Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.slice(0, 8).map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono text-xs text-slate-300">
                    {w.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant="gold">{w.prize_tier.replace('_', ' ').toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="font-extrabold text-amber-400 font-mono">
                    ${w.prize_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={w.proof_status === 'approved' ? 'emerald' : w.proof_status === 'submitted' ? 'cyan' : w.proof_status === 'rejected' ? 'rose' : 'amber'}>
                      {w.proof_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={w.payout_status === 'paid' ? 'emerald' : 'slate'}>
                      {w.payout_status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href="/admin/winners">
                      <Button variant="outline" size="sm" className="text-xs">
                        Inspect →
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. REPORTS & ANALYTICS TAB                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'reports' && reportsData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="glass" className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscriber Conversion</span>
              <span className="block text-2xl font-extrabold text-emerald-400">{reportsData.userStats.conversionRate}</span>
              <span className="text-[10px] text-slate-400">{reportsData.userStats.activeSubscribers} Active / {reportsData.userStats.totalUsers} Total Users</span>
            </Card>
            <Card variant="glass" className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Distribution</span>
              <span className="block text-base font-bold text-white">
                {reportsData.userStats.monthlyCount} Monthly • {reportsData.userStats.yearlyCount} Yearly
              </span>
              <span className="text-[10px] text-slate-400">Churned: {reportsData.userStats.churnCount}</span>
            </Card>
            <Card variant="glass" className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Voluntary Grant</span>
              <span className="block text-2xl font-extrabold text-[#00F0FF]">{reportsData.charityStats.avgVoluntaryPercent}</span>
              <span className="text-[10px] text-slate-400">Above mandatory 10% minimum</span>
            </Card>
            <Card variant="glass" className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Winners Created</span>
              <span className="block text-2xl font-extrabold text-amber-400">{reportsData.drawStats.totalWinners}</span>
              <span className="text-[10px] text-slate-400">{reportsData.drawStats.totalTicketsEntered} Total Tickets Played</span>
            </Card>
          </div>

          {/* Charity Distributions Breakdown */}
          <Card variant="glass" className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400" /> Charity Contribution Share
            </h4>
            <div className="space-y-3">
              {reportsData.charityStats.charityBreakdown.map((c: any) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="block text-[11px] text-slate-400">{c.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-400 font-mono">${c.totalRaised.toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-500">{c.percentageOfTotal}% of all grants</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
