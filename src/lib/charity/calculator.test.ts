import { sanitizeCharityPercentage, calculateCharityContribution } from './calculator';

function runCharityUnitTests() {
  console.log('--- STARTING CHARITY CONTRIBUTION CALCULATOR UNIT TESTS ---');
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

  // 1. Percentage Manipulation & Clamping Tests
  assert(sanitizeCharityPercentage(5) === 10, 'Manipulated 5% clamped up to minimum 10%');
  assert(sanitizeCharityPercentage(0) === 10, '0% clamped to 10%');
  assert(sanitizeCharityPercentage(-15) === 10, 'Negative percentage clamped to 10%');
  assert(sanitizeCharityPercentage(10) === 10, '10% remains 10%');
  assert(sanitizeCharityPercentage(25) === 25, '25% remains 25%');
  assert(sanitizeCharityPercentage(100) === 100, '100% remains 100%');
  assert(sanitizeCharityPercentage(150) === 100, '150% clamped down to 100%');

  // 2. Monthly Subscription ($29/mo) Calculations
  const m10 = calculateCharityContribution('monthly', 10);
  assert(m10.contributionAmount === 2.90, 'Monthly 10% on $29 = $2.90');

  const m15 = calculateCharityContribution('monthly', 15);
  assert(m15.contributionAmount === 4.35, 'Monthly 15% on $29 = $4.35');

  const m50 = calculateCharityContribution('monthly', 50);
  assert(m50.contributionAmount === 14.50, 'Monthly 50% on $29 = $14.50');

  const m100 = calculateCharityContribution('monthly', 100);
  assert(m100.contributionAmount === 29.00, 'Monthly 100% on $29 = $29.00');

  // 3. Yearly Subscription ($290/yr) Calculations
  const y10 = calculateCharityContribution('yearly', 10);
  assert(y10.contributionAmount === 29.00, 'Yearly 10% on $290 = $29.00');

  const y25 = calculateCharityContribution('yearly', 25);
  assert(y25.contributionAmount === 72.50, 'Yearly 25% on $290 = $72.50');

  const y100 = calculateCharityContribution('yearly', 100);
  assert(y100.contributionAmount === 290.00, 'Yearly 100% on $290 = $290.00');

  // 4. Malicious Browser Input Prevention Test
  const hackAttempt = calculateCharityContribution('monthly', 2);
  assert(hackAttempt.percentage === 10 && hackAttempt.contributionAmount === 2.90, 'Attempted 2% hack enforced to minimum $2.90');

  console.log(`--- CHARITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runCharityUnitTests();
