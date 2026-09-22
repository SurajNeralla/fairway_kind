"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Heart, Search, ShieldCheck, ArrowRight, Calendar, DollarSign, CheckCircle2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/auth-context';

interface CharityItem {
  id: string;
  name: string;
  category: string;
  description: string;
  logo_url?: string;
  upcoming_event?: string;
  total_raised?: number;
  is_active: boolean;
}

export default function CharitiesPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [charities, setCharities] = useState<CharityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Independent Donation Modal State
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedCharityForDonation, setSelectedCharityForDonation] = useState<CharityItem | null>(null);
  const [donationAmount, setDonationAmount] = useState('50');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);

  const fetchCharities = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`/api/charities?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setCharities(data.charities || []);
      } else {
        showToast('Error', data.error || 'Failed to fetch charities', 'error');
      }
    } catch {
      showToast('Network Error', 'Could not load charity directory.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchTerm, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCharities();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCharities]);

  const handleSelectForActiveSubscription = async (charityId: string, charityName: string) => {
    if (!user) {
      window.location.href = `/subscribe?charity=${charityId}`;
      return;
    }

    setIsSelecting(charityId);
    try {
      const res = await fetch('/api/charities/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId, voluntaryPercent: 15 }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Charity Partner Updated!', `${charityName} selected for your subscription allocation.`, 'success');
      } else {
        // If not subscribed yet, route to subscription page
        if (res.status === 404) {
          window.location.href = `/subscribe?charity=${charityId}`;
        } else {
          showToast('Notice', data.error || 'Could not update charity selection.', 'error');
        }
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Selection failed', 'error');
    } finally {
      setIsSelecting(null);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('donation') === 'success') {
        const charityName = params.get('charity') || 'your selected cause';
        const amt = params.get('amount') || 'your contribution';
        showToast(
          'Donation Confirmed via Stripe!',
          `Thank you for your independent gift of $${amt} to ${charityName}. An official tax receipt has been emailed by Stripe.`,
          'success'
        );
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('donation') === 'cancelled') {
        showToast('Donation Cancelled', 'Your direct donation session was cancelled.', 'info');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [showToast]);

  useEffect(() => {
    if (user?.email && !donorEmail) {
      setDonorEmail(user.email);
    }
  }, [user, donorEmail]);

  const handleOpenDonation = (charity: CharityItem) => {
    setSelectedCharityForDonation(charity);
    setDonationModalOpen(true);
  };

  const handleExecuteDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharityForDonation) return;

    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum < 1) {
      showToast('Invalid Amount', 'Please enter a donation amount of at least $1.00.', 'error');
      return;
    }

    if (!donorEmail) {
      showToast('Email Required', 'Please provide an email address for your official tax receipt.', 'error');
      return;
    }

    setIsDonating(true);
    try {
      const res = await fetch('/api/charities/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: selectedCharityForDonation.id,
          amount: amountNum,
          donorEmail,
          donorName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to initialize Stripe payment screen');
      }

      showToast('Redirecting to Stripe...', 'Transferring to secure Stripe Checkout payment screen...', 'info');
      window.location.href = data.url;
    } catch (err: any) {
      showToast('Donation Error', err.message || 'Payment initialization failed', 'error');
      setIsDonating(false);
    }
  };

  return (
    <div className="bg-background text-on-surface antialiased py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
            Philanthropic Directory
          </div>
          <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-background tracking-tight font-semibold">
            Partner Charities &amp; Impact
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Every FairwayKind subscriber allocates a minimum of 10% (and up to 100%) of their subscription to a verified 501(c)(3) non-profit cause. You can also make direct independent donations anytime.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 custom-card-shadow">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search charity name, mission, or cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-on-surface-variant" />}
            />
          </div>
          <div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Causes' },
                { value: 'Youth & Sports Access', label: 'Youth & Sports' },
                { value: 'Environment & Climate', label: 'Environment' },
                { value: 'Pediatric Health', label: 'Health & Research' },
                { value: 'Veteran Welfare', label: 'Veteran Welfare' },
              ]}
            />
          </div>
        </div>

        {/* Charity Grid */}
        {isLoading ? (
          <LoadingState message="Loading verified partner charities from database..." />
        ) : charities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {charities.map((charity) => (
              <div
                key={charity.id}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-2xl">
                        {charity.logo_url || '⛳'}
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                          {charity.category}
                        </span>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
                          {charity.name}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-secondary flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                      Verified 501(c)(3)
                    </span>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {charity.description}
                  </p>

                  {/* Upcoming Golf Event / Day */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Upcoming Golf Day / Event</span>
                      <span className="font-body-sm text-body-sm text-on-surface">
                        {charity.upcoming_event || 'Annual Partner Golf Invitational & Scramble — October 2026'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenDonation(charity)}
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    className="rounded-full font-semibold text-xs"
                  >
                    Direct Donation
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleSelectForActiveSubscription(charity.id, charity.name)}
                    isLoading={isSelecting === charity.id}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="rounded-full font-semibold text-xs"
                  >
                    Select for Subscription
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Charities Found"
            description="Try modifying your search criteria or selecting a different category filter."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          />
        )}
      </div>

      {/* Independent Donation Modal (Not tied to gameplay) */}
      <Modal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        title={`Independent Donation to ${selectedCharityForDonation?.name || 'Charity'}`}
      >
        <form onSubmit={handleExecuteDonation} className="space-y-5">
          <p className="text-xs text-on-surface-variant">
            Make an independent tax-deductible contribution directly to {selectedCharityForDonation?.name}. This donation is not tied to subscription membership or draw participation.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-on-surface">Select or Enter Amount ($USD)</label>
            <div className="grid grid-cols-4 gap-2">
              {['25', '50', '100', '250'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDonationAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    donationAmount === amt
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <Input
              placeholder="Custom Amount ($)"
              type="number"
              min="1"
              step="1"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              required
            />
          </div>

          <Input
            label="Donor Full Name"
            placeholder="David Miller"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            required
          />

          <Input
            label="Donor Email (For 501(c)(3) Tax Receipt)"
            type="email"
            placeholder="david@example.com"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            required
          />

          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Contribution Total:</span>
              <span className="font-bold text-primary text-base">${parseFloat(donationAmount || '0').toFixed(2)}</span>
            </div>
            <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 pt-1 border-t border-outline-variant/20">
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>100% Tax-Deductible • 256-Bit SSL Encrypted by Stripe</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDonationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isDonating}
              leftIcon={<Heart className="w-4 h-4" />}
            >
              Proceed to Stripe Checkout &rarr;
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
