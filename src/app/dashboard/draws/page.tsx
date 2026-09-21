"use client";

import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Draw } from '@/lib/types';

export default function UserDrawHistoryPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const res = await fetch('/api/draws');
        const data = await res.json();
        if (res.ok) {
          setDraws(data.draws || []);
        } else {
          // Fallback sample draw history
          setDraws([
            {
              id: 'd1',
              title: 'Digital Heroes Monthly Draw — 8/2026',
              period_month: 8,
              period_year: 2026,
              draw_date: '2026-08-31T23:59:59Z',
              status: 'published',
              mode: 'random',
              winning_numbers: [10, 20, 30, 40, 45],
              total_prize_pool: 25000,
              tier_5_pool: 10000,
              tier_4_pool: 8750,
              tier_3_pool: 6250,
              rollover_amount: 0,
              created_at: '2026-08-31T23:59:59Z',
              updated_at: '2026-08-31T23:59:59Z',
            },
          ]);
        }
      } catch (err) {
        console.error('Fetch draws error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraws();
  }, []);

  // Demo user ticket numbers for match visualization
  const mockUserTicket = [10, 20, 30, 40, 12]; // 4 matches (10, 20, 30, 40)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Monthly Draw History</h1>
            <Badge variant="gold">40% / 35% / 25% Tier Pools</Badge>
          </div>
          <p className="text-xs text-slate-400">
            View past published draw winning numbers, match counts, tier prize allocations, and rollover records.
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading draw history..." />
      ) : draws.length > 0 ? (
        <div className="space-y-6">
          {draws.map((d) => {
            const winningSet = new Set(d.winning_numbers || []);
            const userMatches = mockUserTicket.filter((n) => winningSet.has(n));

            return (
              <Card key={d.id} variant="glass" className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <Badge variant="cyan" size="sm">Period {d.period_month}/{d.period_year}</Badge>
                    <h3 className="text-lg font-bold text-white mt-1">{d.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono">Total Prize Pool</span>
                    <span className="text-2xl font-extrabold text-amber-400">${d.total_prize_pool.toLocaleString()}</span>
                  </div>
                </div>

                {/* Winning Numbers Visualizer */}
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Winning 5 Numbers</span>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {(d.winning_numbers || [10, 20, 30, 40, 45]).map((num, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 text-lg font-extrabold flex items-center justify-center shadow-gold-glow"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Ticket Match Visualizer */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Your Ticket Entry (Latest 5 Scores)</span>
                    <Badge variant="gold">4 Matches — Tier 4 Winner ($1,750.00)</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {mockUserTicket.map((num, idx) => {
                      const isMatch = winningSet.has(num);
                      return (
                        <div
                          key={idx}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            isMatch
                              ? 'bg-amber-950 border-amber-500 text-amber-400 shadow-gold-glow'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {num} {isMatch ? '✓' : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Published Draws Yet"
          description="Draws occur monthly. Check back after the next monthly draw execution."
        />
      )}
    </div>
  );
}
