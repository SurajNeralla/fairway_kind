"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, CheckCircle2, ArrowLeft, Target, Award } from 'lucide-react';

export default function ResponsiblePlayPage() {
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
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Integrity &amp; Ethics</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background">
            Responsible Play &amp; Fair Competition
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
            Feel, Not Fairway. Championing honest golf handicapping, transparent rewards, and positive social impact.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-12 space-y-10 custom-card-shadow">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <Target className="w-5 h-5 text-primary" />
              1. Non-Gambling, Skill-Based Architecture
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              FairwayKind is intentionally engineered as an athletic performance tracking club rather than a wagering platform. Draw entries are solely determined by genuine rounds of golf played under the Rules of Golf and scored via standard Stableford points. You cannot purchase extra entries, buy additional lottery tickets, or wager funds on individual rounds.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <Award className="w-5 h-5 text-primary" />
              2. Attestation &amp; Handicap Honesty
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              The soul of golf lies in self-governance and integrity. We uphold this tradition through strict verification:
            </p>
            <ul className="space-y-2.5 text-sm md:text-base text-on-surface pl-2 pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Scorecard Verification:</strong> All winning entries undergo human and algorithmic audit against official digital scorecard systems (GHIN, Golf Ireland, Golf Canada, etc.).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Sandbagging Prevention:</strong> Unusually abnormal scoring patterns or fabricated rounds result in immediate disqualification and account review.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>One Entry Per Date:</strong> Prevents round stacking or synthetic volume manipulation.</span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <HeartHandshake className="w-5 h-5 text-secondary" />
              3. Philanthropic Purpose
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              Our model ensures that win or lose, every member is an active philanthropist. Every month, your participation directs vital funding to underrepresented youth golfers, clean ocean sanctuaries, and pediatric healthcare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
