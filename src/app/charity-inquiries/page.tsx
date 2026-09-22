"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Building, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function CharityInquiriesPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    charityName: '',
    ein: '',
    contactName: '',
    email: '',
    website: '',
    mission: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(
      'Inquiry Received',
      'Thank you! Our philanthropic partnerships committee will review your non-profit application within 3 business days.',
      'success'
    );
  };

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
            <Heart className="w-3.5 h-3.5 text-secondary" />
            <span>Philanthropic Partnerships</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background">
            501(c)(3) Non-Profit Partner Inquiries
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
            Are you a registered non-profit organization promoting youth sports access, ecological conservation, or healthcare? Join the FairwayKind partner network to receive transparent, monthly recurring donor grants.
          </p>
        </div>

        {/* Partnership Criteria Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 space-y-2.5 custom-card-shadow">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-bold">
              01
            </div>
            <h3 className="font-semibold text-on-surface">501(c)(3) Status</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Must be recognized as an IRS tax-exempt public charity in good standing.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 space-y-2.5 custom-card-shadow">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary font-bold">
              02
            </div>
            <h3 className="font-semibold text-on-surface">Direct Escrow Grants</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Zero platform skim. 100% of designated member contributions are remitted monthly.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 space-y-2.5 custom-card-shadow">
            <div className="w-10 h-10 rounded-2xl bg-secondary-fixed/40 flex items-center justify-center text-secondary font-bold">
              03
            </div>
            <h3 className="font-semibold text-on-surface">Annual Golf Events</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Feature upcoming golf days, scrambles, and benefit outings directly on the platform.
            </p>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 md:p-12 custom-card-shadow">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary-fixed/40 text-primary mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface">Inquiry Successfully Submitted</h2>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed">
                Thank you for applying to partner with FairwayKind. Our team will verify your organization&apos;s credentials and get in touch within 3 business days.
              </p>
              <Link 
                href="/charities" 
                className="inline-block mt-4 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold transition-colors"
              >
                Browse Current Charity Directory
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-surface-container pb-4">
                <h2 className="text-xl font-semibold text-on-surface">Partner Application Form</h2>
                <p className="text-xs text-on-surface-variant mt-1">Submit your details to be evaluated for inclusion in our member charity selection directory.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Charity / Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clean Oceans Initiative"
                    value={formData.charityName}
                    onChange={(e) => setFormData({ ...formData, charityName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">EIN / Tax ID Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="XX-XXXXXXX"
                    value={formData.ein}
                    onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Executive Director / Development Officer"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="director@charity.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Official Website</label>
                <input
                  type="url"
                  placeholder="https://www.yourcause.org"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Mission Statement &amp; Athletic / Community Focus *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Briefly describe your mission and how your work supports youth, healthcare, or conservation..."
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Non-Profit Application</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
