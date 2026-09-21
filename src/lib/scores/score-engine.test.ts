import { validateScoreValue, validateScoreDate, applyRollingFiveScores } from './score-engine';
import { GolfScore } from '@/lib/types';

// Simple unit assertion runner
function runUnitTests() {
  console.log('--- STARTING GOLF SCORE ENGINE UNIT TESTS ---');
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

  // 1. Score Range Validation Tests (1-45 integer)
  assert(validateScoreValue(36).isValid === true, 'Score = 36 is valid');
  assert(validateScoreValue(1).isValid === true, 'Score = 1 (min boundary) is valid');
  assert(validateScoreValue(45).isValid === true, 'Score = 45 (max boundary) is valid');
  assert(validateScoreValue(0).isValid === false, 'Score = 0 is invalid (<1)');
  assert(validateScoreValue(46).isValid === false, 'Score = 46 is invalid (>45)');
  assert(validateScoreValue(-5).isValid === false, 'Negative score is invalid');
  assert(validateScoreValue(36.5).isValid === false, 'Decimal score is invalid');

  // 2. Mandatory Date & Duplicate Date Validation
  assert(validateScoreDate('').isValid === false, 'Empty date is invalid');
  assert(validateScoreDate('2026-09-15', ['2026-09-15']).isValid === false, 'Duplicate date is rejected');
  assert(validateScoreDate('2026-09-15', ['2026-09-10']).isValid === true, 'Unique date is accepted');

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const futureStr = futureDate.toISOString().split('T')[0];
  assert(validateScoreDate(futureStr).isValid === false, 'Future date is rejected');

  // 3. Rolling-Five Replacement Behavior Test
  const mockScores: GolfScore[] = [
    { id: '1', user_id: 'u1', score: 30, played_on: '2026-08-01', is_active: true, created_at: '2026-08-01T00:00:00Z' },
    { id: '2', user_id: 'u1', score: 32, played_on: '2026-08-05', is_active: true, created_at: '2026-08-05T00:00:00Z' },
    { id: '3', user_id: 'u1', score: 34, played_on: '2026-08-10', is_active: true, created_at: '2026-08-10T00:00:00Z' },
    { id: '4', user_id: 'u1', score: 36, played_on: '2026-08-15', is_active: true, created_at: '2026-08-15T00:00:00Z' },
    { id: '5', user_id: 'u1', score: 38, played_on: '2026-08-20', is_active: true, created_at: '2026-08-20T00:00:00Z' },
  ];

  // Initially 5 scores exist
  let result = applyRollingFiveScores(mockScores);
  assert(result.activeScores.length === 5, 'Initially 5 active scores exist');
  assert(result.replacedScore === null, 'No score replaced when total count = 5');

  // Add a 6th newer score (Date: 2026-08-25)
  const score6: GolfScore = {
    id: '6',
    user_id: 'u1',
    score: 42,
    played_on: '2026-08-25',
    is_active: true,
    created_at: '2026-08-25T00:00:00Z',
  };

  const scores6 = [...mockScores, score6];
  result = applyRollingFiveScores(scores6);

  assert(result.activeScores.length === 5, 'After adding 6th score, active count remains strictly 5');
  assert(result.activeScores[0].score === 42, 'Newest score (42) is ranked #1 at top');
  assert(result.replacedScore !== null && result.replacedScore.id === '1', 'Oldest score (ID: 1, Date: 2026-08-01, Score: 30) is replaced');

  console.log(`--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runUnitTests();
