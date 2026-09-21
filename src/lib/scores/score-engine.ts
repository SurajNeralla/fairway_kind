import { GolfScore } from '@/lib/types';

export interface ScoreValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a golf score value according to PRD rules (Integer between 1 and 45).
 */
export function validateScoreValue(score: number): ScoreValidationResult {
  if (score === undefined || score === null || isNaN(score)) {
    return { isValid: false, error: 'Score is required.' };
  }
  if (!Number.isInteger(score)) {
    return { isValid: false, error: 'Score must be a whole integer.' };
  }
  if (score < 1 || score > 45) {
    return { isValid: false, error: 'Score must be between 1 and 45 points in Stableford format.' };
  }
  return { isValid: true };
}

/**
 * Validates a score played_on date according to PRD rules (mandatory, not future date).
 */
export function validateScoreDate(playedOn: string, existingDates: string[] = [], currentScoreId?: string): ScoreValidationResult {
  if (!playedOn || playedOn.trim() === '') {
    return { isValid: false, error: 'Played date is mandatory.' };
  }

  const selectedDate = new Date(playedOn);
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Invalid date format.' };
  }

  // Prevent future dates
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (selectedDate > today) {
    return { isValid: false, error: 'Score date cannot be in the future.' };
  }

  // Check duplicate date for user
  const formattedDate = playedOn.split('T')[0];
  if (existingDates.includes(formattedDate)) {
    return { isValid: false, error: 'You have already logged a score for this date. Only one score is allowed per date.' };
  }

  return { isValid: true };
}

/**
 * Rolling Five Logic Helper:
 * Given a list of user scores, orders them newest date first and retains strictly the top 5 newest scores.
 * When a 6th score is added, the oldest score is identified and removed/replaced.
 */
export function applyRollingFiveScores(scores: GolfScore[]): { activeScores: GolfScore[]; replacedScore: GolfScore | null } {
  // Sort scores newest played_on date first (break ties with created_at)
  const sorted = [...scores].sort((a, b) => {
    const dateA = new Date(a.played_on).getTime();
    const dateB = new Date(b.played_on).getTime();
    if (dateB !== dateA) return dateB - dateA;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const activeScores = sorted.slice(0, 5).map(s => ({ ...s, is_active: true }));
  const overflow = sorted.slice(5);
  const replacedScore = overflow.length > 0 ? overflow[0] : null;

  return { activeScores, replacedScore };
}
