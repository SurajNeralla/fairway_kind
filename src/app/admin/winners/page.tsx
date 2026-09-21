"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Trophy, Eye, CheckCircle2, XCircle, Banknote, Shield, RefreshCw,
  AlertCircle, FileText, ChevronDown, ChevronUp, Search, Filter, Clock, ArrowLeft
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

type ProofStatus = 'pending_submission' | 'submitted' | 'approved' | 'rejected';
type PayoutStatus = 'unpaid' | 'pending' | 'paid' | 'failed';

interface WinnerRecord {
  id: string;
  draw_id: string;
  draw_entry_id: string;
  user_id: string;
  match_count: number;
  prize_tier: string;
  prize_amount: number;
  proof_status: ProofStatus;
  payout_status: PayoutStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  draws?: {
    title: string;
    period_month: number;
    period_year: number;
    draw_date: string;
  };
  winner_proofs?: Array<{
    id: string;
    proof_file_url: string;
    file_name: string;
    file_size_bytes?: number;
    status: ProofStatus;
    rejection_reason?: string;
    reviewed_at?: string;
    created_at: string;
  }>;
}

const TIER_LABELS: Record<string, { label: string; variant: string }> = {
  tier_5_match: { label: '5-Match 🏆', variant: 'gold' },
  tier_4_match: { label: '4-Match 🥈', variant: 'cyan' },
  tier_3_match: { label: '3-Match 🥉', variant: 'emerald' },
};

