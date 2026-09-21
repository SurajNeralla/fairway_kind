import {
  validateProofFile,
  canSubmitProof,
  canApproveOrRejectProof,
  canProcessPayout,
  MAX_PROOF_FILE_SIZE_BYTES,
} from './winner-engine';
import { Winner } from '@/lib/types';

function runWinnerLifecycleTests() {
  console.log('--- STARTING WINNER LIFECYCLE & PAYOUT UNIT TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Proof File Validation Tests
  assert(validateProofFile('scorecard.pdf', 1024 * 1024, 'application/pdf').isValid === true, 'PDF file (1MB) is valid');
  assert(validateProofFile('scorecard.png', 2 * 1024 * 1024, 'image/png').isValid === true, 'PNG file (2MB) is valid');
  assert(validateProofFile('scorecard.jpg', 3 * 1024 * 1024, 'image/jpeg').isValid === true, 'JPG file (3MB) is valid');

  assert(validateProofFile('script.exe', 1024, 'application/x-msdownload').isValid === false, 'Executable script.exe rejected');
  assert(validateProofFile('doc.docx', 1024, 'application/msword').isValid === false, 'Word docx file rejected');

  assert(validateProofFile('huge.pdf', MAX_PROOF_FILE_SIZE_BYTES + 1).isValid === false, 'File larger than 5MB rejected');
  assert(validateProofFile('empty.pdf', 0).isValid === false, '0-byte empty file rejected');
  assert(validateProofFile('', 1000).isValid === false, 'Empty file name rejected');

  // 2. Winner State Machine & Submission Tests
  const pendingWinner: Winner = {
    id: 'w1',
    draw_id: 'd1',
    draw_entry_id: 'e1',
    user_id: 'u1',
    match_count: 4,
    prize_tier: 'tier_4_match',
    prize_amount: 1750.00,
    proof_status: 'pending_submission',
    payout_status: 'unpaid',
    created_at: '2026-09-20T00:00:00Z',
    updated_at: '2026-09-20T00:00:00Z',
  };

  assert(canSubmitProof(pendingWinner) === true, 'Pending submission winner can submit proof');
  assert(canApproveOrRejectProof(pendingWinner) === false, 'Pending submission winner cannot be reviewed yet');
  assert(canProcessPayout(pendingWinner) === false, 'Pending submission winner CANNOT be paid');

  // 3. Submitted State Tests
  const submittedWinner: Winner = { ...pendingWinner, proof_status: 'submitted' };
  assert(canSubmitProof(submittedWinner) === false, 'Submitted winner cannot re-submit while under review');
  assert(canApproveOrRejectProof(submittedWinner) === true, 'Submitted winner can be reviewed by admin');
  assert(canProcessPayout(submittedWinner) === false, 'Submitted winner CANNOT be paid before approval');

  // 4. Approved State Tests
  const approvedWinner: Winner = { ...pendingWinner, proof_status: 'approved' };
  assert(canSubmitProof(approvedWinner) === false, 'Approved winner cannot re-submit proof');
  assert(canProcessPayout(approvedWinner) === true, 'Approved winner CAN be processed for payout');

  // 5. Rejected State Tests (Resubmission allowed, Payout forbidden)
  const rejectedWinner: Winner = { ...pendingWinner, proof_status: 'rejected', admin_notes: 'Illegible scorecard image' };
  assert(canSubmitProof(rejectedWinner) === true, 'Rejected winner CAN re-submit new proof');
  assert(canProcessPayout(rejectedWinner) === false, 'CRITICAL: Rejected winner CANNOT be paid');

  // 6. Paid State Tests (Prevent Duplicate Payouts)
  const paidWinner: Winner = { ...approvedWinner, payout_status: 'paid' };
  assert(canProcessPayout(paidWinner) === false, 'CRITICAL: Paid winner CANNOT be paid a second time (Duplicate Payout Prevented)');

  console.log(`--- WINNER LIFECYCLE TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runWinnerLifecycleTests();
