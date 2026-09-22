"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Trophy, Upload, Clock, CheckCircle2, XCircle, Banknote,
  FileText, AlertTriangle, Eye, RefreshCw, Shield, ArrowLeft,
  ZoomIn, Download, ExternalLink, X
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav';
import { PanelFooter } from '@/components/layout/PanelFooter';

type ProofStatus = 'pending_submission' | 'submitted' | 'approved' | 'rejected';
type PayoutStatus = 'unpaid' | 'pending' | 'paid' | 'failed';

export interface ProofDoc {
  winnerId: string;
  id?: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
  uploadedAt: string;
  status?: ProofStatus;
}

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
    proof_file_url?: string;
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
    label: 'Waiting for Validation',
    color: 'cyan',
    icon: <Clock className="w-4 h-4 text-primary" />,
    description: 'Your scorecard has been submitted and is waiting for validation. Platform administrators are reviewing it.',
  },
  approved: {
    label: 'Scorecard Verified',
    color: 'emerald',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    description: 'Your scorecard attestation has been verified and approved. Payout settlement in progress.',
  },
  rejected: {
    label: 'Proof Rejected',
    color: 'rose',
    icon: <XCircle className="w-4 h-4 text-rose-500" />,
    description: 'Please review feedback below and re-upload your attested scorecard.',
  },
};

const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, { label: string; color: string }> = {
  unpaid: { label: 'Unpaid', color: 'slate' },
  pending: { label: 'Settlement Pending', color: 'amber' },
  paid: { label: 'Paid Out', color: 'emerald' },
  failed: { label: 'Payment Issue', color: 'rose' },
};

const TIER_LABELS: Record<string, string> = {
  tier_5: '5-Number Match 🏆',
  tier_4: '4-Number Match 🥈',
  tier_3: '3-Number Match 🥉',
};

