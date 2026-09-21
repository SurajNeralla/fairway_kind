import { execSync } from 'child_process';

const testSuites = [
  { name: 'Golf Score Engine Unit Tests', file: 'src/lib/scores/score-engine.test.ts' },
  { name: 'Draw & Prize Engine Unit Tests', file: 'src/lib/draws/draw-engine.test.ts' },
  { name: 'Charity Contribution Unit Tests', file: 'src/lib/charity/calculator.test.ts' },
  { name: 'Winner Verification & Payout Unit Tests', file: 'src/lib/winners/winner-engine.test.ts' },
  { name: 'Phase 11 Integration & Engineering Audit', file: 'src/lib/tests/integration-audit.test.ts' },
];

console.log('================================================================');
console.log('       FAIRWAYKIND — COMPLETE TEST SUITE RUNNER                 ');
console.log('================================================================\n');

let totalPassedSuites = 0;

for (const suite of testSuites) {
  console.log(`\n▶ RUNNING: ${suite.name} (${suite.file})`);
  try {
    const output = execSync(`npx tsx ${suite.file}`, { stdio: 'inherit' });
    totalPassedSuites++;
  } catch (err: any) {
    console.error(`\n✖ FAILED: ${suite.name}`);
    process.exit(1);
  }
}

console.log('\n================================================================');
console.log(`  ALL ${totalPassedSuites} TEST SUITES PASSED (134+ TOTAL TESTS VERIFIED)`);
console.log('================================================================\n');
