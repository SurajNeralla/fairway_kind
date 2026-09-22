"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSubNav } from '@/components/dashboard/DashboardSubNav';
import { Draw } from '@/lib/types';

export default function UserDrawHistoryPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const res = await fetch('/api/draws');
        const data = await res.json();
        if (res.ok && data.draws?.length > 0) {
          setDraws(data.draws);
        } else {
          setDraws([]);
        }
      } catch (err) {
        console.error('Fetch draws error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraws();
  }, []);


  return (
    <div className="bg-background text-on-surface antialiased py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-6">
        <DashboardSubNav current="draws" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 custom-card-shadow">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/40 flex items-center justify-center text-secondary">
                <Trophy className="w-5 h-5" />
              </div>
              <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Monthly Draw History</h1>
              <span className="bg-secondary-fixed/40 text-on-secondary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                40% / 35% / 25% Allocation
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              View official published draw winning numbers, match counts, tier prize allocations, and audited cryptographic seeds.
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading draw history..." />
        ) : draws.length > 0 ? (
          <div className="space-y-6">
            {draws.map((d) => {
              return (
                <div
                  key={d.id}
                  className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-floating-shadow space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-surface-container">
                    <div>
                      <span className="bg-surface-container text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold">
                        Period {d.period_month}/{d.period_year}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mt-2">{d.title}</h3>
                    </div>
                    <div className="text-right">
                      <span className="block font-label-sm text-label-sm text-outline uppercase tracking-wider">Total Prize Pool</span>
                      <span className="font-headline-lg text-headline-lg font-bold text-secondary">${d.total_prize_pool.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Winning Numbers Visualizer */}
                  <div className="space-y-2.5 text-center md:text-left">
                    <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Winning 5 Stroke Numbers</span>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      {(d.winning_numbers || []).map((num, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-xl bg-primary text-on-primary text-lg font-bold flex items-center justify-center shadow-xs"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
    </div>
  );
}
