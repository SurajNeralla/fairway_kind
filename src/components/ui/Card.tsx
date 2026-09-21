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
  const baseStyles = 'rounded-3xl p-6 md:p-8 border transition-all duration-300';

  const variants = {
    glass: 'bg-surface-container-lowest border-outline-variant/40 text-on-surface custom-card-shadow',
    solid: 'bg-surface-container-lowest border-outline-variant/40 text-on-surface custom-card-shadow',
    gradient: 'bg-gradient-to-br from-surface-container-lowest to-[#FAF7EE] border-outline-variant/40 text-on-surface custom-card-shadow',
    glow: 'bg-surface-container-lowest border-primary/30 custom-floating-shadow text-on-surface',
  };

  return (
    <div
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          hoverEffect && 'hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
