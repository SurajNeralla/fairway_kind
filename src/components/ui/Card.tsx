"use client";

import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'gradient' | 'glow';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  hoverEffect = false,
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-6 border transition-all duration-300';

  const variants = {
    glass: 'bg-slate-900/60 backdrop-blur-xl border-slate-800 text-slate-100',
    solid: 'bg-slate-900 border-slate-800 text-slate-100',
    gradient: 'bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border-slate-800 text-slate-100',
    glow: 'bg-slate-900/70 border-cyan-500/30 shadow-cyan-glow text-slate-100',
  };

  return (
    <div
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          hoverEffect && 'hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-xl',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
