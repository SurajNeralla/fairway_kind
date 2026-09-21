"use client";

import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'emerald' | 'gold' | 'rose' | 'violet' | 'neutral' | 'slate' | 'amber';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'cyan',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide uppercase';

  const variants = {
    cyan: 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30',
    emerald: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30',
    gold: 'bg-amber-950/60 text-amber-400 border border-amber-500/30',
    amber: 'bg-amber-950/60 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-950/60 text-rose-400 border border-rose-500/30',
    violet: 'bg-violet-950/60 text-violet-400 border border-violet-500/30',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </span>
  );
};