export default function MyWinningsPage() {
  const { showToast } = useToast();
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<WinnerRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, ProofDoc>>({});
  const [previewDocModal, setPreviewDocModal] = useState<ProofDoc | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWinners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/winners');
      if (res.status === 401) {
        window.location.href = '/login?next=/dashboard/winners';
        return;
      }
      if (res.status === 403) {
        showToast('Subscription Required', 'Active subscription needed to view winnings.', 'info');
        window.location.href = '/subscribe';
        return;
      }
      const data = await res.json();
      const loadedDocs: Record<string, ProofDoc> = {};

      if (res.ok && data.winners?.length > 0) {
        const mapped = data.winners.map((w: WinnerRecord) => {
          // Check if proof URL exists in backend proofs
          if (w.winner_proofs?.[0]?.proof_file_url) {
            loadedDocs[w.id] = {
              winnerId: w.id,
              fileName: w.winner_proofs[0].file_name || 'scorecard_proof.jpg',
              fileUrl: w.winner_proofs[0].proof_file_url,
              uploadedAt: w.winner_proofs[0].created_at || new Date().toISOString(),
              status: w.winner_proofs[0].status || w.proof_status,
            };
          }
          return w;
        });
        setUploadedDocs(loadedDocs);
        setWinners(mapped);
      } else {
        setWinners([]);
        setUploadedDocs({});
      }
    } catch (err: any) {
      console.error('Error fetching winners:', err);
      setWinners([]);
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
      // Read local file preview immediately so the user can always see their document
      const fileDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('proof', file);
      formData.append('winner_id', winnerId);

      const res = await fetch(`/api/winners/${winnerId}/proof`, {
        method: 'POST',
        body: formData,
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text.slice(0, 100) || `Upload failed (${res.status})`);
      }

      if (res.ok) {
        const proofUrl = data.proof?.proof_file_url || fileDataUrl;
        const newDoc: ProofDoc = {
          winnerId,
          id: data.proof?.id || `proof-${Date.now()}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl: proofUrl,
          uploadedAt: new Date().toISOString(),
          status: 'submitted',
        };

        setUploadedDocs(prev => ({ ...prev, [winnerId]: newDoc }));

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`proof_status_${winnerId}`, 'submitted');
            localStorage.setItem(`proof_doc_${winnerId}`, JSON.stringify(newDoc));
            localStorage.setItem('latest_submitted_proof', JSON.stringify({
              ...newDoc,
              winnerName: 'Member Scorecard Attestation',
              homeClub: 'Attested Round',
              drawNumber: 'Active Cycle',
              matchTier: 'Attestation Pending',
              prizeAmount: 0,
            }));
          } catch (storageErr) {
            console.warn('Storage notice:', storageErr);
          }
        }

        setWinners(prev =>
          prev.map(w =>
            w.id === winnerId ? { ...w, proof_status: 'submitted' } : w
          )
        );
        showToast('Proof Submitted!', 'Your scorecard has been uploaded and is ready for review.', 'success');
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
        <DashboardSubNav current="winnings" />

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
              View your monthly prize allocations, upload score proof, and track your payout status.
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
              <span className="text-xs text-on-surface-variant">Verified &amp; paid</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 custom-card-shadow">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Pending Winnings</span>
              <span className="block font-headline-lg text-headline-lg font-bold text-secondary mt-1">${pendingWinnings.toLocaleString()}</span>
              <span className="text-xs text-on-surface-variant">Awaiting score verification</span>
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

                  {/* Uploaded Proof Document Preview */}
                  {uploadedDocs[winner.id] && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-label-md text-label-md font-bold text-on-surface truncate">
                              {uploadedDocs[winner.id].fileName}
                            </p>
                            <span className="px-2 py-0.5 rounded-md bg-secondary-fixed/40 text-on-secondary-fixed text-[10px] font-bold uppercase">
                              Attached Proof
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {uploadedDocs[winner.id].fileSize ? `${(uploadedDocs[winner.id].fileSize! / 1024).toFixed(1)} KB • ` : ''}
                            Submitted on {new Date(uploadedDocs[winner.id].uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="gold"
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => {
                            setPreviewDocModal(uploadedDocs[winner.id]);
                            setIsZoomed(false);
                          }}
                        >
                          View Uploaded Document
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            document.getElementById(`upload-${winner.id}`)?.click();
                          }}
                        >
                          Replace
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Zone */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-surface-container">
                    <div className="flex items-center gap-3">
                      {canUpload ? (
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
                      ) : winner.proof_status === 'submitted' ? (
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-fixed/25 border border-primary/25 text-xs font-semibold text-primary">
                          <Clock className="w-4 h-4 text-primary shrink-0" />
                          <span>Waiting for Validation</span>
                        </div>
                      ) : winner.proof_status === 'approved' ? (
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Scorecard Certified</span>
                        </div>
                      ) : null}

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
                </div>
              );
            })}
          </div>
        )}

        {/* Winner Detail Modal */}
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

              {/* Uploaded Scorecard Section in Details Modal */}
              {uploadedDocs[selectedWinner.id] ? (
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      Attached Scorecard Proof
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-fixed/40 text-primary">
                      Uploaded
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-mono text-on-surface truncate">
                        {uploadedDocs[selectedWinner.id].fileName}
                      </span>
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setPreviewDocModal(uploadedDocs[selectedWinner.id]);
                        setIsDetailModalOpen(false);
                      }}
                    >
                      Open Document
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-on-surface-variant">
                    Your scorecard is reviewed by platform administrators. Payout status updates from Pending to Paid once verified.
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Dedicated Document Viewer Modal */}
        <Modal
          isOpen={!!previewDocModal}
          onClose={() => setPreviewDocModal(null)}
          title={previewDocModal?.fileName || "Scorecard Document Preview"}
          maxWidth="2xl"
        >
          {previewDocModal && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/30 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-on-surface">{previewDocModal.fileName}</span>
                  {previewDocModal.fileSize && (
                    <span>• {(previewDocModal.fileSize / 1024).toFixed(1)} KB</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewDocModal.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs border border-outline-variant/40 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Tab
                  </a>
                  <a
                    href={previewDocModal.fileUrl}
                    download={previewDocModal.fileName}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>

              {/* Viewer Window */}
              <div className="w-full min-h-[350px] max-h-[70vh] rounded-2xl overflow-auto border border-outline-variant/40 bg-surface-container-low flex items-center justify-center relative p-2">
                {previewDocModal.fileName.toLowerCase().endsWith('.pdf') || previewDocModal.fileType?.includes('pdf') ? (
                  <iframe
                    src={previewDocModal.fileUrl}
                    title="Scorecard PDF Viewer"
                    className="w-full h-[550px] rounded-xl border-0"
                  />
                ) : (
                  <div className="relative group cursor-pointer" onClick={() => setIsZoomed(!isZoomed)}>
                    <img
                      src={previewDocModal.fileUrl}
                      alt={previewDocModal.fileName}
                      className={`max-w-full rounded-xl object-contain transition-all duration-300 ${
                        isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in max-h-[60vh]'
                      }`}
                    />
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 pointer-events-none">
                      <ZoomIn className="w-3.5 h-3.5" />
                      {isZoomed ? 'Click to Reduce' : 'Click to Zoom'}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
                <span>Submitted: {new Date(previewDocModal.uploadedAt).toLocaleString()}</span>
                <span className="font-semibold text-primary">Compliance Verification Status: Pending Review</span>
              </div>
            </div>
          )}
        </Modal>
      </div>

      <PanelFooter variant="subscriber" className="mt-16" />
    </div>
  );
}
