"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export type DashboardSection = 'overview' | 'scores' | 'charity' | 'draws' | 'winnings' | 'settings';

interface DashboardSubNavProps {
  current: DashboardSection;
}

const NAV_ITEMS: Array<{ id: DashboardSection; label: string; href: string }> = [
  { id: 'overview', label: 'Overview', href: '/dashboard' },
  { id: 'scores', label: 'My Scores', href: '/dashboard/scores' },
  { id: 'charity', label: 'My Charity', href: '/dashboard/charity' },
  { id: 'draws', label: 'Draws', href: '/dashboard/draws' },
  { id: 'winnings', label: 'Winnings', href: '/dashboard/winnings' },
  { id: 'settings', label: 'Settings', href: '/dashboard/subscription' },
];

export const DashboardSubNav: React.FC<DashboardSubNavProps> = ({ current }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-150 py-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" aria-label="Dashboard Pages">
        {NAV_ITEMS.map((item) => {
          const isActive = current === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
