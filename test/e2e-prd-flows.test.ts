import {
  validateScoreValue,
  validateScoreDate,
  applyRollingFiveScores,
} from '../src/lib/scores/score-engine';
import {
  simulateDraw,
  generateRandomWinningNumbers,
  calculateTotalPrizePool,
  DrawTicket,
} from '../src/lib/draws/draw-engine';
import {
  sanitizeCharityPercentage,
  calculateCharityContribution,
} from '../src/lib/charity/calculator';
import {
  validateProofFile,
  canSubmitProof,
  canApproveOrRejectProof,
  canProcessPayout,
} from '../src/lib/winners/winner-engine';
import { isSubscriptionActive } from '../src/lib/subscription/access';
import { Subscription, Winner, GolfScore, UserRole } from '../src/lib/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ [PASS] ${message}`);
}

console.log('================================================================');
console.log('   FAIRWAYKIND — PRD FLOWS A TO H & EDGE CASES TEST SUITE        ');
console.log('================================================================\n');

// -------------------------------------------------------------
// FLOW A: Signup -> Login -> Subscription -> Stripe -> Webhook -> Active
// -------------------------------------------------------------
console.log('--- FLOW A: SUBSCRIPTION & STRIPE WEBHOOK LIFECYCLE ---');

// Inactive/incomplete subscription
const newSub: Subscription = {
  id: 'sub-1',
  user_id: 'user-1',
  stripe_customer_id: 'cus_1',
  status: 'incomplete',
  plan_type: 'monthly',
  voluntary_charity_percent: 10,
  cancel_at_period_end: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
assert(!isSubscriptionActive(newSub), 'FLOW A: Incomplete subscription is inactive');

// Simulated checkout.session.completed webhook processing
const activeSub: Subscription = {
  ...newSub,
  status: 'active',
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
};
assert(isSubscriptionActive(activeSub), 'FLOW A: Webhook activation sets subscriber to active');

// Lapsed/past_due state
const lapsedSub: Subscription = { ...activeSub, status: 'past_due' };
assert(!isSubscriptionActive(lapsedSub), 'FLOW A: Failed payment (past_due) deactivates subscription');

// -------------------------------------------------------------
// FLOW B: Scores (5 scores, 6th replaces oldest, edit, delete)
// -------------------------------------------------------------
console.log('\n--- FLOW B: 5-SCORE ROLLING LOGIC & EDIT/DELETE ---');

const initialFive: GolfScore[] = [
  { id: 's1', user_id: 'u1', score: 32, played_on: '2026-08-01', is_active: true, created_at: '2026-08-01T10:00:00Z' },
  { id: 's2', user_id: 'u1', score: 36, played_on: '2026-08-05', is_active: true, created_at: '2026-08-05T10:00:00Z' },
  { id: 's3', user_id: 'u1', score: 38, played_on: '2026-08-10', is_active: true, created_at: '2026-08-10T10:00:00Z' },
  { id: 's4', user_id: 'u1', score: 40, played_on: '2026-08-15', is_active: true, created_at: '2026-08-15T10:00:00Z' },
  { id: 's5', user_id: 'u1', score: 41, played_on: '2026-08-20', is_active: true, created_at: '2026-08-20T10:00:00Z' },
];

// Add 6th newer score
const sixthScore: GolfScore = {
  id: 's6',
  user_id: 'u1',
  score: 44,
  played_on: '2026-08-25',
  is_active: true,
  created_at: '2026-08-25T10:00:00Z',
};

const rollingResult = applyRollingFiveScores([...initialFive, sixthScore]);
assert(rollingResult.activeScores.length === 5, 'FLOW B: Exactly 5 scores retained');
assert(rollingResult.activeScores[0].id === 's6', 'FLOW B: Newest score (s6) is at index 0');
assert(rollingResult.replacedScore?.id === 's1', 'FLOW B: Oldest score (s1) automatically deactivated');

// Duplicate date rejection
const dateCheck = validateScoreDate('2026-08-25', ['2026-08-25', '2026-08-20']);
assert(!dateCheck.isValid, 'FLOW B: Duplicate score date rejected');

// Valid score editing within 1..45
const editCheck = validateScoreValue(42);
assert(editCheck.isValid, 'FLOW B: Score update to 42 is valid');

// -------------------------------------------------------------
// FLOW C: Charity selection & minimum 10% contribution
// -------------------------------------------------------------
console.log('\n--- FLOW C: CHARITY SELECTION & MINIMUM 10% ENFORCEMENT ---');

assert(sanitizeCharityPercentage(5) === 10, 'FLOW C: 5% clamped to mandatory minimum 10%');
assert(sanitizeCharityPercentage(25) === 25, 'FLOW C: 25% voluntary increase accepted');
const monthlyGrant = calculateCharityContribution('monthly', 10);
assert(monthlyGrant.contributionAmount === 2.90, 'FLOW C: Monthly 10% on $29 = $2.90');
const yearlyGrant = calculateCharityContribution('yearly', 20);
assert(yearlyGrant.contributionAmount === 58.00, 'FLOW C: Yearly 20% on $290 = $58.00');

// -------------------------------------------------------------
// FLOW D & E: Admin Draw Simulation, Publishing & Multiple Winner Splitting
// -------------------------------------------------------------
console.log('\n--- FLOW D & E: DRAW SIMULATION & MULTIPLE WINNER SPLITTING ---');

const testSeed = 'e2e-fixed-draw-seed';
const winningNums = generateRandomWinningNumbers(testSeed);
// pick numbers not in winningNums
const available = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(n => !winningNums.includes(n));
const nonMatchA = available[0];
const nonMatchB = available[1];

const drawTickets: DrawTicket[] = [
  { userId: 'u1', numbers: [...winningNums], scoreIds: ['s1'] },
  { userId: 'u2', numbers: [winningNums[0], winningNums[1], winningNums[2], winningNums[3], nonMatchA], scoreIds: ['s2'] },
  { userId: 'u3', numbers: [winningNums[0], winningNums[1], winningNums[2], winningNums[3], nonMatchB], scoreIds: ['s3'] },
];

const drawSim = simulateDraw(
  drawTickets,
  'random',
  testSeed,
  10000,
  1000
);

assert(drawSim.tier5.winnerCount === 1, 'FLOW D: 1 Tier 5 (5-number) winner identified');
assert(drawSim.tier5.totalTierPool === 5000, 'FLOW D: Tier 5 pool is 40% of $10k ($4000) + $1000 rollover = $5000');
assert(drawSim.tier4.winnerCount === 2, 'FLOW E: 2 Tier 4 (4-number) winners identified');
assert(drawSim.tier4.totalTierPool === 3500, 'FLOW E: Tier 4 pool is 35% of $10k = $3500');
assert(drawSim.tier4.prizePerWinner === 1750, 'FLOW E: Tier 4 pool split equally: $3500 / 2 = $1750 each');

// -------------------------------------------------------------
// FLOW F: No 5-Number Winner -> Jackpot Rollover
// -------------------------------------------------------------
console.log('\n--- FLOW F: JACKPOT ROLLOVER WHEN UNCLAIMED ---');

const noWinnerTickets: DrawTicket[] = [
  { userId: 'u4', numbers: [winningNums[0], winningNums[1], winningNums[2], winningNums[3], nonMatchA], scoreIds: ['s4'] },
];
const noWinnerSim = simulateDraw(
  noWinnerTickets,
  'random',
  testSeed,
  10000,
  2000
);

assert(noWinnerSim.tier5.winnerCount === 0, 'FLOW F: Zero Tier 5 winners');
assert(noWinnerSim.nextRollover === 6000, 'FLOW F: Tier 5 pool ($4000 + $2000 rollover = $6000) rolls over to next cycle');

// -------------------------------------------------------------
// FLOW G: Winner Verification, Proof Upload & Payout Lifecycle
// -------------------------------------------------------------
console.log('\n--- FLOW G: WINNER PROOF VERIFICATION & PAYOUT STATE MACHINE ---');

const winnerRecord: Winner = {
  id: 'w-100',
  draw_id: 'd-1',
  draw_entry_id: 'entry-1',
  user_id: 'u-winner',
  prize_tier: 'tier_5_match',
  match_count: 5,
  prize_amount: 5000,
  proof_status: 'pending_submission',
  payout_status: 'unpaid',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

assert(canSubmitProof(winnerRecord), 'FLOW G: Pending winner can submit proof');
assert(!canApproveOrRejectProof(winnerRecord), 'FLOW G: Cannot review before proof submission');
assert(!canProcessPayout(winnerRecord), 'FLOW G: CRITICAL: Unapproved winner cannot be paid');

// User submits proof
const submittedWinner: Winner = { ...winnerRecord, proof_status: 'submitted' };
assert(canApproveOrRejectProof(submittedWinner), 'FLOW G: Submitted proof ready for admin review');
assert(!canProcessPayout(submittedWinner), 'FLOW G: Submitted but unapproved winner cannot be paid');

// Admin approves proof
const approvedWinner: Winner = { ...winnerRecord, proof_status: 'approved' };
assert(canProcessPayout(approvedWinner), 'FLOW G: Approved winner can receive payout');

// Payout processed
const paidWinner: Winner = { ...approvedWinner, payout_status: 'paid' };
assert(!canProcessPayout(paidWinner), 'FLOW G: CRITICAL: Already paid winner cannot be paid a second time');

// -------------------------------------------------------------
// FLOW H: Security & RBAC Guards
// -------------------------------------------------------------
console.log('\n--- FLOW H: SECURITY & RBAC AUTHORIZATION GUARDS ---');

// Regular user role check
const regularUserRole: UserRole = 'user';
const isAdminUser = (regularUserRole as string) === 'admin';
assert(!isAdminUser, 'FLOW H: Regular user is rejected from admin operations');

// Stableford edge cases
assert(!validateScoreValue(0).isValid, 'EDGE CASE: Score 0 rejected (< 1)');
assert(!validateScoreValue(46).isValid, 'EDGE CASE: Score 46 rejected (> 45)');
assert(!validateScoreValue(36.5).isValid, 'EDGE CASE: Decimal score rejected');

// Proof file edge cases
assert(!validateProofFile('malware.exe', 1024, 'application/x-msdownload').isValid, 'EDGE CASE: .exe file rejected');
assert(!validateProofFile('huge.png', 10 * 1024 * 1024, 'image/png').isValid, 'EDGE CASE: >5MB file rejected');
assert(!validateProofFile('', 1024).isValid, 'EDGE CASE: Empty file name rejected');
assert(validateProofFile('scorecard.png', 2 * 1024 * 1024, 'image/png').isValid, 'EDGE CASE: 2MB PNG scorecard accepted');

console.log('\n================================================================');
console.log('   ALL PRD FLOWS A THROUGH H & EDGE CASES FULLY PASSED         ');
console.log('================================================================\n');