const PROOF_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending_submission', label: 'Awaiting Submission' },
  { value: 'submitted', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminWinnersPage() {
  const { showToast } = useToast();
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{ winner: WinnerRecord; action: 'approve' | 'reject' } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Payout Modal State
  const [payoutModal, setPayoutModal] = useState<WinnerRecord | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  // Detail Modal State
  const [detailModal, setDetailModal] = useState<WinnerRecord | null>(null);

  // Expanded proof previews
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);

  const fetchWinners = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/winners');
      const data = await res.json();
      if (res.ok) {
        setWinners(data.winners || []);
      } else {
        showToast('Error', data.error || 'Failed to load winners', 'error');
      }
    } catch {
      showToast('Network Error', 'Could not connect to server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWinners();
  }, [fetchWinners]);

  const handleReview = async () => {
    if (!reviewModal) return;
    if (reviewModal.action === 'reject' && !reviewNotes.trim()) {
      showToast('Notes Required', 'Please provide a rejection reason.', 'error');
      return;
    }

    setIsReviewing(true);
    try {
      const res = await fetch(`/api/winners/${reviewModal.winner.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: reviewModal.action, notes: reviewNotes }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          `Proof ${reviewModal.action === 'approve' ? 'Approved' : 'Rejected'}`,
          data.message,
          reviewModal.action === 'approve' ? 'success' : 'warning'
        );
        setReviewModal(null);
        setReviewNotes('');
        await fetchWinners();
      } else {
        showToast('Error', data.error, 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  const handlePayout = async () => {
    if (!payoutModal) return;

    setIsProcessingPayout(true);
    try {
      const res = await fetch(`/api/winners/${payoutModal.id}/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionReference: transactionRef,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Payout Marked as Paid!', `$${payoutModal.prize_amount.toLocaleString()} marked paid.`, 'success');
        setPayoutModal(null);
        setTransactionRef('');
        await fetchWinners();
      } else {
        showToast('Payout Error', data.error, 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsProcessingPayout(false);
    }
  };

  // Filter & search
  const filteredWinners = winners.filter((w) => {
    const matchesStatus = !filterStatus || w.proof_status === filterStatus;
    const matchesSearch = !searchQuery ||
      w.id.includes(searchQuery) ||
      w.user_id.includes(searchQuery) ||
      w.draws?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: winners.length,
    pendingReview: winners.filter(w => w.proof_status === 'submitted').length,
    approved: winners.filter(w => w.proof_status === 'approved').length,
    pendingPayout: winners.filter(w => w.proof_status === 'approved' && w.payout_status !== 'paid').length,
    totalPaid: winners.filter(w => w.payout_status === 'paid').reduce((sum, w) => sum + w.prize_amount, 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-150 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Console</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Winner Verification</h1>
            <Badge variant="gold">Admin Control</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Review proof submissions, approve or reject, and mark payouts as complete.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={fetchWinners}
        >
          Refresh
        </Button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Winners', value: stats.total, color: 'text-white' },
          { label: 'Pending Review', value: stats.pendingReview, color: 'text-cyan-400' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-400' },
          { label: 'Awaiting Payout', value: stats.pendingPayout, color: 'text-amber-400' },
          { label: 'Total Paid Out', value: `$${stats.totalPaid.toLocaleString()}`, color: 'text-emerald-400' },
        ].map((stat) => (
          <Card key={stat.label} variant="glass" className="space-y-1 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{stat.label}</span>
            <span className={`block text-xl font-extrabold ${stat.color}`}>{stat.value}</span>
          </Card>
        ))}
      </div>

      {/* Alert: Pending Review */}
      {stats.pendingReview > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/30">
          <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">
              {stats.pendingReview} proof{stats.pendingReview > 1 ? 's' : ''} awaiting your review
            </p>
            <p className="text-xs text-slate-400">
              Winners have submitted scorecards. Please review and approve or reject.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="flex-1">
          <Input
            label="Search Winners"
            placeholder="Winner ID, User ID, or Draw title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={PROOF_STATUS_OPTIONS}
          />
        </div>
      </div>

      {/* Winners List */}
      {isLoading ? (
        <LoadingState message="Loading winner records..." />
      ) : filteredWinners.length === 0 ? (
        <EmptyState
          title="No Winners Found"
          description="No winner records match the current filter. Run and publish a draw to generate winners."
        />
      ) : (
        <div className="space-y-4">
          {filteredWinners.map((winner) => {
            const tierCfg = TIER_LABELS[winner.prize_tier] || { label: winner.prize_tier, variant: 'slate' };
            const latestProof = winner.winner_proofs?.[0];
            const isExpanded = expandedProofId === winner.id;

            return (
              <Card key={winner.id} variant="glass" className="space-y-4">
                {/* Row header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={tierCfg.variant as any} size="sm">{tierCfg.label}</Badge>
                      <Badge
                        variant={
                          winner.proof_status === 'approved' ? 'emerald' :
                          winner.proof_status === 'submitted' ? 'cyan' :
                          winner.proof_status === 'rejected' ? 'rose' : 'amber'
                        }
                        size="sm"
                      >
                        {winner.proof_status === 'pending_submission' ? 'Awaiting Submission' :
                         winner.proof_status === 'submitted' ? 'Review Required' :
                         winner.proof_status === 'approved' ? 'Approved' : 'Rejected'}
                      </Badge>
                      <Badge
                        variant={winner.payout_status === 'paid' ? 'emerald' : 'slate'}
                        size="sm"
                      >
                        {winner.payout_status === 'paid' ? 'Paid ✓' : `Payout: ${winner.payout_status}`}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {winner.draws?.title || `Draw ${winner.draws?.period_month}/${winner.draws?.period_year}`}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        Winner ID: {winner.id.slice(0, 8)}... • User: {winner.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 uppercase font-mono">Prize</span>
                      <span className="block text-xl font-extrabold text-amber-400">
                        ${winner.prize_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proof File Info */}
                {latestProof ? (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{latestProof.file_name}</p>
                          <p className="text-[10px] text-slate-500">
                            Submitted {new Date(latestProof.created_at).toLocaleDateString('en-IE')}
                            {latestProof.file_size_bytes && (
                              <> • {(latestProof.file_size_bytes / 1024).toFixed(1)}KB</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={latestProof.proof_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </a>
                        <button
                          onClick={() => setExpandedProofId(isExpanded ? null : winner.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded: show proof preview link and admin notes */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          <a
                            href={latestProof.proof_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/50 border border-amber-500/30 hover:bg-amber-950/80 transition-colors"
                          >
                            Open Full Proof Document ↗
                          </a>
                        </div>
                        {winner.admin_notes && (
                          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/20">
                            <p className="text-[10px] text-rose-400 uppercase font-semibold tracking-wider mb-1">Previous Admin Notes</p>
                            <p className="text-xs text-rose-200">{winner.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <p className="text-xs text-slate-500">Winner has not yet submitted proof of play.</p>
                  </div>
                )}

                {/* Admin Action Bar */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60">
                  {winner.proof_status === 'submitted' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={() => {
                          setReviewModal({ winner, action: 'approve' });
                          setReviewNotes('');
                        }}
                      >
                        Approve Proof
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => {
                          setReviewModal({ winner, action: 'reject' });
                          setReviewNotes('');
                        }}
                      >
                        Reject Proof
                      </Button>
                    </>
                  )}

                  {winner.proof_status === 'approved' && winner.payout_status !== 'paid' && (
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<Banknote className="w-4 h-4" />}
                      onClick={() => {
                        setPayoutModal(winner);
                        setTransactionRef('');
                        setPaymentMethod('bank_transfer');
                      }}
                    >
                      Mark as Paid
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="w-4 h-4" />}
                    onClick={() => setDetailModal(winner)}
                  >
                    Full Audit Log
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Approve / Reject Modal ── */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={reviewModal?.action === 'approve' ? '✅ Approve Winner Proof' : '❌ Reject Winner Proof'}
        maxWidth="md"
      >
        {reviewModal && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={TIER_LABELS[reviewModal.winner.prize_tier]?.variant as any} size="sm">
                  {TIER_LABELS[reviewModal.winner.prize_tier]?.label || reviewModal.winner.prize_tier}
                </Badge>
              </div>
              <p className="text-sm font-bold text-white">
                {reviewModal.winner.draws?.title || 'Draw Result'}
              </p>
              <p className="text-xs text-slate-400">
                Prize Amount:{' '}
                <span className="text-amber-400 font-bold">
                  ${reviewModal.winner.prize_amount.toLocaleString()}
                </span>
              </p>
            </div>

            {reviewModal.action === 'approve' && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Confirm Proof Approval</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Approving will mark this winner&apos;s proof as verified and enable payout processing.
                    This action is logged in the audit trail.
                  </p>
                </div>
              </div>
            )}

            {reviewModal.action === 'reject' && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-950/50 border border-rose-500/30">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-rose-300">Confirm Proof Rejection</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Rejecting will notify the winner and allow them to re-submit new proof. 
                    A rejection reason is required.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Notes{reviewModal.action === 'reject' ? ' (Required)' : ' (Optional)'}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder={
                  reviewModal.action === 'reject'
                    ? 'e.g., "Scorecard image is illegible — please upload a clearer photo"'
                    : 'Optional: Add a note about the approval...'
                }
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#00F0FF] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant={reviewModal.action === 'approve' ? 'primary' : 'danger'}
                className="flex-1"
                isLoading={isReviewing}
                onClick={handleReview}
              >
                {reviewModal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setReviewModal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Payout Confirmation Modal ── */}
      <Modal
        isOpen={!!payoutModal}
        onClose={() => setPayoutModal(null)}
        title="💰 Confirm Payout"
        maxWidth="md"
      >
        {payoutModal && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Proof Approved — Payout Eligible</span>
              </div>
              <p className="text-sm font-bold text-white">
                {payoutModal.draws?.title || 'Draw Result'}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-400">
                  ${payoutModal.prize_amount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">to be paid out</span>
              </div>
            </div>

            <div className="space-y-4">
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'cheque', label: 'Cheque' },
                  { value: 'paypal', label: 'PayPal' },
                  { value: 'revolut', label: 'Revolut' },
                ]}
              />
              <Input
                label="Transaction Reference (Optional)"
                placeholder="e.g., TXN-2026-001234"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/20">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                <strong className="text-rose-300">Warning:</strong> This action marks the winner as paid and 
                cannot be reversed. Ensure the physical payment has been made before confirming.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="gold"
                className="flex-1"
                isLoading={isProcessingPayout}
                onClick={handlePayout}
                leftIcon={<Banknote className="w-4 h-4" />}
              >
                Confirm: Mark as Paid
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPayoutModal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Audit Detail Modal ── */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Winner Audit Log"
        maxWidth="lg"
      >
        {detailModal && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Winner ID', value: detailModal.id },
                { label: 'User ID', value: detailModal.user_id },
                { label: 'Draw ID', value: detailModal.draw_id },
                { label: 'Entry ID', value: detailModal.draw_entry_id },
                { label: 'Prize Tier', value: TIER_LABELS[detailModal.prize_tier]?.label || detailModal.prize_tier },
                { label: 'Match Count', value: `${detailModal.match_count} of 5` },
                { label: 'Prize Amount', value: `$${detailModal.prize_amount.toLocaleString()}` },
                { label: 'Proof Status', value: detailModal.proof_status },
                { label: 'Payout Status', value: detailModal.payout_status },
                { label: 'Created', value: new Date(detailModal.created_at).toLocaleString('en-IE') },
                { label: 'Last Updated', value: new Date(detailModal.updated_at).toLocaleString('en-IE') },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
                  <p className="text-xs font-medium text-white font-mono break-all">{value}</p>
                </div>
              ))}
            </div>

            {detailModal.admin_notes && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Admin Notes</p>
                <p className="text-xs text-slate-300">{detailModal.admin_notes}</p>
              </div>
            )}

            {/* Proof Submissions Log */}
            {detailModal.winner_proofs && detailModal.winner_proofs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Proof Submission History ({detailModal.winner_proofs.length})
                </p>
                {detailModal.winner_proofs.map((proof, idx) => (
                  <div key={proof.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white">Submission #{idx + 1}: {proof.file_name}</span>
                      <Badge
                        variant={proof.status === 'approved' ? 'emerald' : proof.status === 'rejected' ? 'rose' : 'amber'}
                        size="sm"
                      >
                        {proof.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Submitted: {new Date(proof.created_at).toLocaleString('en-IE')}
                      {proof.reviewed_at && (
                        <> • Reviewed: {new Date(proof.reviewed_at).toLocaleString('en-IE')}</>
                      )}
                    </p>
                    {proof.rejection_reason && (
                      <p className="text-[10px] text-rose-300">Rejection Reason: {proof.rejection_reason}</p>
                    )}
                    <a
                      href={proof.proof_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View Proof Document
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
