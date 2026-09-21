import { Winner, WinnerProof, ProofStatus, PayoutStatus } from '@/lib/types';

export const MAX_PROOF_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates uploaded proof file extension, MIME type, and size.
 */
export function validateProofFile(
  fileName: string,
  sizeBytes: number,
  mimeType?: string
): FileValidationResult {
  if (!fileName || fileName.trim() === '') {
    return { isValid: false, error: 'File name is required.' };
  }

  if (sizeBytes <= 0) {
    return { isValid: false, error: 'Uploaded file is empty.' };
  }

  if (sizeBytes > MAX_PROOF_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'File size exceeds maximum limit of 5MB.' };
  }

  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: 'Invalid file type. Allowed formats: PDF, JPG, PNG, WEBP.' };
  }

  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return { isValid: false, error: 'Invalid file MIME type. Only images and PDF documents are allowed.' };
  }

  return { isValid: true };
}

/**
 * Checks if a winner is eligible to upload proof.
 */
export function canSubmitProof(winner: Winner): boolean {
  // Winner can submit if proof is pending or previously rejected for resubmission
  return winner.proof_status === 'pending_submission' || winner.proof_status === 'rejected';
}

/**
 * Checks if admin can approve or reject winner proof.
 */
export function canApproveOrRejectProof(winner: Winner): boolean {
  return winner.proof_status === 'submitted';
}

/**
 * Checks if a payout can be processed for a winner.
 * CRITICAL RULE: Payout can ONLY be processed if proof_status is strictly 'approved'.
 */
export function canProcessPayout(winner: Winner): boolean {
  if (winner.proof_status !== 'approved') {
    return false;
  }
  if (winner.payout_status === 'paid') {
    return false; // Prevent duplicate payouts
  }
  return true;
}
