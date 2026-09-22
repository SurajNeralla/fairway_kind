"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-on-surface antialiased py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-container transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Legal &amp; Data Governance</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
            Effective Date: March 1, 2026 • Last Updated: September 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-12 space-y-10 custom-card-shadow">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-primary" />
              1. Information We Collect
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              FairwayKind Technologies Inc. (&ldquo;FairwayKind&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects personal information necessary to deliver our subscription-based performance tracking, charitable giving, and skill-driven prize draw platform:
            </p>
            <ul className="space-y-2.5 text-sm md:text-base text-on-surface pl-2 pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Account &amp; Profile Data:</strong> Name, email address, password hash, and assigned user role.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Athletic Golf Performance:</strong> Stableford round points (1–45), dates played, and uploaded handicap scorecard screenshots.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Charity Designation:</strong> Selected 501(c)(3) partner organization and voluntary contribution percentages (10% to 100%).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                <span><strong>Payment Data:</strong> Handled entirely by Stripe (PCI-DSS Level 1 compliant). We store Stripe customer and subscription IDs but never raw card details.</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-primary" />
              2. How We Protect Your Data
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              We employ military-grade security mechanisms to safeguard your personal data:
            </p>
            <ul className="space-y-2 text-sm md:text-base text-on-surface-variant pl-4 list-disc">
              <li><strong>Row-Level Security (RLS):</strong> Granular PostgreSQL security policies guarantee that subscribers can only read and manage their own scores, proofs, and memberships.</li>
              <li><strong>256-Bit SSL/TLS Encryption:</strong> All data in transit is encrypted using modern TLS 1.3 standards.</li>
              <li><strong>Private Object Storage:</strong> Uploaded scorecard proofs are stored in isolated, private storage buckets accessible solely to verified platform administrators.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-primary" />
              3. Charitable Reporting &amp; Transparency
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              To verify our philanthropic commitments, aggregate giving figures are shared with verified partner charities. However, your individual subscription records, personal identifying details, and golfing handicap logs are never sold, rented, or commercialized to third-party advertisers.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-6 border-t border-surface-container">
            <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-primary" />
              4. Your Privacy Rights (GDPR &amp; CCPA)
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              You retain full rights under applicable global privacy legislation:
            </p>
            <ul className="space-y-2 text-sm md:text-base text-on-surface-variant pl-4 list-disc">
              <li><strong>Right to Access:</strong> You may request an export of all scores, payments, and draw entries logged under your account.</li>
              <li><strong>Right to Deletion:</strong> You may request complete account erasure by contacting our compliance team.</li>
              <li><strong>Right to Rectification:</strong> You may modify your personal details or delete historical golf rounds at any time through your dashboard.</li>
            </ul>
          </div>

          {/* Contact Banner */}
          <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-on-surface">Questions regarding your privacy?</div>
              <div className="text-sm text-on-surface-variant">Our legal team is available to assist you.</div>
            </div>
            <a 
              href="mailto:privacy@fairwaykind.com" 
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold transition-all shrink-0"
            >
              Contact Data Protection Officer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
