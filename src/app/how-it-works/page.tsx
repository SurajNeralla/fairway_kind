"use client";

import React from 'react';
import { Target, Heart, Trophy, CheckCircle2, ShieldAlert, Award, FileText, Gift } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <Badge variant="cyan">Platform Rules & Architecture</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          How Digital Heroes Operates
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Digital Heroes combines golf performance tracking, guaranteed monthly prize pools, and transparent non-profit funding into a unified subscription platform.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card variant="glass" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF]">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Golf Score Engine</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
              <span>Score Range: Valid Stableford score values are strictly between 1 and 45 points.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
              <span>One Score Per Date: Users can only log 1 score per played date.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
              <span>Latest 5 Active Scores: The system retains only your 5 newest scores for draw entries. Adding a 6th score automatically replaces the oldest stored score.</span>
            </li>
          </ul>
        </Card>

        <Card variant="glass" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Monthly Draw Engine</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Tier 5 Match (5 numbers match): Receives 40% of the monthly prize pool (+ rollover from unclaimed 5-match jackpot).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Tier 4 Match (4 numbers match): Receives 35% of the prize pool.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Tier 3 Match (3 numbers match): Receives 25% of the prize pool.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Equal Division: Multiple winners within a tier split that tier’s pool equally.</span>
            </li>
          </ul>
        </Card>

        <Card variant="glass" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Charity Allocations</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Minimum 10%: Every subscription automatically donates 10% of the fee to your selected charity.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Voluntary Increase: Subscribers can freely increase their charity allocation slider up to 100%.</span>
            </li>
          </ul>
        </Card>

        <Card variant="glass" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">4. Winner Verification & Payouts</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <span>Proof Upload: Winners must upload official scorecard or handicap certificate proof.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <span>Admin Verification: Admins review submissions and approve or reject proof before changing state to Paid.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
