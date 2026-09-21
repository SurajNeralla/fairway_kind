"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on dashboard and admin pages where custom docked layout exists
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-surface-container dark:bg-inverse-surface text-primary dark:text-inverse-primary border-t border-outline-variant/30 dark:border-outline/20 docked full-width bottom-0 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="space-y-4 md:col-span-1">
          <div className="text-headline-md font-headline-md font-semibold text-primary dark:text-inverse-primary">
            FairwayKind
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-container leading-relaxed">
            Feel, Not Fairway. Where athletic passion, precision performance, and human philanthropy meet.
          </p>
        </div>

        {/* Links Column 1: Ecosystem */}
        <div className="space-y-3">
          <div className="text-label-sm font-label-sm text-primary dark:text-inverse-primary uppercase tracking-wider font-bold">
            Platform
          </div>
          <ul className="space-y-2">
            <li>
              <Link 
                className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors" 
                href="/#how-it-works"
              >
                How It Works
              </Link>
            </li>
            <li>
              <Link 
                className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors" 
                href="/charities"
              >
                Charity Directory
              </Link>
            </li>
            <li>
              <Link 
                className="text-label-sm font-label-sm text-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors" 
                href="/#impact"
              >
                Impact Report
              </Link>
            </li>
            <li>
              <Link 
                className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors" 
                href="/#pricing"
              >
                Pricing Plans
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2: Governance & Partners */}
        <div className="space-y-3">
          <div className="text-label-sm font-label-sm text-primary dark:text-inverse-primary uppercase tracking-wider font-bold">
            Governance
          </div>
          <ul className="space-y-2">
            <li>
              <span className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors cursor-pointer">
                Terms of Service
              </span>
            </li>
            <li>
              <span className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors cursor-pointer">
                Privacy Policy
              </span>
            </li>
            <li>
              <Link 
                href="/charities"
                className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors"
              >
                Charity Partners
              </Link>
            </li>
            <li>
              <span className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors cursor-pointer">
                Responsible Play
              </span>
            </li>
          </ul>
        </div>

        {/* Links Column 3: Contact & Audit */}
        <div className="space-y-3">
          <div className="text-label-sm font-label-sm text-primary dark:text-inverse-primary uppercase tracking-wider font-bold">
            Support &amp; Security
          </div>
          <ul className="space-y-2">
            <li>
              <a 
                href="mailto:support@fairwaykind.com" 
                className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors"
              >
                Contact Us
              </a>
            </li>
            <li>
              <span className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors cursor-pointer">
                Winner Verification Process
              </span>
            </li>
            <li>
              <span className="text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-inverse-primary transition-colors cursor-pointer">
                501(c)(3) Inquiries
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal Disclaimer Bottom Bar */}
      <div className="border-t border-outline-variant/30 dark:border-outline/20 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-container text-center md:text-left">
            © 2024 FairwayKind Technologies Inc. All rights reserved. Skill-based performance draws with philanthropic allocation; strictly non-gambling mechanics.
          </p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container">
              <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-sm">lock</span>
              256-Bit SSL Encrypted
            </span>
            <span className="inline-flex items-center gap-1.5 text-label-sm font-label-sm text-on-surface-variant dark:text-on-tertiary-container">
              <span className="material-symbols-outlined text-secondary text-sm">verified</span>
              Independent Charity Escrow
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
