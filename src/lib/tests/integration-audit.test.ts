import { validateScoreValue, validateScoreDate, applyRollingFiveScores } from '../scores/score-engine';
import {
  generateRandomWinningNumbers,
  generateAlgorithmicWinningNumbers,
  evaluateTicketMatch,
  calculateTotalPrizePool,
  simulateDraw,
  DrawTicket,
} from '../draws/draw-engine';
import { sanitizeCharityPercentage, calculateCharityContribution } from '../charity/calculator';
import {
  validateProofFile,
  canSubmitProof,
  canApproveOrRejectProof,
  canProcessPayout,
} from '../winners/winner-engine';
import { Winner, GolfScore } from '@/lib/types';

export function runFullEngineeringAudit() {
  console.log('================================================================');
  console.log('   DIGITAL HEROES — FULL PHASE 11 ENGINEERING AUDIT SUITE      ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, category: string) {
    if (condition) {
      console.log(`✓ [PASS] [${category}] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] [${category}] ${testName}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. SCORES AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- 1. GOLF SCORES ENGINE & ROLLING REPLACEMENT ---');
  // Score boundaries
  assert(validateScoreValue(1).isValid === true, 'Score = 1 (minimum boundary) accepted', 'SCORES');
  assert(validateScoreValue(45).isValid === true, 'Score = 45 (maximum boundary) accepted', 'SCORES');
  assert(validateScoreValue(0).isValid === false, 'Score = 0 (<1) rejected', 'SCORES');
  assert(validateScoreValue(46).isValid === false, 'Score = 46 (>45) rejected', 'SCORES');
  assert(validateScoreValue(-10).isValid === false, 'Negative score rejected', 'SCORES');
  assert(validateScoreValue(36.7).isValid === false, 'Decimal score rejected', 'SCORES');

  // Date uniqueness & future guard
  assert(validateScoreDate('2026-09-10', ['2026-09-10']).isValid === false, 'Duplicate date rejected', 'SCORES');
  assert(validateScoreDate('2026-09-11', ['2026-09-10']).isValid === true, 'Unique date accepted', 'SCORES');
  assert(validateScoreDate('').isValid === false, 'Empty date rejected', 'SCORES');

  const future = new Date();
  future.setDate(future.getDate() + 30);
  assert(validateScoreDate(future.toISOString().split('T')[0]).isValid === false, 'Future date rejected', 'SCORES');

  // Rolling 5 Replacement & Deletion Re-promotion
  const scores: GolfScore[] = [
    { id: 's1', user_id: 'u1', score: 30, played_on: '2026-08-01', is_active: true, created_at: '2026-08-01T00:00:00Z' },
    { id: 's2', user_id: 'u1', score: 32, played_on: '2026-08-05', is_active: true, created_at: '2026-08-05T00:00:00Z' },
    { id: 's3', user_id: 'u1', score: 34, played_on: '2026-08-10', is_active: true, created_at: '2026-08-10T00:00:00Z' },
    { id: 's4', user_id: 'u1', score: 36, played_on: '2026-08-15', is_active: true, created_at: '2026-08-15T00:00:00Z' },
    { id: 's5', user_id: 'u1', score: 38, played_on: '2026-08-20', is_active: true, created_at: '2026-08-20T00:00:00Z' },
  ];

  const rolling5 = applyRollingFiveScores(scores);
  assert(rolling5.activeScores.length === 5, 'Exact 5 active scores maintained', 'SCORES');
  assert(rolling5.replacedScore === null, 'No replacement when count == 5', 'SCORES');

  // Add 6th newer score
  const score6: GolfScore = {
    id: 's6',
    user_id: 'u1',
    score: 41,
    played_on: '2026-08-25',
    is_active: true,
    created_at: '2026-08-25T00:00:00Z',
  };
  const rolling6 = applyRollingFiveScores([...scores, score6]);
  assert(rolling6.activeScores.length === 5, 'Active count remains capped strictly at 5', 'SCORES');
  assert(rolling6.replacedScore?.id === 's1', 'Oldest score (s1, 2026-08-01) replaced by newest (s6)', 'SCORES');

  // -------------------------------------------------------------------------
  // 2. SUBSCRIPTIONS & CHARITY ALLOCATION
  // -------------------------------------------------------------------------
  console.log('\n--- 2. SUBSCRIPTIONS & CHARITY ALLOCATION ---');
  assert(sanitizeCharityPercentage(5) === 10, 'Malicious 5% clamped to minimum 10%', 'CHARITY');
  assert(sanitizeCharityPercentage(0) === 10, '0% clamped to minimum 10%', 'CHARITY');
  assert(sanitizeCharityPercentage(-50) === 10, 'Negative % clamped to minimum 10%', 'CHARITY');
  assert(sanitizeCharityPercentage(25) === 25, 'Voluntary 25% accepted', 'CHARITY');
  assert(sanitizeCharityPercentage(100) === 100, 'Max 100% accepted', 'CHARITY');
  assert(sanitizeCharityPercentage(150) === 100, 'Overflow 150% clamped to 100%', 'CHARITY');

  const monthlySub = calculateCharityContribution('monthly', 10);
  assert(monthlySub.contributionAmount === 2.90, 'Monthly $29 * 10% = $2.90 grant', 'CHARITY');

  const monthlySubVoluntary = calculateCharityContribution('monthly', 50);
  assert(monthlySubVoluntary.contributionAmount === 14.50, 'Monthly $29 * 50% = $14.50 grant', 'CHARITY');

  const yearlySub = calculateCharityContribution('yearly', 10);
  assert(yearlySub.contributionAmount === 29.00, 'Yearly $290 * 10% = $29.00 grant', 'CHARITY');

  // -------------------------------------------------------------------------
  // 3. DRAW ENGINE & JACKPOT ROLLOVER
  // -------------------------------------------------------------------------
  console.log('\n--- 3. DRAW ENGINE, PRIZE POOLS & ROLLOVER ---');
  const seed = 'audit-seed-dh-2026';
  const nums1 = generateRandomWinningNumbers(seed);
  const nums2 = generateRandomWinningNumbers(seed);

  assert(nums1.length === 5, 'Generates exactly 5 numbers', 'DRAW');
  assert(new Set(nums1).size === 5, 'All 5 numbers unique', 'DRAW');
  assert(nums1.every((n) => n >= 1 && n <= 45), 'All numbers within 1..45', 'DRAW');
  assert(JSON.stringify(nums1) === JSON.stringify(nums2), 'Auditability: Seed yields identical numbers', 'DRAW');

  // Match evaluation
  const target = [5, 15, 25, 35, 45];
  assert(evaluateTicketMatch([5, 15, 25, 35, 45], target).tier === 'tier_5_match', '5 of 5 matches Tier 5', 'DRAW');
  assert(evaluateTicketMatch([5, 15, 25, 35, 2], target).tier === 'tier_4_match', '4 of 5 matches Tier 4', 'DRAW');
  assert(evaluateTicketMatch([5, 15, 25, 1, 2], target).tier === 'tier_3_match', '3 of 5 matches Tier 3', 'DRAW');
  assert(evaluateTicketMatch([5, 15, 1, 2, 3], target).tier === 'none', '2 of 5 matches no tier', 'DRAW');

  // Prize pool floor
  assert(calculateTotalPrizePool(50, 29) === 5000, 'Prize pool floor is $5,000 even with 50 subs', 'DRAW');
  assert(calculateTotalPrizePool(1000, 29) === 14500, '1000 subs * $29 * 50% = $14,500', 'DRAW');

  // Multiple winners equal division test
  const w = nums1;
  const dummyTickets: DrawTicket[] = [
    // 2 Tier 5 winners
    { userId: 'u1', numbers: [w[0], w[1], w[2], w[3], w[4]], scoreIds: ['s1'] },
    { userId: 'u2', numbers: [w[0], w[1], w[2], w[3], w[4]], scoreIds: ['s2'] },
    // 3 Tier 4 winners
    { userId: 'u3', numbers: [w[0], w[1], w[2], w[3], 1], scoreIds: ['s3'] },
    { userId: 'u4', numbers: [w[0], w[1], w[2], w[3], 2], scoreIds: ['s4'] },
    { userId: 'u5', numbers: [w[0], w[1], w[2], w[3], 3], scoreIds: ['s5'] },
  ];

  const drawResult = simulateDraw(dummyTickets, 'random', seed, 10000, 2000);
  assert(drawResult.tier5.totalTierPool === 6000, 'Tier 5 pool = 40% of $10k ($4000) + $2000 rollover = $6000', 'DRAW');
  assert(drawResult.tier5.winnerCount === 2, '2 Tier 5 winners identified', 'DRAW');
  assert(drawResult.tier5.prizePerWinner === 3000, '$6000 divided equally between 2 winners = $3000 each', 'DRAW');
  assert(drawResult.tier4.winnerCount === 3, '3 Tier 4 winners identified', 'DRAW');
  assert(drawResult.tier4.totalTierPool === 3500, 'Tier 4 pool = 35% of $10k = $3500', 'DRAW');
  assert(drawResult.tier4.prizePerWinner === 1166.67, 'Tier 4 equal split rounded to 2 decimal places ($1166.67)', 'DRAW');
  assert(drawResult.nextRollover === 0, 'Rollover is 0 when Tier 5 has winners', 'DRAW');

  // No winners jackpot rollover
  const noTier5Tickets: DrawTicket[] = [
    { userId: 'u3', numbers: [w[0], w[1], w[2], w[3], 1], scoreIds: ['s3'] },
  ];
  const noWinResult = simulateDraw(noTier5Tickets, 'random', seed, 10000, 2500);
  assert(noWinResult.tier5.winnerCount === 0, 'Zero Tier 5 winners', 'DRAW');
  assert(noWinResult.nextRollover === 6500, 'Entire Tier 5 pool ($4000 + $2500 = $6500) rolls over to next month', 'DRAW');

  // -------------------------------------------------------------------------
  // 4. WINNER VERIFICATION & PAYOUT STATE MACHINE
  // -------------------------------------------------------------------------
  console.log('\n--- 4. WINNER VERIFICATION & PAYOUT STATE MACHINE ---');
  // File verification
  assert(validateProofFile('card.pdf', 1024 * 1024, 'application/pdf').isValid === true, 'PDF proof valid', 'WINNERS');
  assert(validateProofFile('card.png', 2 * 1024 * 1024, 'image/png').isValid === true, 'PNG proof valid', 'WINNERS');
  assert(validateProofFile('card.jpg', 3 * 1024 * 1024, 'image/jpeg').isValid === true, 'JPG proof valid', 'WINNERS');
  assert(validateProofFile('exploit.exe', 1024, 'application/x-msdownload').isValid === false, 'Malicious .exe rejected', 'WINNERS');
  assert(validateProofFile('large.pdf', 10 * 1024 * 1024, 'application/pdf').isValid === false, 'Oversized 10MB file rejected', 'WINNERS');
  assert(validateProofFile('empty.png', 0, 'image/png').isValid === false, '0-byte file rejected', 'WINNERS');

  // State machine guards
  const baseWinner: Winner = {
    id: 'w1',
    draw_id: 'd1',
    draw_entry_id: 'de1',
    user_id: 'u1',
    match_count: 5,
    prize_tier: 'tier_5_match',
    prize_amount: 5000,
    proof_status: 'pending_submission',
    payout_status: 'unpaid',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // State 1: pending_submission
  assert(canSubmitProof(baseWinner) === true, 'Pending winner can submit proof', 'WINNERS');
  assert(canApproveOrRejectProof(baseWinner) === false, 'Pending winner cannot be reviewed yet', 'WINNERS');
  assert(canProcessPayout(baseWinner) === false, 'CRITICAL: Pending winner cannot be paid', 'WINNERS');

  // State 2: submitted
  const submittedWinner: Winner = { ...baseWinner, proof_status: 'submitted' };
  assert(canSubmitProof(submittedWinner) === false, 'Submitted winner cannot re-submit while under review', 'WINNERS');
  assert(canApproveOrRejectProof(submittedWinner) === true, 'Submitted winner can be reviewed by admin', 'WINNERS');
  assert(canProcessPayout(submittedWinner) === false, 'CRITICAL: Submitted winner cannot be paid before approval', 'WINNERS');

  // State 3: rejected
  const rejectedWinner: Winner = { ...baseWinner, proof_status: 'rejected' };
  assert(canSubmitProof(rejectedWinner) === true, 'Rejected winner CAN re-upload new proof', 'WINNERS');
  assert(canProcessPayout(rejectedWinner) === false, 'CRITICAL: Rejected winner CANNOT be paid', 'WINNERS');

  // State 4: approved
  const approvedWinner: Winner = { ...baseWinner, proof_status: 'approved' };
  assert(canSubmitProof(approvedWinner) === false, 'Approved winner cannot re-upload proof', 'WINNERS');
  assert(canProcessPayout(approvedWinner) === true, 'Approved winner CAN be processed for payout', 'WINNERS');

  // State 5: paid (Duplicate Payout Guard)
  const paidWinner: Winner = { ...baseWinner, proof_status: 'approved', payout_status: 'paid' };
  assert(canProcessPayout(paidWinner) === false, 'CRITICAL GUARD: Paid winner CANNOT be paid a second time (Duplicate Payout Prevented)', 'WINNERS');

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`   AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED across 4 domains `);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runFullEngineeringAudit();
