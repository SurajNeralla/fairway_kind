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
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm',
      secondary: 'bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant/50 font-medium',
      outline: 'bg-transparent text-primary border border-outline-variant/60 hover:bg-surface-container font-medium',
      charity: 'bg-primary-container hover:bg-primary text-on-primary font-semibold shadow-sm',
      gold: 'bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold shadow-sm',
      danger: 'bg-error hover:bg-error/90 text-on-error font-semibold',
      ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
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
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
