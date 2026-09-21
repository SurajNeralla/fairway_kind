"use client";

import React from 'react';
import Link from 'next/link';
import { Target, Heart, Trophy, CheckCircle2, ShieldCheck, Award, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="bg-background text-on-surface antialiased py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            The Purpose Cycle
          </div>
          <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-background tracking-tight leading-tight font-semibold">
            How Fairway<span className="text-primary">Kind</span> Operates
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            FairwayKind combines golf performance tracking, guaranteed monthly community prize pools, and transparent non-profit funding into an elegant, mindful subscription platform. Feel, not fairway.
          </p>
        </div>

        {/* 4 Pillars Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. Golf Score Engine */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Pillar 01</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">1. Golf Score Engine</h3>
              </div>
            </div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">
              Universal course compatibility. Log verified rounds from any accredited facility worldwide.
            </p>
            <ul className="space-y-3 text-body-sm text-on-surface">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Score Range:</strong> Valid Stableford points are strictly between 1 and 45 points.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>One Score Per Date:</strong> Members can submit one attested score per calendar date.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Rolling 5 Active Scores:</strong> The system retains your 5 newest scores for monthly draw qualification. A 6th round replaces the oldest.</span>
              </li>
            </ul>
          </div>

          {/* 2. Monthly Draw Engine */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed/40 flex items-center justify-center text-secondary">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Pillar 02</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">2. Skill-Verified Monthly Draws</h3>
              </div>
            </div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">
              Closed-loop skill performance reward system designed in compliance with state and federal contest regulations. Zero gambling or sports-book speculation.
            </p>
            <ul className="space-y-3 text-body-sm text-on-surface">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-1" />
                <span><strong>Tier 5 Match (Grand Skill Tier):</strong> Receives 40% of the monthly pool (+ rollover from unclaimed 5-match rounds).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-1" />
                <span><strong>Tier 4 Match (Secondary Tier):</strong> Receives 35% of the allocated monthly draw pool.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-1" />
                <span><strong>Tier 3 Match (Foundation Tier):</strong> Receives 25% of the pool, distributed equally among verified entrants.</span>
              </li>
            </ul>
          </div>

          {/* 3. Charity Allocations */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Pillar 03</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">3. Guaranteed Philanthropic Impact</h3>
              </div>
            </div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">
              Directly funding vetted 501(c)(3) charities in junior golf access, ocean stewardship, and pediatric care.
            </p>
            <ul className="space-y-3 text-body-sm text-on-surface">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Minimum 10% Contribution:</strong> Every monthly subscription automatically allocates 10% directly to your chosen charity.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Voluntary Round Matches:</strong> Members can boost their giving up to 100% per round with certified tax receipts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>100% Escrow Transparency:</strong> Monies are audited by independent philanthropic escrow before disbursement.</span>
              </li>
            </ul>
          </div>

          {/* 4. Winner Verification & Payouts */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Pillar 04</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">4. Proof Verification & Payouts</h3>
              </div>
            </div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">
              Integrity guaranteed through peer marker validation and digital handicap audit registries.
            </p>
            <ul className="space-y-3 text-body-sm text-on-surface">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Marker Attestation:</strong> Winning scores must be verified by a registered marker or attested physical card upload.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Compliance Audit:</strong> Payout proofs are validated by our compliance officers before settlement.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Automated ACH Disbursement:</strong> Funds transfer securely on the 1st of every month via connected bank transfer.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-12 custom-card-shadow flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">Ready to Elevate Your Play?</h3>
            <p className="text-on-surface-variant font-body-md text-body-md">Join thousands of mindful golfers making every swing count toward social good.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/subscribe"
              className="bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg px-8 py-3.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow flex items-center gap-2 font-semibold"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
