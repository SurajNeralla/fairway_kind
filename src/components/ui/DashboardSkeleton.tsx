"use client";

import React from 'react';
import { Card } from './Card';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-7 w-48 bg-slate-800 rounded-lg" />
            <div className="h-5 w-24 bg-slate-800 rounded-full" />
          </div>
          <div className="h-4 w-72 bg-slate-800/60 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-slate-800 rounded-xl" />
          <div className="h-9 w-36 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* 4 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="glass" className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-800 rounded" />
              <div className="w-5 h-5 bg-slate-800 rounded-full" />
            </div>
            <div className="h-8 w-28 bg-slate-800 rounded-lg" />
            <div className="h-3 w-36 bg-slate-800/60 rounded" />
          </Card>
        ))}
      </div>

      {/* Active Scores Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 w-40 bg-slate-800 rounded" />
            <div className="h-3 w-64 bg-slate-800/60 rounded" />
          </div>
          <div className="h-5 w-28 bg-slate-800 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} variant="glass" className="p-4 space-y-2 text-center">
              <div className="h-3 w-16 bg-slate-800 rounded mx-auto" />
              <div className="h-8 w-12 bg-slate-800 rounded mx-auto" />
              <div className="h-3 w-20 bg-slate-800/60 rounded mx-auto" />
              <div className="h-4 w-full bg-slate-800/40 rounded mt-2" />
            </Card>
          ))}
        </div>
      </div>

      {/* Subscription & Charity Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="h-5 w-36 bg-slate-800 rounded" />
            <div className="h-5 w-20 bg-slate-800 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-slate-800/40">
                <div className="h-3 w-24 bg-slate-800 rounded" />
                <div className="h-3 w-32 bg-slate-800/70 rounded" />
              </div>
            ))}
          </div>
        </Card>

        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="h-5 w-36 bg-slate-800 rounded" />
            <div className="h-5 w-24 bg-slate-800 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-10 w-full bg-slate-800/70 rounded-xl" />
            <div className="h-4 w-full bg-slate-800/50 rounded" />
            <div className="h-9 w-full bg-slate-800 rounded-xl mt-4" />
          </div>
        </Card>
      </div>

      {/* Winnings & Draws Skeleton */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="h-5 w-40 bg-slate-800 rounded" />
          <div className="h-5 w-24 bg-slate-800 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-800 rounded" />
                <div className="h-3 w-48 bg-slate-800/60 rounded" />
              </div>
              <div className="h-8 w-24 bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
