"use client";

import React, { useEffect, useState, useRef } from 'react';
import {
  Trophy, Upload, Clock, CheckCircle2, XCircle, Banknote,
  FileText, AlertTriangle, Eye, RefreshCw, Shield, Star
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

type ProofStatus = 'pending_submission' | 'submitted' | 'approved' | 'rejected';
type PayoutStatus = 'unpaid' | 'pending' | 'paid' | 'failed';

interface WinnerRecord {
  id: string;
  draw_id: string;
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
    file_name: string;
    status: ProofStatus;
    rejection_reason?: string;
    reviewed_at?: string;
    created_at: string;
  }>;
}

const PROOF_STATUS_CONFIG: Record<ProofStatus, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  pending_submission: {
    label: 'Awaiting Your Proof',
    color: 'amber',
    icon: <Clock className="w-4 h-4 text-amber-400" />,
    description: 'Please upload your scorecard or proof of play to proceed.',
  },
  submitted: {
    label: 'Under Admin Review',
    color: 'cyan',
    icon: <Eye className="w-4 h-4 text-cyan-400" />,
    description: 'Your proof has been submitted. Our team is reviewing it.',
  },
  approved: {
    label: 'Proof Approved',
    color: 'emerald',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    description: 'Your proof has been verified. Payout is being arranged.',
  },
  rejected: {
    label: 'Proof Rejected',
    color: 'rose',
    icon: <XCircle className="w-4 h-4 text-rose-400" />,
    description: 'Your proof was rejected. Please re-upload a clearer document.',
  },
};

const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string }> = {
  unpaid: { label: 'Unpaid', color: 'slate' },
  pending: { label: 'Payout Pending', color: 'amber' },
  paid: { label: 'Paid ✓', color: 'emerald' },
  failed: { label: 'Payout Failed', color: 'rose' },
};

const TIER_LABELS: Record<string, string> = {
  tier_5_match: '5-Number Match 🏆',
  tier_4_match: '4-Number Match 🥈',
  tier_3_match: '3-Number Match 🥉',
};

