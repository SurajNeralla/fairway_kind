"use client";

import React from 'react';
import Link from 'next/link';
import { FairwayKindLogo } from '@/components/ui/Logo';
import { ShieldCheck, Lock } from 'lucide-react';

interface PanelFooterProps {
  variant?: 'subscriber' | 'admin';
  className?: string;
}

export const PanelFooter: React.FC<PanelFooterProps> = ({
  variant = 'subscriber',
  className = '',
}) => {
  const isAdmin = variant === 'admin';

  return (
    <footer className={`mt-auto border-t border-outline-variant/30 py-8 px-6 md:px-10 text-on-surface-variant bg-surface-container/30 ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 group">
            <FairwayKindLogo className="h-9 w-auto" />
          </Link>
          <span className="text-outline">|</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {isAdmin ? 'Admin Control Environment' : 'Subscriber Portal'}
          </span>
        </div>

        {/* Essential Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium">
          <Link 
            href="/terms" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
          >
            Terms of Service
          </Link>
          <Link 
            href="/privacy" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/responsible-play" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
          >
            Responsible Play
          </Link>
          <Link 
            href="/charities" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
          >
            Charity Directory
          </Link>
          <Link 
            href="/verification" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
          >
            Winner Verification
          </Link>
          <Link 
            href="/#impact" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
          >
            Impact Report
          </Link>
          <a 
            href="mailto:support@fairwaykind.com" 
            className="text-on-surface-variant hover:text-primary transition-colors duration-150"
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-outline">
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} FairwayKind Technologies Inc. All rights reserved. Skill-based performance draws with philanthropic allocation; strictly non-gambling mechanics.
        </p>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-primary" />
            256-Bit SSL Encrypted
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            Independent Charity Escrow
          </span>
        </div>
      </div>
    </footer>
  );
};
