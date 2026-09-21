"use client";

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'charity' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090D16] disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-[#00F0FF] text-[#090D16] font-semibold hover:bg-[#00D8E6] hover:shadow-cyan-glow focus:ring-[#00F0FF]',
      secondary: 'bg-slate-800 text-slate-100 border border-slate-700/80 hover:bg-slate-700 hover:border-slate-600 focus:ring-slate-500',
      outline: 'bg-transparent text-slate-200 border border-slate-700 hover:border-[#00F0FF] hover:text-[#00F0FF] focus:ring-[#00F0FF]',
      charity: 'bg-[#10B981] text-slate-950 font-semibold hover:bg-[#059669] hover:shadow-emerald-glow focus:ring-[#10B981]',
      gold: 'bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 hover:shadow-gold-glow focus:ring-amber-400',
      danger: 'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500',
      ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 focus:ring-slate-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
