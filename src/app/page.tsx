"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target, Heart, Trophy, ArrowRight, ShieldCheck, Sparkles, Award,
  TrendingUp, CheckCircle2, ChevronRight, HelpCircle, Users, ExternalLink,
  Shield, Check, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Interactive sample ticket for demonstration
  const sampleTicket = [38, 41, 36, 40, 39];
  const sampleDraw = [38, 41, 36, 40, 44]; // 4 matches (38, 41, 36, 40)

  return (
    <div className="space-y-28 pb-24 overflow-x-hidden">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION                                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Ambient background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                Performance Rewards • Verified Social Impact
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white">
                Play Golf. Win Rewards.<br />
                <span className="gradient-text-emerald">Fund Impactful Causes.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Log your latest 5 Stableford golf scores to enter monthly cash prize draws. A minimum 10% of every membership is directly allocated to your chosen charity.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <Link href="/subscribe">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Join the Platform — Subscribe
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm">
                    How It Works
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                  <span>Skill-Based Allocation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span>Vetted 501(c)(3) Partners</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>40% / 35% / 25% Tier Splits</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Right Column: Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <Card variant="glow" className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF] font-bold">
                      DH
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">David K. — Golfer Hero</h3>
                      <p className="text-xs text-slate-400">Active Member • September Draw Ticket</p>
                    </div>
                  </div>
                  <Badge variant="emerald">Eligible</Badge>
                </div>

                {/* Score Grid Teaser */}
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-semibold uppercase tracking-wider text-slate-400">Rolling 5 Scores (1–45)</span>
                    <span className="text-[#00F0FF] font-medium">Draw Ready</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {sampleTicket.map((score, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                        <span className="block text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                        <span className="text-base font-extrabold text-white">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Charity Grant */}
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-emerald-400" /> St. Jude Children’s Research
                    </span>
                    <span className="text-emerald-400 font-bold">15% Voluntary Grant</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full w-3/4" />
                  </div>
                </div>

                <div className="pt-1 text-center text-xs text-slate-400 font-mono">
                  <span>Draw Ticket #DH-2026-SEP Active</span>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PLATFORM STATS TICKER                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center shadow-lg">
          <div className="space-y-1">
            <span className="block text-3xl font-extrabold text-[#00F0FF]">$1,420,000+</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Charity Funds Raised</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl font-extrabold text-emerald-400">24,000+</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Golfer Heroes</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl font-extrabold text-amber-400">40% / 35% / 25%</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Prize Pool Tier Splits</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl font-extrabold text-white">100%</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vetted 501(c)(3) Partners</span>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: WHAT YOU DO                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="cyan">Step 1 — What You Do</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Play Your Game. Log Your Scores.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            No simulations or fantasy picks. Your real-world golf performance directly powers your draw participation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glass" className="space-y-4 p-6">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF] font-bold text-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Play Official Stableford</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Play any registered course. Enter your points scored under the standard Stableford format (valid range: 1 to 45 points).
            </p>
          </Card>

          <Card variant="glass" className="space-y-4 p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-white">The Rolling-Five Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Only 1 score is allowed per date. Your latest 5 scores automatically form your active draw ticket. Adding a 6th replaces the oldest.
            </p>
          </Card>

          <Card variant="glass" className="space-y-4 p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Verified Score Proof</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you win a prize tier, upload a photo or PDF of your official scorecard or handicap certificate for admin verification.
            </p>
          </Card>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: HOW YOU WIN                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="gold">Step 2 — How You Win</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Monthly Draws. 3 Cash Prize Tiers.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            At the end of each month, 5 winning numbers (1–45) are drawn. Match numbers against your rolling-5 ticket to claim pool prizes.
          </p>
        </div>

        {/* Prize Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tier 5 */}
          <Card variant="glow" className="space-y-4 p-6 border-amber-500/40">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <Badge variant="gold">Tier 5 Match 🏆</Badge>
              <span className="text-xs text-amber-400 font-extrabold">40% Pool + Rollover</span>
            </div>
            <h3 className="text-2xl font-black text-white">Match 5 of 5</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Match all 5 numbers for the grand jackpot. If no one matches 5, 100% of this pool rolls over to the next month&apos;s draw!
            </p>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-[11px] text-amber-300">
              ✓ Unclaimed jackpot rolls over automatically
            </div>
          </Card>

          {/* Tier 4 */}
          <Card variant="glass" className="space-y-4 p-6 border-cyan-500/30">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <Badge variant="cyan">Tier 4 Match 🥈</Badge>
              <span className="text-xs text-[#00F0FF] font-extrabold">35% Pool</span>
            </div>
            <h3 className="text-2xl font-black text-white">Match 4 of 5</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Match 4 of your 5 logged scores to split 35% of the total monthly prize pool equally among Tier 4 winners.
            </p>
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-300">
              ✓ Frequent monthly winners across community
            </div>
          </Card>

          {/* Tier 3 */}
          <Card variant="glass" className="space-y-4 p-6 border-emerald-500/30">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <Badge variant="emerald">Tier 3 Match 🥉</Badge>
              <span className="text-xs text-emerald-400 font-extrabold">25% Pool</span>
            </div>
            <h3 className="text-2xl font-black text-white">Match 3 of 5</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Match 3 of your 5 logged scores to split 25% of the total monthly prize pool equally among Tier 3 winners.
            </p>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300">
              ✓ Accessible entry-tier cash prizes
            </div>
          </Card>
        </div>

        {/* Live Match Simulator Teaser */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Simulation Demo</span>
              <p className="text-sm font-semibold text-white">See how your ticket matches drawn numbers in real time</p>
            </div>
            <Badge variant="gold">4 Matches Detected — Tier 4 Winner!</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Monthly Drawn 5 Numbers:</span>
              <div className="flex gap-2 flex-wrap">
                {sampleDraw.map((num, i) => (
                  <span key={i} className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-gold-glow">
                    {num}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Your Active Ticket:</span>
              <div className="flex gap-2 flex-wrap">
                {sampleTicket.map((num, i) => {
                  const isMatch = sampleDraw.includes(num);
                  return (
                    <span
                      key={i}
                      className={`w-10 h-10 rounded-xl font-extrabold flex items-center justify-center text-sm border ${
                        isMatch
                          ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-gold-glow'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {num}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: HOW CHARITY BENEFITS                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="emerald">Step 3 — How Charity Benefits</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            A Minimum 10% Directly to Good. Up to 100%.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every subscription is a philanthropic pledge. You decide how much of your membership is directly allocated to your chosen cause.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card variant="glass" className="space-y-4 p-6">
            <Heart className="w-8 h-8 text-rose-400" />
            <h3 className="text-lg font-bold text-white">Voluntary Grant Slider</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select any voluntary contribution between 10% (mandatory minimum) up to 100% of your membership fee. Change it anytime in your dashboard.
            </p>
          </Card>

          <Card variant="glass" className="space-y-4 p-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Vetted 501(c)(3) Non-Profits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We vet every organization to guarantee that grants fund tangible outcomes: pediatric healthcare, youth sports access, clean oceans, and veteran rehabilitation.
            </p>
          </Card>

          <Card variant="glass" className="space-y-4 p-6">
            <TrendingUp className="w-8 h-8 text-[#00F0FF]" />
            <h3 className="text-lg font-bold text-white">Transparent Impact Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect exactly how much your subscription has raised for your charity in your dashboard, along with community milestones and grant reports.
            </p>
          </Card>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 4: FEATURED CHARITIES                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="cyan">Partner Directory</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Featured 501(c)(3) Causes
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select one of our vetted partners to direct your voluntary membership contributions.
            </p>
          </div>
          <Link href="/charities">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Charities
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Youth on Course',
              category: 'Youth & Sports Access',
              raised: '$480,250',
              logo: '⛳',
              desc: 'Subsidizing golf rounds for underrepresented youth, opening doors to collegiate scholarships.',
            },
            {
              name: 'Clean Oceans Initiative',
              category: 'Ecological Stewardship',
              raised: '$320,800',
              logo: '🌊',
              desc: 'Removing plastic debris from coastal waterways and restoring delicate marine wildlife habitats.',
            },
            {
              name: 'St. Jude Children’s',
              category: 'Pediatric Health',
              raised: '$410,500',
              logo: '💙',
              desc: 'Leading the way the world understands, treats, and defeats childhood leukemia and rare diseases.',
            },
            {
              name: 'Veterans Golf Healing',
              category: 'Veteran Welfare',
              raised: '$208,450',
              logo: '🎖️',
              desc: 'Providing rehabilitative physical activity and peer community for wounded military service members.',
            },
          ].map((c) => (
            <Card key={c.name} variant="glass" className="space-y-4 p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{c.logo}</span>
                  <Badge variant="emerald" size="sm">Vetted</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{c.name}</h4>
                  <span className="text-[11px] text-slate-400">{c.category}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {c.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Raised:</span>
                <span className="font-extrabold text-emerald-400 font-mono">{c.raised}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 5: SUBSCRIBE (PRICING CTA)                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="gold">Step 4 — Subscribe & Start</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Choose Your Membership
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Full access to golf score management, monthly prize pool entries, and direct charity grants.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#00F0FF] text-slate-950 shadow-cyan-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-400 text-slate-950 shadow-emerald-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/40 text-slate-100">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Monthly Plan Card */}
          <Card
            variant={billingCycle === 'monthly' ? 'glow' : 'glass'}
            className="p-8 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Monthly Hero</h3>
                <Badge variant="cyan">Flexible</Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$29</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400">Cancel anytime. Renews automatically every 30 days.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span>Entry into monthly cash prize draws</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span>Rolling-5 golf score tracker (1–45 points)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom voluntary charity grant slider (10%–100%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span>Official proof upload & fast payout pipeline</span>
                </li>
              </ul>
            </div>

            <Link href="/subscribe" className="block pt-4">
              <Button variant="outline" className="w-full" size="lg">
                Select Monthly Hero
              </Button>
            </Link>
          </Card>

          {/* Yearly Plan Card */}
          <Card
            variant={billingCycle === 'yearly' ? 'glow' : 'glass'}
            className="p-8 space-y-6 flex flex-col justify-between border-emerald-500/40 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <Badge variant="emerald">Best Value — 2 Months Free</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Yearly Hero</h3>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-400">$290</span>
                  <span className="text-xs text-slate-400">/ year</span>
                </div>
                <p className="text-xs text-slate-400">Equivalent to $24.16/month. Billed annually.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>12 uninterrupted monthly draw tickets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full year rolling-5 golf score history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Continuous voluntary charity funding pledge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority verification & payout processing</span>
                </li>
              </ul>
            </div>

            <Link href="/subscribe" className="block pt-4">
              <Button variant="primary" className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Join as Yearly Hero
              </Button>
            </Link>
          </Card>
        </div>

        {/* Security & Compliance Footer Note */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 pt-4">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-slate-300" />
            <span>256-Bit SSL Encrypted Checkout via Stripe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Non-Gambling Athletic Performance Contest</span>
          </div>
        </div>
      </section>
    </div>
  );
}
