"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Users, Search, Shield, Filter, RefreshCw, ArrowLeft, CheckCircle2, XCircle, Award, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/auth-context';

interface AdminUserRecord {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
  subscription?: {
    plan_type: 'monthly' | 'yearly';
    status: string;
    voluntary_charity_percent: number;
    current_period_end: string;
  } | null;
  activeScoreCount: number;
  activeScores: Array<{ id: string; score: number; played_on: string }>;
  allScores: Array<{ id: string; score: number; played_on: string; is_active: boolean }>;
  wins: Array<{ id: string; prize_amount: number; prize_tier: string; payout_status: string }>;
  totalWinnings: number;
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Edit User Modal
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editFullName, setEditFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Scores / Details View Modal
  const [viewingUser, setViewingUser] = useState<AdminUserRecord | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);

      params.set('_t', Date.now().toString());
      const token = session?.access_token;
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        showToast('Error', data.error || 'Failed to load users', 'error');
      }
    } catch {
      showToast('Network Error', 'Could not load users.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleOpenEdit = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditFullName(user.full_name);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: editRole,
          fullName: editFullName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Profile Updated', `Updated profile for ${selectedUser.email}`, 'success');
        setSelectedUser(null);
        await fetchUsers();
      } else {
        showToast('Update Failed', data.error || 'Could not update user.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

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
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-fixed/30 text-primary font-label-sm text-label-sm font-bold uppercase">
                Admin Management
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface font-headline-md mt-1">
                User &amp; Scorecard Directory
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={fetchUsers}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="rounded-full text-xs font-semibold self-start sm:self-auto"
          >
            Refresh Data
          </Button>
        </div>

        {/* Filter Toolbar */}
        <Card variant="solid" className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 bg-surface-container-lowest border border-outline-variant/30">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by email or golfer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-on-surface-variant" />}
            />
          </div>
          <div>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'user', label: 'Golfer (User)' },
                { value: 'admin', label: 'Platform Admin' },
              ]}
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Subscriptions' },
                { value: 'active', label: 'Active Subscription' },
                { value: 'canceled', label: 'Canceled' },
                { value: 'none', label: 'No Subscription' },
              ]}
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card variant="solid" className="overflow-hidden bg-surface-container-lowest border border-outline-variant/30">
          {isLoading ? (
            <div className="p-12">
              <LoadingState message="Fetching member records, subscriptions, and scores..." />
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-6 font-semibold">User &amp; Email</th>
                    <th className="py-3.5 px-4 font-semibold">Role</th>
                    <th className="py-3.5 px-4 font-semibold">Subscription</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Active Scores</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Total Won</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-body-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-on-surface">{u.full_name || 'Golfer'}</div>
                        <div className="text-xs text-on-surface-variant">{u.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.role === 'admin'
                              ? 'bg-secondary-container text-on-secondary-fixed'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {u.subscription?.status === 'active' ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Active ({u.subscription.plan_type})
                          </div>
                        ) : u.subscription ? (
                          <span className="text-xs text-on-surface-variant capitalize">{u.subscription.status}</span>
                        ) : (
                          <span className="text-xs text-outline">None</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-on-surface">{u.activeScoreCount} of 5</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-primary">${u.totalWinnings.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setViewingUser(u)}
                            className="rounded-full text-xs py-1 px-3"
                          >
                            Scores
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleOpenEdit(u)}
                            className="rounded-full text-xs py-1 px-3"
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12">
              <EmptyState
                title="No Users Found"
                description="Try modifying your search criteria or role filters."
                actionLabel="Reset Search"
                onAction={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
              />
            </div>
          )}
        </Card>

        {/* Edit User Modal */}
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title={`Edit User Profile: ${selectedUser?.email}`}
        >
          <form onSubmit={handleSaveUser} className="space-y-4">
            <Input
              label="Full Name"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Access Role</label>
              <Select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
                options={[
                  { value: 'user', label: 'User (Standard Golfer Subscriber)' },
                  { value: 'admin', label: 'Admin (Platform Control Suite)' },
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Scores Modal */}
        <Modal
          isOpen={Boolean(viewingUser)}
          onClose={() => setViewingUser(null)}
          title={`Scores & History: ${viewingUser?.full_name || viewingUser?.email}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-outline-variant/30">
              <span className="text-on-surface-variant">Registered Email:</span>
              <span className="font-semibold text-on-surface">{viewingUser?.email}</span>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Rolling 5 Active Scores</h4>
            {viewingUser?.activeScores && viewingUser.activeScores.length > 0 ? (
              <div className="grid grid-cols-5 gap-2 text-center">
                {viewingUser.activeScores.map((s, idx) => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30">
                    <span className="text-[10px] text-outline block font-bold">#{idx + 1}</span>
                    <span className="text-lg font-bold text-primary block">{s.score}</span>
                    <span className="text-[10px] text-on-surface-variant block">{s.played_on}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">No active scores recorded for this user.</p>
            )}

            <h4 className="text-xs font-bold uppercase tracking-wider text-secondary pt-2">All Recorded Rounds ({viewingUser?.allScores?.length || 0})</h4>
            <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
              {(viewingUser?.allScores || []).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                  <span>Played on {s.played_on}</span>
                  <span className="font-bold text-on-surface">{s.score} pts ({s.is_active ? 'Active' : 'Archived'})</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <Button type="button" variant="primary" onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
