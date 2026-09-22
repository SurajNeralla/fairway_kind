"use client";

import React from 'react';
import Link from 'next/link';
import { Scale, CheckCircle2, AlertCircle, ArrowLeft, Trophy, Heart } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-background text-on-surface antialiased py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-container transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-primary" />
            <span>Membership Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background">
            Terms of Service
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
            Edition 2026 • Governed by the Digital Heroes Platform Standard
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-12 space-y-10 custom-card-shadow">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              1. Platform Nature &amp; Eligibility
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              FairwayKind is a skill-driven golf performance tracking and community reward application with an integrated non-profit contribution engine. It is strictly non-gambling. Membership is open to amateur golfers aged 18 or older holding an official handicap or logging attested Stableford rounds.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-primary" />
              2. Score Submission &amp; Rolling 5 Mechanics
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              By participating in FairwayKind, members agree to adhere strictly to fair play standards:
            </p>
            <ul className="space-y-2.5 text-sm md:text-base text-on-surface pl-2 pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Stableford Bounds:</strong> Valid scores range from 1 to 45 points inclusive. Scores outside this range are automatically rejected.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Single Score Per Date:</strong> Members may register at most one score per calendar date. Existing rounds on a date may be edited or removed, but duplicates are blocked.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Rolling 5 Retention:</strong> Only the latest 5 active scores are retained for monthly draw qualification. A new score automatically deactivates the oldest stored entry.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-secondary" />
              3. Philanthropic Allocation Guarantee
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              A mandatory minimum of 10% of every subscription fee is escrowed and remitted to your designated 501(c)(3) partner charity. Members may voluntarily increase this allocation up to 100%. Charitable allocations are irrevocable once the monthly billing cycle closes.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              4. Monthly Draws &amp; Prize Disbursals
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              Monthly draws generate 5 winning numbers based either on deterministic lottery-style random selection or score-frequency algorithmic weighting:
            </p>
            <ul className="space-y-2 text-sm md:text-base text-on-surface-variant pl-4 list-disc">
              <li><strong>Tier 5 Match (40% Pool):</strong> Splits equally among 5-number matches. If unclaimed, rolls over into the subsequent monthly jackpot.</li>
              <li><strong>Tier 4 Match (35% Pool):</strong> Splits equally among 4-number matches. Does not roll over.</li>
              <li><strong>Tier 3 Match (25% Pool):</strong> Splits equally among 3-number matches. Does not roll over.</li>
              <li><strong>Winner Verification:</strong> Payout eligibility requires uploading an authentic scorecard screenshot from your golf platform within 30 days of draw publication.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-error" />
              5. Subscription Billing &amp; Cancellation
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              Subscriptions renew automatically on a monthly ($29/month) or annual ($290/year) basis. Members may cancel at any time via the user dashboard or Stripe customer portal. Cancellation takes effect at the end of the current billing cycle with no cancellation penalties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
