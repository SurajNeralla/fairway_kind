import { PlanType } from '@/lib/types';

export interface ContributionCalculation {
  subscriptionPrice: number;
  percentage: number;
  contributionAmount: number;
  planType: PlanType;
}

/**
 * Validates and clamps voluntary charity percentage to range 10.00% to 100.00%.
 * Prevents client-side manipulation below the 10% minimum threshold.
 */
export function sanitizeCharityPercentage(inputPercent: number): number {
  if (isNaN(inputPercent) || inputPercent < 10) {
    return 10.00;
  }
  if (inputPercent > 100) {
    return 100.00;
  }
  return Math.round(inputPercent * 100) / 100;
}

/**
 * Calculates exact dollar contribution amount based on plan type and percentage.
 * Monthly plan = $29.00
 * Yearly plan = $290.00
 */
export function calculateCharityContribution(
  planType: PlanType,
  voluntaryPercent: number
): ContributionCalculation {
  const percentage = sanitizeCharityPercentage(voluntaryPercent);
  const subscriptionPrice = planType === 'yearly' ? 290.00 : 29.00;
  const contributionAmount = Math.round(subscriptionPrice * (percentage / 100) * 100) / 100;

  return {
    subscriptionPrice,
    percentage,
    contributionAmount,
    planType,
  };
}
