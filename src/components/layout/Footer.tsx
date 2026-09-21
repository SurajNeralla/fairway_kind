"use client";

import React from 'react';
import Link from 'next/link';
import { Target, Heart, ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/90 bg-[#060910] text-slate-400 text-sm" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand info */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Digital Heroes Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F0FF] to-emerald-500 p-0.5 shadow-cyan-glow group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090D16] rounded-[6px] flex items-center justify-center">
                <Target className="w-4 h-4 text-[#00F0FF]" />
              </div>
            </div>
            <span className="text-base font-extrabold text-white tracking-tight">
              DIGITAL <span className="text-[#00F0FF]">HEROES</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Where athletic passion, golf performance, monthly rewards, and social impact meet. A minimum 10% of every membership directly supports verified charities.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified 501(c)(3) Partner
            </span>
          </div>
        </div>

        {/* Links 1 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
          <nav aria-label="Platform Links">
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/" className="text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded">Home</Link></li>
              <li><Link href="/charities" className="text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded">Charity Directory</Link></li>
              <li><Link href="/how-it-works" className="text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded">How It Works</Link></li>
              <li><Link href="/subscribe" className="text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded">Subscription Plans</Link></li>
            </ul>
          </nav>
        </div>

        {/* Links 2 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">User Access</h4>
          <nav aria-label="User Access Links">
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/login" className="text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded">Sign In</Link></li>
              <li><Link href="/signup" className="text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded">Create Account</Link></li>
              <li><Link href="/dashboard" className="text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded">Golfer Dashboard</Link></li>
              <li><Link href="/admin" className="text-slate-400 hover:text-[#00F0FF] transition-colors focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded">Admin Portal</Link></li>
            </ul>
          </nav>
        </div>

        {/* Links 3 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Trust & Transparency</h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Skill-Verified Draws</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Heart className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Direct Non-Profit Distributions</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>PCI-DSS Compliant via Stripe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© 2026 Digital Heroes Technologies Inc. All rights reserved.</p>
          <p className="text-slate-400 font-medium">Non-gambling skill performance platform & charity allocation engine.</p>
        </div>
      </div>
    </footer>
  );
};
