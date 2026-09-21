import { DrawMode, PrizeTier } from '@/lib/types';

export interface DrawTicket {
  userId: string;
  numbers: number[]; // 5 numbers in 1..45
  scoreIds: string[];
}

export interface TierResult {
  tier: PrizeTier;
  winnerCount: number;
  totalTierPool: number;
  prizePerWinner: number;
  winners: {
    userId: string;
    ticket: number[];
    matchCount: number;
    prizeAmount: number;
  }[];
}

export interface DrawSimulationResult {
  winningNumbers: number[];
  mode: DrawMode;
  seed: string;
  totalPrizePool: number;
  previousRollover: number;
  nextRollover: number;
  tier5: TierResult;
  tier4: TierResult;
  tier3: TierResult;
  unmatchedCount: number;
  totalEntriesCount: number;
}

/**
 * Seedable Pseudo-Random Number Generator (Mulberry32).
 * Guarantees deterministic, reproducible draw number generation for auditing.
 */
export function createPRNG(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = Math.imul(31, hash) + seedStr.charCodeAt(i) | 0;
  }
  let state = hash ^ 0xDEADBEEF;

  return function () {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = t + Math.imul(t ^ (t >>> 8), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates 5 unique numbers in range 1..45 using deterministic PRNG.
 */
export function generateRandomWinningNumbers(seed: string): number[] {
  const prng = createPRNG(seed);
  const selected = new Set<number>();

  while (selected.size < 5) {
    const num = Math.floor(prng() * 45) + 1;
    selected.add(num);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Generates 5 winning numbers weighted by frequency of numbers across active tickets.
 */
export function generateAlgorithmicWinningNumbers(tickets: DrawTicket[], seed: string): number[] {
  if (tickets.length === 0) {
    return generateRandomWinningNumbers(seed);
  }

  // Calculate frequency of each number 1..45
  const frequency: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 1; // Base pseudo-count

  tickets.forEach((t) => {
    t.numbers.forEach((n) => {
      if (n >= 1 && n <= 45) {
        frequency[n] = (frequency[n] || 0) + 1;
      }
    });
  });

  const prng = createPRNG(seed);
  const selected = new Set<number>();

  while (selected.size < 5) {
    // Weighted selection
    const pool = Object.keys(frequency)
      .map(Number)
      .filter((n) => !selected.has(n));

    const totalWeight = pool.reduce((sum, n) => sum + frequency[n], 0);
    let randomVal = prng() * totalWeight;

    for (const num of pool) {
      randomVal -= frequency[num];
      if (randomVal <= 0) {
        selected.add(num);
        break;
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Evaluates match count between a user's 5 numbers and winning 5 numbers.
 */
export function evaluateTicketMatch(ticketNumbers: number[], winningNumbers: number[]): { matchCount: number; tier: PrizeTier } {
  const winningSet = new Set(winningNumbers);
  const userSet = new Set(ticketNumbers);

  let matchCount = 0;
  userSet.forEach((num) => {
    if (winningSet.has(num)) matchCount++;
  });

  let tier: PrizeTier = 'none';
  if (matchCount === 5) tier = 'tier_5_match';
  else if (matchCount === 4) tier = 'tier_4_match';
  else if (matchCount === 3) tier = 'tier_3_match';

  return { matchCount, tier };
}

/**
 * Calculates total prize pool from active subscriber count.
 * Business Logic Rule: Pool = Active Subscribers * $29 * 0.50 (50% pool allocation factor) or minimum $5,000.
 */
export function calculateTotalPrizePool(activeSubscribersCount: number, baseMonthlyPrice: number = 29): number {
  const calculated = Math.round(activeSubscribersCount * baseMonthlyPrice * 0.50 * 100) / 100;
  return Math.max(5000.00, calculated);
}

/**
 * Executes a deterministic draw simulation across active tickets.
 */
export function simulateDraw(
  tickets: DrawTicket[],
  mode: DrawMode,
  seed: string,
  totalPrizePool: number,
  previousRollover: number = 0
): DrawSimulationResult {
  const winningNumbers = mode === 'algorithmic'
    ? generateAlgorithmicWinningNumbers(tickets, seed)
    : generateRandomWinningNumbers(seed);

  // Pool allocations: 5-match (40% + rollover), 4-match (35%), 3-match (25%)
  const baseTier5Pool = Math.round(totalPrizePool * 0.40 * 100) / 100;
  const tier5TotalPool = Math.round((baseTier5Pool + previousRollover) * 100) / 100;

  const tier4TotalPool = Math.round(totalPrizePool * 0.35 * 100) / 100;
  const tier3TotalPool = Math.round(totalPrizePool * 0.25 * 100) / 100;

  const tier5Winners: { userId: string; ticket: number[]; matchCount: number; prizeAmount: number }[] = [];
  const tier4Winners: { userId: string; ticket: number[]; matchCount: number; prizeAmount: number }[] = [];
  const tier3Winners: { userId: string; ticket: number[]; matchCount: number; prizeAmount: number }[] = [];
  let unmatchedCount = 0;

  tickets.forEach((t) => {
    const { matchCount, tier } = evaluateTicketMatch(t.numbers, winningNumbers);
    if (tier === 'tier_5_match') {
      tier5Winners.push({ userId: t.userId, ticket: t.numbers, matchCount, prizeAmount: 0 });
    } else if (tier === 'tier_4_match') {
      tier4Winners.push({ userId: t.userId, ticket: t.numbers, matchCount, prizeAmount: 0 });
    } else if (tier === 'tier_3_match') {
      tier3Winners.push({ userId: t.userId, ticket: t.numbers, matchCount, prizeAmount: 0 });
    } else {
      unmatchedCount++;
    }
  });

  // Prize Equal Division among Winners within each Tier
  const tier5PrizePerWinner = tier5Winners.length > 0 ? Math.round((tier5TotalPool / tier5Winners.length) * 100) / 100 : 0;
  const tier4PrizePerWinner = tier4Winners.length > 0 ? Math.round((tier4TotalPool / tier4Winners.length) * 100) / 100 : 0;
  const tier3PrizePerWinner = tier3Winners.length > 0 ? Math.round((tier3TotalPool / tier3Winners.length) * 100) / 100 : 0;

  tier5Winners.forEach((w) => (w.prizeAmount = tier5PrizePerWinner));
  tier4Winners.forEach((w) => (w.prizeAmount = tier4PrizePerWinner));
  tier3Winners.forEach((w) => (w.prizeAmount = tier3PrizePerWinner));

  // Rollover Rule: If no 5-match winners exist, entire Tier 5 Pool rolls over
  const nextRollover = tier5Winners.length === 0 ? tier5TotalPool : 0;

  return {
    winningNumbers,
    mode,
    seed,
    totalPrizePool,
    previousRollover,
    nextRollover,
    tier5: {
      tier: 'tier_5_match',
      winnerCount: tier5Winners.length,
      totalTierPool: tier5TotalPool,
      prizePerWinner: tier5PrizePerWinner,
      winners: tier5Winners,
    },
    tier4: {
      tier: 'tier_4_match',
      winnerCount: tier4Winners.length,
      totalTierPool: tier4TotalPool,
      prizePerWinner: tier4PrizePerWinner,
      winners: tier4Winners,
    },
    tier3: {
      tier: 'tier_3_match',
      winnerCount: tier3Winners.length,
      totalTierPool: tier3TotalPool,
      prizePerWinner: tier3PrizePerWinner,
      winners: tier3Winners,
    },
    unmatchedCount,
    totalEntriesCount: tickets.length,
  };
}
