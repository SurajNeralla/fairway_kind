"use client";

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block font-label-md text-label-md text-on-surface font-semibold">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-on-surface-variant pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                "w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                leftIcon && "pl-10",
                rightIcon && "pr-10",
                error && "border-error focus:border-error focus:ring-error/30",
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-on-surface-variant flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-on-surface-variant">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
