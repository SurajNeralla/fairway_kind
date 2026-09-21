"use client";

import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block font-label-md text-label-md text-on-surface font-semibold">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={twMerge(
              clsx(
                "w-full h-11 appearance-none rounded-xl bg-surface border border-outline-variant/60 px-3.5 pr-10 text-body-sm text-on-surface cursor-pointer focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                error && "border-error focus:border-error focus:ring-error/30",
                className
              )
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface-container-lowest text-on-surface">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
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

Select.displayName = 'Select';