export default function UserWinnersPage() {
  const { showToast } = useToast();
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<WinnerRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWinners = async () => {
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
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const handleFileUpload = async (winnerId: string, file: File) => {
    setUploadingId(winnerId);
    try {
      const formData = new FormData();
      formData.append('proof', file);

      const res = await fetch(`/api/winners/${winnerId}/proof`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Proof Submitted!', 'Your scorecard has been uploaded for admin review.', 'success');
        await fetchWinners();
      } else {
        showToast('Upload Failed', data.error || 'Could not upload proof.', 'error');
      }
    } catch (err: any) {
      showToast('Upload Error', err.message || 'Unknown upload error.', 'error');
    } finally {
      setUploadingId(null);
    }
  };

  const openDetail = (winner: WinnerRecord) => {
    setSelectedWinner(winner);
    setIsDetailModalOpen(true);
  };

  const totalWinnings = winners.reduce((sum, w) => sum + (w.payout_status === 'paid' ? w.prize_amount : 0), 0);
  const pendingWinnings = winners.reduce((sum, w) => sum + (w.payout_status !== 'paid' && w.prize_amount > 0 ? w.prize_amount : 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-amber-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">My Winnings</h1>
            <Badge variant="gold">Verification Portal</Badge>
          </div>
          <p className="text-xs text-slate-400">
            View your prize wins, upload proof of play, and track payout status.
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

      {/* Summary Stats */}
      {winners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="glass" className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Total Wins</span>
            <span className="block text-2xl font-extrabold text-white">{winners.length}</span>
            <span className="text-[10px] text-slate-500">Across all draws</span>
          </Card>
          <Card variant="glass" className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Total Paid Out</span>
            <span className="block text-2xl font-extrabold text-emerald-400">${totalWinnings.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Verified & Paid</span>
          </Card>
          <Card variant="glass" className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Pending Winnings</span>
            <span className="block text-2xl font-extrabold text-amber-400">${pendingWinnings.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Awaiting verification</span>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <LoadingState message="Loading your winnings..." />
      ) : winners.length === 0 ? (
        <EmptyState
          title="No Wins Yet"
          description="You haven't won any draws yet. Keep playing — your lucky draw is just around the corner!"
          icon={<Trophy className="w-12 h-12 text-slate-600" />}
        />
      ) : (
        <div className="space-y-6">
          {winners.map((winner) => {
            const proofCfg = PROOF_STATUS_CONFIG[winner.proof_status];
            const payoutCfg = PAYOUT_STATUS_CONFIG[winner.payout_status];
            const latestProof = winner.winner_proofs?.[0];
            const isUploading = uploadingId === winner.id;
            const canUpload = winner.proof_status === 'pending_submission' || winner.proof_status === 'rejected';

            return (
              <Card key={winner.id} variant="glass" className="space-y-5">
                {/* Draw Info */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="gold" size="sm">
                        {TIER_LABELS[winner.prize_tier] || winner.prize_tier}
                      </Badge>
                      <Badge
                        variant={winner.payout_status === 'paid' ? 'emerald' : winner.payout_status === 'pending' ? 'amber' : 'slate'}
                        size="sm"
                      >
                        {payoutCfg.label}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {winner.draws?.title || `Draw ${winner.draws?.period_month}/${winner.draws?.period_year}`}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {winner.match_count} matching numbers • Draw date:{' '}
                      {winner.draws?.draw_date
                        ? new Date(winner.draws.draw_date).toLocaleDateString('en-IE', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Prize Amount</span>
                    <span className="block text-3xl font-extrabold text-amber-400">
                      ${winner.prize_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Proof Status Banner */}
                <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  winner.proof_status === 'approved' ? 'bg-emerald-950/50 border-emerald-500/30' :
                  winner.proof_status === 'rejected' ? 'bg-rose-950/50 border-rose-500/30' :
                  winner.proof_status === 'submitted' ? 'bg-cyan-950/50 border-cyan-500/30' :
                  'bg-amber-950/50 border-amber-500/30'
                }`}>
                  <div className="mt-0.5">{proofCfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{proofCfg.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{proofCfg.description}</p>
                    {winner.proof_status === 'rejected' && winner.admin_notes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40">
                        <p className="text-xs text-rose-300 font-medium">Admin Feedback:</p>
                        <p className="text-xs text-rose-200 mt-0.5">{winner.admin_notes}</p>
                      </div>
                    )}
                    {winner.proof_status === 'approved' && winner.payout_status === 'paid' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-semibold">Payout has been processed!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded Proof Info */}
                {latestProof && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{latestProof.file_name}</p>
                      <p className="text-[10px] text-slate-500">
                        Uploaded {new Date(latestProof.created_at).toLocaleDateString('en-IE')}
                        {latestProof.reviewed_at && (
                          <> • Reviewed {new Date(latestProof.reviewed_at).toLocaleDateString('en-IE')}</>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Zone */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t border-slate-800">
                  {canUpload && (
                    <div>
                      <input
                        ref={winner.id === uploadingId ? fileInputRef : undefined}
                        type="file"
                        id={`upload-${winner.id}`}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(winner.id, file);
                        }}
                      />
                      <Button
                        variant={winner.proof_status === 'rejected' ? 'danger' : 'primary'}
                        size="sm"
                        isLoading={isUploading}
                        leftIcon={<Upload className="w-4 h-4" />}
                        onClick={() => {
                          document.getElementById(`upload-${winner.id}`)?.click();
                        }}
                      >
                        {winner.proof_status === 'rejected' ? 'Re-upload Proof' : 'Upload Scorecard Proof'}
                      </Button>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Accepted: PDF, JPG, PNG, WEBP • Max 5MB
                      </p>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="w-4 h-4" />}
                    onClick={() => openDetail(winner)}
                  >
                    View Full Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Winner Record Details"
        maxWidth="lg"
      >
        {selectedWinner && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Prize Tier</span>
                <p className="font-semibold text-white">
                  {TIER_LABELS[selectedWinner.prize_tier] || selectedWinner.prize_tier}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Prize Amount</span>
                <p className="font-extrabold text-amber-400 text-lg">
                  ${selectedWinner.prize_amount.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Proof Status</span>
                <p className="font-semibold text-white">{PROOF_STATUS_CONFIG[selectedWinner.proof_status]?.label}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Payout Status</span>
                <p className="font-semibold text-white">{PAYOUT_STATUS_CONFIG[selectedWinner.payout_status]?.label}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Matches</span>
                <p className="font-bold text-white">{selectedWinner.match_count} of 5</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Draw Period</span>
                <p className="font-semibold text-white">
                  {selectedWinner.draws
                    ? `${selectedWinner.draws.period_month}/${selectedWinner.draws.period_year}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            {selectedWinner.admin_notes && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30">
                <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1">Admin Note</p>
                <p className="text-sm text-rose-200">{selectedWinner.admin_notes}</p>
              </div>
            )}

            {selectedWinner.winner_proofs && selectedWinner.winner_proofs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proof Submissions</p>
                {selectedWinner.winner_proofs.map((proof) => (
                  <div key={proof.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white">{proof.file_name}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(proof.created_at).toLocaleDateString('en-IE')} •{' '}
                        <span className={proof.status === 'approved' ? 'text-emerald-400' : proof.status === 'rejected' ? 'text-rose-400' : 'text-amber-400'}>
                          {proof.status}
                        </span>
                      </p>
                      {proof.rejection_reason && (
                        <p className="text-[10px] text-rose-300 mt-0.5">Reason: {proof.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-950/40 border border-blue-500/20">
              <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                Your proof is stored securely and only accessible by authorized administrators. 
                Payout is only processed after proof is verified and approved.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
