"use client";

import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, UploadCloud, Clock, ShieldCheck, ArrowLeft, DollarSign } from 'lucide-react';

export default function VerificationProcessPage() {
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
            <Award className="w-3.5 h-3.5 text-primary" />
            <span>Audit &amp; Compliance Standards</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background">
            Winner Verification Process
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
            Our 4-step verification protocol protects community prize pool integrity and ensures all rewards are granted to legitimate, verified golfers.
          </p>
        </div>

        {/* 4-Step Verification Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 space-y-3 custom-card-shadow">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-bold">
              01
            </div>
            <h3 className="font-semibold text-lg text-on-surface">Draw Finalization &amp; Notification</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              When the monthly draw closes, the deterministic draw engine computes matching ticket tiers. Winners are instantly alerted in their user dashboard.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 space-y-3 custom-card-shadow">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-bold">
              02
            </div>
            <h3 className="font-semibold text-lg text-on-surface">Scorecard Proof Upload</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Subscribers upload a digital screenshot or photo of their attested scorecard from their golf club or handicap app (PNG, JPG, or PDF up to 5MB).
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 space-y-3 custom-card-shadow">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-bold">
              03
            </div>
            <h3 className="font-semibold text-lg text-on-surface">Admin Manual Review</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Platform compliance officers cross-reference round dates, course slope ratings, and Stableford calculations. Status transitions from <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded">submitted</span> to <span className="font-mono text-xs bg-primary-fixed/30 text-primary px-2 py-0.5 rounded">approved</span>.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 space-y-3 custom-card-shadow">
            <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 flex items-center justify-center text-secondary font-bold">
              04
            </div>
            <h3 className="font-semibold text-lg text-on-surface">Direct Bank Payout</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Approved funds are disbursed via secure bank wire or Stripe transfer. Transaction receipts are logged to the public escrow audit ledger.
            </p>
          </div>
        </div>

        {/* Security & Rejection Criteria */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-10 space-y-6 custom-card-shadow">
          <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Acceptable Proof Standards
          </h2>
          <ul className="space-y-3 text-sm md:text-base text-on-surface-variant">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
              <span>Attested scorecards bearing playing partner signature or digital verification stamp.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
              <span>Official screenshots from GHIN, USGA, WHS, GolfBox, or accredited national association apps.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
              <span>Score submissions must clearly exhibit the date of play and the player name corresponding to the account holder.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
