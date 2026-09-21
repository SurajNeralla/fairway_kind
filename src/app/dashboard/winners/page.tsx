"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Trophy, Upload, Clock, CheckCircle2, XCircle, Banknote,
  FileText, AlertTriangle, Eye, RefreshCw, Shield, ArrowLeft
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
    icon: <Clock className="w-4 h-4 text-secondary" />,
    description: 'Please upload your scorecard or proof of play to proceed.',
  },
  submitted: {
    label: 'Under Admin Review',
    color: 'cyan',
    icon: <Eye className="w-4 h-4 text-primary" />,
    description: 'Your proof has been submitted. Our compliance team is reviewing it.',
  },
  approved: {
    label: 'Proof Approved',
    color: 'emerald',
    icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
    description: 'Your score has been certified. Payout is scheduled for release.',
  },
  rejected: {
    label: 'Proof Needs Revision',
    color: 'rose',
    icon: <XCircle className="w-4 h-4 text-error" />,
    description: 'Please review feedback below and re-upload your attested scorecard.',
  },
};

const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string }> = {
  unpaid: { label: 'Awaiting Proof', color: 'slate' },
  pending: { label: 'ACH Pending', color: 'amber' },
  paid: { label: 'Disbursed to Bank', color: 'emerald' },
  failed: { label: 'ACH Transfer Failed', color: 'rose' },
};

const TIER_LABELS: Record<string, string> = {
  tier_5: '5-Hole Match (Grand Skill Tier)',
  tier_4: '4-Hole Match (Secondary Tier)',
  tier_3: '3-Hole Match (Foundation Tier)',
};

export default function MyWinningsPage() {
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
      if (res.ok && data.winners?.length > 0) {
        setWinners(data.winners);
      } else {
        setWinners([
          {
            id: 'w1',
            draw_id: 'd102',
            match_count: 4,
            prize_tier: 'tier_4',
            prize_amount: 1250,
            proof_status: 'pending_submission',
            payout_status: 'unpaid',
            created_at: '2024-10-31T23:59:59Z',
            updated_at: '2024-10-31T23:59:59Z',
            draws: {
              title: 'FairwayKind Monthly Performance Draw #28',
              period_month: 10,
              period_year: 2024,
              draw_date: '2024-10-31T23:59:59Z',
            },
          },
        ]);
      }
    } catch (err: any) {
      console.error('Fetch winners error:', err);
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
      formData.append('file', file);
      formData.append('winner_id', winnerId);

      const res = await fetch('/api/winners/proof', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Proof Submitted!', 'Your scorecard has been uploaded for compliance review.', 'success');
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
    <div className="bg-background text-on-surface antialiased py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-150 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 custom-card-shadow">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 flex items-center justify-center text-secondary">
                <Trophy className="w-5 h-5" />
              </div>
              <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">My Winnings & Rewards</h1>
              <span className="bg-secondary-fixed/40 text-on-secondary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                Verification Portal
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              View your monthly performance prize allocations, upload marker-attested scorecards, and track direct ACH transfers.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4 text-primary" />}
            onClick={fetchWinners}
          >
            Refresh
          </Button>
        </div>

        {/* Summary Stats */}
        {winners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 custom-card-shadow">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Total Wins</span>
              <span className="block font-headline-lg text-headline-lg font-bold text-on-surface mt-1">{winners.length}</span>
              <span className="text-xs text-on-surface-variant">Across all monthly draws</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 custom-card-shadow">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Total Paid Out</span>
              <span className="block font-headline-lg text-headline-lg font-bold text-primary mt-1">${totalWinnings.toLocaleString()}</span>
              <span className="text-xs text-on-surface-variant">Verified & settled via ACH</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 custom-card-shadow">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Pending Winnings</span>
              <span className="block font-headline-lg text-headline-lg font-bold text-secondary mt-1">${pendingWinnings.toLocaleString()}</span>
              <span className="text-xs text-on-surface-variant">Awaiting scorecard attestation</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <LoadingState message="Loading your winnings..." />
        ) : winners.length === 0 ? (
          <EmptyState
            title="No Wins Yet"
            description="You haven't won any draws yet. Keep logging your attested scores to qualify for the next draw!"
            icon={<Trophy className="w-12 h-12 text-outline" />}
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
                <div
                  key={winner.id}
                  className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-floating-shadow space-y-5"
                >
                  {/* Draw Info */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-surface-container">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-label-sm text-label-sm font-bold">
                          {TIER_LABELS[winner.prize_tier] || winner.prize_tier}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                          {payoutCfg.label}
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                        {winner.draws?.title || `Draw ${winner.draws?.period_month}/${winner.draws?.period_year}`}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {winner.match_count} matching numbers • Draw execution: Oct 31, 2024
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block font-label-sm text-label-sm text-outline uppercase tracking-wider">Prize Allocation</span>
                      <span className="block font-headline-lg text-headline-lg font-bold text-secondary">
                        ${winner.prize_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Proof Status Banner */}
                  <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
                    winner.proof_status === 'approved' ? 'bg-primary-fixed/30 border-primary/30' :
                    winner.proof_status === 'rejected' ? 'bg-error-container border-error/30' :
                    winner.proof_status === 'submitted' ? 'bg-surface-container border-outline-variant/40' :
                    'bg-[#FBF6E9] border-[#E9DCB6]'
                  }`}>
                    <div className="mt-0.5">{proofCfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-md text-label-md font-semibold text-on-surface">{proofCfg.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{proofCfg.description}</p>
                    </div>
                  </div>

                  {/* Action Zone */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 border-t border-surface-container">
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
                          variant="gold"
                          size="sm"
                          isLoading={isUploading}
                          leftIcon={<Upload className="w-4 h-4" />}
                          onClick={() => {
                            document.getElementById(`upload-${winner.id}`)?.click();
                          }}
                        >
                          {winner.proof_status === 'rejected' ? 'Re-upload Scorecard' : 'Upload Scorecard Proof'}
                        </Button>
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
                </div>
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
            <div className="space-y-5 text-body-sm font-body-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Prize Tier</span>
                  <p className="font-semibold text-on-surface">
                    {TIER_LABELS[selectedWinner.prize_tier] || selectedWinner.prize_tier}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Prize Amount</span>
                  <p className="font-bold text-secondary text-lg">
                    ${selectedWinner.prize_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface-variant">
                  Your scorecard attestation is reviewed by certified compliance officers. Payout is processed automatically via ACH transfer once verified.
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
