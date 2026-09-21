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
  variant = 'emerald',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide uppercase';

  const variants = {
    cyan: 'bg-primary-fixed/40 text-primary border border-primary-fixed-dim',
    emerald: 'bg-primary-fixed/40 text-primary border border-primary-fixed-dim',
    gold: 'bg-secondary-fixed/40 text-on-secondary-fixed border border-secondary-fixed-dim',
    amber: 'bg-secondary-fixed/40 text-on-secondary-fixed border border-secondary-fixed-dim',
    rose: 'bg-error-container text-on-error-container border border-error/30',
    violet: 'bg-surface-container-highest text-primary border border-outline-variant/40',
    neutral: 'bg-surface-container text-on-surface-variant border border-outline-variant/40',
    slate: 'bg-surface-container text-on-surface-variant border border-outline-variant/40',
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
