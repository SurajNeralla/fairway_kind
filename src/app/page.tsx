"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);

  const handleSelectCharity = (charityName: string) => {
    setSelectedCharity(charityName);
    showToast(
      'Charity Selected',
      `${charityName} has been selected as your active cause!`,
      'success'
    );
  };

  return (
    <div className="bg-background text-on-surface antialiased selection:bg-primary-fixed selection:text-primary">
      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Ambient subtle background glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & CTAs (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              {/* Editorial Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Purpose-Driven Performance Rewards
              </div>

              {/* Main Headline */}
              <h1 className="font-headline-lg-mobile md:font-display text-headline-lg-mobile md:text-display text-on-background tracking-tight leading-tight">
                Play. Win.<br />
                <span className="text-primary-container font-headline-lg md:font-display italic font-medium">
                  Give Back.
                </span>
              </h1>

              {/* Subtitle with warm tone */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                The modern performance platform where your golf rounds unlock monthly community rewards while directly funding causes you care about. A minimum 10% of every membership is donated to your chosen charity.
              </p>

              {/* Actions Cluster */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
                <Link
                  href={user ? "/dashboard" : "/subscribe"}
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all active:scale-[0.98] shadow-sm"
                >
                  <span>{user ? "Go to Dashboard" : "Subscribe to FairwayKind"}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex justify-center items-center gap-2 px-6 py-4 rounded-full bg-surface-container-low hover:bg-surface-container text-tertiary border border-outline-variant/40 font-label-lg text-label-lg transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg text-primary">play_circle</span>
                  <span>See How It Works</span>
                </a>
              </div>

              {/* Micro Trust Note */}
              <div className="flex items-center gap-6 pt-4 text-on-surface-variant font-label-md text-label-md">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                  <span>Stableford Scoring (1–45)</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-base">handshake</span>
                  <span>10%+ Direct Charity Giving</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Multi-Layer Preview Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              {/* Outer Elevated Container */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-floating-shadow relative">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-6 border-b border-surface-container">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary font-bold">
                      <span className="material-symbols-outlined text-xl">person</span>
                    </div>
                    <div>
                      <div className="font-headline-sm text-headline-sm text-on-background font-semibold">David K. Miller</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Active Member • Monthly Draw Entrant</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                    Rolling 5 Scores Active
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 py-6">
                  {/* Stableford Metric */}
                  <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20">
                    <div className="text-on-surface-variant font-label-sm text-label-sm tracking-wide uppercase">Latest Score</div>
                    <div className="font-headline-lg text-headline-lg text-primary mt-1 tabular-nums font-semibold">
                      38 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">pts</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-primary font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Stableford Format</span>
                    </div>
                  </div>

                  {/* Monthly Draw Pool Entry */}
                  <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20">
                    <div className="text-on-surface-variant font-label-sm text-label-sm tracking-wide uppercase">Monthly Draw</div>
                    <div className="font-headline-lg text-headline-lg text-secondary mt-1 tabular-nums font-semibold">5 Numbers</div>
                    <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-sm text-secondary">verified</span>
                      <span>40% / 35% / 25% Pools</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Charity Tracker Card Inset */}
                <div className="bg-surface-container/60 rounded-2xl p-4 border border-outline-variant/30 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">volunteer_activism</span>
                      <span className="font-label-md text-label-md text-on-surface font-medium">Youth on Course</span>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-primary font-semibold tabular-nums">15% Grant</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden mt-1">
                    <div className="bg-primary-container h-full rounded-full w-4/5"></div>
                  </div>
                  <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm mt-2">
                    <span>Selected Charity Partner</span>
                    <span className="text-primary font-semibold">Min 10% Enforced</span>
                  </div>
                </div>

                {/* Subtle Live Verification Stamp */}
                <div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    Monthly Draw Active
                  </span>
                  <span className="text-tertiary">Jackpot Rollover Enabled</span>
                </div>
              </div>

              {/* Floating Subtle Accent Tag */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-primary text-on-primary px-4 py-2.5 rounded-2xl shadow-lg items-center gap-2 text-label-sm font-label-sm border border-primary-fixed/20">
                <span className="material-symbols-outlined text-secondary-fixed text-base">stars</span>
                <span>Feel, Not Fairway</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM FUNDAMENTALS (PRD Level 1) */}
      <section className="border-y border-outline-variant/30 bg-surface-container-low py-12" id="impact">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-semibold text-primary">1–45 Pts</span>
              <span className="text-on-surface-variant font-label-md text-label-md mt-1">Stableford Score Format</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-semibold text-on-surface">5 Scores</span>
              <span className="text-on-surface-variant font-label-md text-label-md mt-1">Rolling Active Entries</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-semibold text-secondary">40% / 35% / 25%</span>
              <span className="text-on-surface-variant font-label-md text-label-md mt-1">Monthly Prize Pool Tiers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg font-semibold text-primary">10%–100%</span>
              <span className="text-on-surface-variant font-label-md text-label-md mt-1">Direct Charity Giving</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE THREE PILLARS: HOW FAIRWAYKIND OPERATES */}
      <section className="py-24 md:py-32" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm uppercase tracking-wider mb-4">
              Platform Architecture
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
              How FairwayKind Works
            </h2>
            <p className="text-on-surface-variant font-body-lg text-body-lg mt-4">
              Combining golf performance tracking, guaranteed monthly prize pools, and transparent non-profit funding into a modern, mindful platform. Feel, not fairway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Play & Score */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary font-headline-sm font-semibold mb-6">
                  01
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-3">Stableford Score Entry</h3>
                <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
                  Log your golf scores in Stableford format (1–45 points) with round date. Only your latest 5 scores are retained — when a new round is entered, it automatically replaces the oldest.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-surface-container flex items-center gap-2 text-primary font-label-md text-label-md">
                <span className="material-symbols-outlined text-base">sports_score</span>
                <span>Max 5 rolling scores • 1 score per date</span>
              </div>
            </div>

            {/* Pillar 2: Monthly Draw */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-secondary font-headline-sm font-semibold mb-6">
                  02
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-3">Monthly Prize Draw</h3>
                <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
                  Every month, 5 winning numbers are drawn. Match 5 numbers to win 40% (Jackpot), match 4 for 35%, or match 3 for 25%. Unclaimed 5-number Jackpots roll forward to the next draw.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-surface-container flex items-center gap-2 text-secondary font-label-md text-label-md">
                <span className="material-symbols-outlined text-base">emoji_events</span>
                <span>5, 4 &amp; 3-number match tiers • Rollover</span>
              </div>
            </div>

            {/* Pillar 3: Charity Giving */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-headline-sm font-semibold mb-6">
                  03
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-3">Direct Charity Impact</h3>
                <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
                  Choose your charity at signup. A minimum 10% of every subscription fee automatically supports your chosen cause, with the option to voluntarily increase your giving up to 100%.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-surface-container flex items-center gap-2 text-primary font-label-md text-label-md">
                <span className="material-symbols-outlined text-base">favorite</span>
                <span>Minimum 10% • Slider up to 100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED CHARITY SPOTLIGHT */}
      <section className="bg-surface-container-low py-24 border-y border-outline-variant/30" id="charities">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm uppercase tracking-wider mb-4">
                Philanthropic Partners
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                Direct Impact. Complete Transparency.
              </h2>
              <p className="text-on-surface-variant font-body-lg text-body-lg mt-2 max-w-xl">
                Every subscription fee directly allocates a minimum of 10% to your selected non-profit cause.
              </p>
            </div>
            <Link 
              className="inline-flex items-center gap-2 font-label-lg text-label-lg text-primary hover:text-primary-container font-semibold transition-colors" 
              href="/charities"
            >
              <span>Explore All Verified Causes</span>
              <span className="material-symbols-outlined text-lg">arrow_outward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Charity 1: Youth on Course */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm mb-2 font-medium">
                      Youth &amp; Community Access
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Youth on Course Foundation</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">school</span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-body-md text-body-md mb-6 leading-relaxed">
                  Eliminating economic barriers so junior golfers from underrepresented backgrounds can play for $5 or less per round at premier facilities nationwide.
                </p>

                {/* Upcoming Golf Event */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 mb-6">
                  <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm font-semibold mb-1">
                    <span className="material-symbols-outlined text-base">event</span>
                    <span>Upcoming Charity Golf Day</span>
                  </div>
                  <p className="text-on-surface font-body-sm text-body-sm">Annual Junior Invitational &amp; Charity Fundraiser — October 18, 2026</p>
                </div>
              </div>

              <div className="mt-4 pt-6 border-t border-surface-container flex items-center justify-between">
                <span className="text-on-surface-variant font-label-md text-label-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                  Verified 501(c)(3) Partner
                </span>
                <button 
                  onClick={() => handleSelectCharity('Youth on Course Foundation')}
                  className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold transition-colors active:scale-95"
                >
                  {selectedCharity === 'Youth on Course Foundation' ? '✓ Selected' : 'Select as My Charity'}
                </button>
              </div>
            </div>

            {/* Charity 2: Clean Oceans & Wetlands */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm mb-2 font-medium">
                      Ecological Stewardship
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Clean Oceans &amp; Coastal Wetlands</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">water_drop</span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-body-md text-body-md mb-6 leading-relaxed">
                  Revitalizing coastal ecosystems, restoring critical water habitats adjacent to coastal links courses, and eliminating synthetic runoff.
                </p>

                {/* Upcoming Golf Event */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 mb-6">
                  <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm font-semibold mb-1">
                    <span className="material-symbols-outlined text-base">event</span>
                    <span>Upcoming Charity Golf Day</span>
                  </div>
                  <p className="text-on-surface font-body-sm text-body-sm">Coastal Links Scramble for Conservation — November 07, 2026</p>
                </div>
              </div>

              <div className="mt-4 pt-6 border-t border-surface-container flex items-center justify-between">
                <span className="text-on-surface-variant font-label-md text-label-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                  Verified 501(c)(3) Partner
                </span>
                <button 
                  onClick={() => handleSelectCharity('Clean Oceans & Coastal Wetlands')}
                  className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold transition-colors active:scale-95"
                >
                  {selectedCharity === 'Clean Oceans & Coastal Wetlands' ? '✓ Selected' : 'Select as My Charity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MONTHLY DRAW ARCHITECTURE & PRIZE ALLOCATION */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-14 custom-floating-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
                  Official Draw System
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                  Monthly Draw Engine.<br />Pre-Defined Prize Logic.
                </h2>
                <p className="text-on-surface-variant font-body-lg text-body-lg leading-relaxed">
                  A fixed portion of each subscription contributes to the prize pool. The monthly draw selects 5 winning numbers, and prize distribution is strictly governed by pre-defined PRD allocation tiers.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">5-Number Match (40% Jackpot)</h4>
                      <p className="text-on-surface-variant font-body-sm text-body-sm">40% of the prize pool is allocated to 5-number matches. If unclaimed, the entire 5-number Jackpot rolls forward to the following month.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">4-Number Match (35%) &amp; 3-Number Match (25%)</h4>
                      <p className="text-on-surface-variant font-body-sm text-body-sm">35% and 25% of the pool are allocated to 4-number and 3-number matches. These tiers do not roll forward; prizes split equally among all winners in the tier.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary-fixed/40 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base">Draw Simulation &amp; Publishing</h4>
                      <p className="text-on-surface-variant font-body-sm text-body-sm">Platform administrators can configure random lottery-style or score-weighted algorithmic draws, simulate results, and review before official publishing.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual breakdown card */}
              <div className="lg:col-span-6 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
                  <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">Prize Pool Allocation</div>
                  <span className="text-primary font-label-sm text-label-sm font-semibold">PRD Standard</span>
                </div>

                <div className="space-y-4 py-6">
                  <div>
                    <div className="flex justify-between font-label-md text-label-md mb-1.5">
                      <span className="text-on-surface font-medium">5-Number Match (Jackpot Rollover)</span>
                      <span className="text-primary font-semibold">40% of Pool</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-md text-label-md mb-1.5">
                      <span className="text-on-surface font-medium">4-Number Match Tier</span>
                      <span className="text-secondary font-semibold">35% of Pool</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: "35%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-md text-label-md mb-1.5">
                      <span className="text-on-surface font-medium">3-Number Match Tier</span>
                      <span className="text-tertiary font-semibold">25% of Pool</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                      <div className="bg-tertiary h-full rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl shrink-0">verified</span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">
                    Multiple winners in any tier split the allocated tier pool equally. Winner proof verification required prior to disbursement.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW TO PARTICIPATE: 4 SIMPLE STEPS */}
      <section className="bg-surface-container-low py-24 border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm uppercase tracking-wider mb-4">
              Member Journey
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
              How You Participate
            </h2>
            <p className="text-on-surface-variant font-body-lg text-body-lg mt-2">
              Follow four straightforward steps from your first score to monthly draw participation and charitable impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 custom-card-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-headline-sm font-bold mb-4">
                  1
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">Subscribe &amp; Choose Cause</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                  Join on a monthly ($29/mo) or discounted yearly plan ($290/yr). Select your preferred verified 501(c)(3) charity during registration.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-container text-xs text-primary font-semibold">
                Min 10% automatically remitted
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 custom-card-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-headline-sm font-bold mb-4">
                  2
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">Enter Golf Scores</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                  Log your latest rounds using Stableford scoring (1–45 points) with round date. Your rolling latest 5 scores are automatically retained.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-container text-xs text-primary font-semibold">
                1 score per date • Edit anytime
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 custom-card-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 flex items-center justify-center text-secondary font-headline-sm font-bold mb-4">
                  3
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">Monthly Draw</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                  Your active 5 scores enter the monthly draw. Match 5 numbers for the 40% Jackpot, 4 for 35%, or 3 for 25%.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-container text-xs text-secondary font-semibold">
                5-match rollover if unclaimed
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 custom-card-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-headline-sm font-bold mb-4">
                  4
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">Verify &amp; Win</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                  Winners upload a scorecard screenshot from their golf platform. Admin reviews and approves proof, and payout status updates to Paid.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-surface-container text-xs text-primary font-semibold">
                Pending → Paid payout tracking
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRICING PREVIEW & CTA BANNER */}
      <section className="py-24 md:py-32" id="pricing">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div 
            className="bg-inverse-surface text-inverse-on-surface rounded-3xl p-8 md:p-16 relative overflow-hidden custom-floating-shadow" 
            style={{ boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)' }}
          >
            {/* Ambient warm brass glow */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                  Transparent Membership
                </div>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg tracking-tight text-inverse-on-surface font-semibold">
                  Turn Every Swing into Social Good.
                </h2>
                <p className="text-on-tertiary-container font-body-lg text-body-lg max-w-xl">
                  Choose between flexible monthly billing or our discounted yearly plan. Cancel anytime with a single click.
                </p>

                <ul className="space-y-3 pt-2 font-body-md text-body-md text-inverse-on-surface">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">check_circle</span>
                    <span>Full entry into monthly prize draws (5-number, 4-number, and 3-number matches)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">check_circle</span>
                    <span>Minimum 10% automatically remitted to your chosen charity</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">check_circle</span>
                    <span>Stableford score tracking with rolling latest 5 scores management</span>
                  </li>
                </ul>
              </div>

              {/* Price Tier Floating Card */}
              <div className="lg:col-span-5 bg-tertiary-container/80 backdrop-blur-md rounded-2xl p-8 border border-outline/30 text-center flex flex-col items-center">
                <span className="font-label-md text-label-md text-secondary-fixed uppercase tracking-wider font-semibold">FairwayKind Membership</span>
                <div className="mt-4 mb-2 flex items-baseline justify-center gap-1">
                  <span className="font-headline-lg md:font-display text-headline-lg md:text-display font-semibold text-inverse-on-surface">$29</span>
                  <span className="text-on-tertiary-container font-body-md text-body-md">/ month</span>
                </div>
                <p className="text-on-tertiary-container font-body-sm text-body-sm mb-6">
                  Includes $2.90 min charity grant • Or $290/yr (Save 17%)
                </p>
                <Link
                  href={user ? "/dashboard" : "/subscribe"}
                  className="w-full py-4 rounded-full bg-secondary hover:bg-secondary/90 text-on-secondary font-label-lg text-label-lg font-semibold transition-all duration-150 active:scale-[0.98] shadow-md block text-center"
                >
                  Subscribe to FairwayKind
                </Link>
                <span className="text-on-tertiary-container font-label-sm text-label-sm mt-3">
                  Monthly &amp; Yearly Plans • Cancel Anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
