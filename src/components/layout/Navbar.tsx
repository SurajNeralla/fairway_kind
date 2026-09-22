"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FairwayKindLogo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on dashboard or admin, hide standard public header
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged Out', 'You have been safely signed out.', 'info');
      router.push('/login');
    } catch (err: any) {
      showToast('Logout Error', err.message, 'error');
    }
  };

  return (
    <header className="bg-surface dark:bg-inverse-surface text-primary dark:text-inverse-primary border-b border-outline-variant/40 dark:border-outline/20 shadow-sm dark:shadow-none docked full-width top-0 sticky z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20">
        {/* Brand & Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 active:scale-[0.98] transition-transform duration-150 group"
        >
          <FairwayKindLogo className="h-14 w-auto" />
          <span className="sr-only">FairwayKind</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/#how-it-works" 
            className="text-on-surface-variant dark:text-on-tertiary-container hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors font-label-lg text-label-lg"
          >
            How It Works
          </Link>
          <Link 
            href="/charities" 
            className="text-on-surface-variant dark:text-on-tertiary-container hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors font-label-lg text-label-lg"
          >
            Charity Directory
          </Link>
          <Link 
            href="/#impact" 
            className="text-on-surface-variant dark:text-on-tertiary-container hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors font-label-lg text-label-lg"
          >
            Impact
          </Link>
          <Link 
            href="/#pricing" 
            className="text-on-surface-variant dark:text-on-tertiary-container hover:text-on-surface dark:hover:text-inverse-on-surface transition-colors font-label-lg text-label-lg"
          >
            Pricing
          </Link>
        </nav>

        {/* Trailing Action Cluster */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex text-label-lg font-label-lg text-primary hover:text-primary-container px-3 py-2 transition-colors active:scale-[0.98] items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  Admin Suite
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg px-5 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-on-surface-variant hover:text-error p-2 transition-colors rounded-full"
                title="Log Out"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-label-lg font-label-lg text-[#191C1A] hover:text-primary px-4 py-2 transition-colors active:scale-[0.98] font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/subscribe"
                className="bg-[#1B4332] hover:bg-[#143326] text-white font-medium text-sm md:text-base px-6 py-2.5 rounded-full transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow inline-flex items-center gap-2"
              >
                <span>Subscribe</span>
                <span className="text-base">&rarr;</span>
              </Link>
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-on-surface focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant/40 px-6 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link 
            href="/#how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-on-surface-variant hover:text-on-surface font-label-lg py-1.5"
          >
            How It Works
          </Link>
          <Link 
            href="/charities" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-on-surface-variant hover:text-on-surface font-label-lg py-1.5"
          >
            Charity Directory
          </Link>
          <Link 
            href="/#impact" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-on-surface-variant hover:text-on-surface font-label-lg py-1.5"
          >
            Impact
          </Link>
          <Link 
            href="/#pricing" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-on-surface-variant hover:text-on-surface font-label-lg py-1.5"
          >
            Pricing
          </Link>
          <div className="pt-3 border-t border-outline-variant/30 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-primary text-on-primary font-label-lg py-2.5 rounded-full"
                >
                  My Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-surface-container text-primary font-label-lg py-2.5 rounded-full"
                  >
                    Admin Suite
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-outline-variant text-primary font-label-lg py-2.5 rounded-full"
                >
                  Sign In
                </Link>
                <Link
                  href="/subscribe"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-primary text-on-primary font-label-lg py-2.5 rounded-full"
                >
                  Subscribe
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
