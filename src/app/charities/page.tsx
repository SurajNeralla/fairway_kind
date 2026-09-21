"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Search, ShieldCheck, ArrowRight, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

interface CharityItem {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
  upcoming_event: string;
}

const SAMPLE_CHARITIES: CharityItem[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Youth on Course Foundation',
    category: 'Youth & Sports Access',
    description: 'Providing junior golfers underrepresented in sport access to play for $5 per round at 2,000+ facilities nationwide.',
    logo: '⛳',
    upcoming_event: 'Annual Junior Invitational Charity Golf Day — October 18, 2026',
  },
  {
    id: 'c2000000-0000-0000-0000-000000000002',
    name: 'Clean Oceans & Coastal Wetlands',
    category: 'Environment & Climate',
    description: 'Restoring marine ecosystems, protecting coastal golf link habitats, and removing synthetic micro-plastic runoff.',
    logo: '🌊',
    upcoming_event: 'Coastal Links Conservation Scramble — November 07, 2026',
  },
  {
    id: 'c3000000-0000-0000-0000-000000000003',
    name: 'St. Jude Children’s Research Hospital',
    category: 'Pediatric Health',
    description: 'Leading the way the world understands, treats and defeats childhood cancer. Families never receive a bill for treatment or housing.',
    logo: '🏥',
    upcoming_event: 'Children’s Hope Invitational Golf Classic — December 12, 2026',
  },
  {
    id: 'c4000000-0000-0000-0000-000000000004',
    name: 'PGA REACH Military Rehabilitation',
    category: 'Veteran Welfare',
    description: 'Empowering wounded military veterans through adaptive golf rehabilitation, mental health programs, and peer community networks.',
    logo: '🎗️',
    upcoming_event: 'Patriots Golf Day & Adaptive Clinic — November 11, 2026',
  },
];

export default function CharitiesPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Independent Donation Modal State
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedCharityForDonation, setSelectedCharityForDonation] = useState<CharityItem | null>(null);
  const [donationAmount, setDonationAmount] = useState('50');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isDonating, setIsDonating] = useState(false);

  const filteredCharities = SAMPLE_CHARITIES.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const handleOpenDonation = (charity: CharityItem) => {
    setSelectedCharityForDonation(charity);
    setDonationModalOpen(true);
  };

  const handleExecuteDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Invalid Amount', 'Please enter a valid donation amount.', 'error');
      return;
    }

    setIsDonating(true);
    // Simulate direct independent charity contribution
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsDonating(false);
    setDonationModalOpen(false);

    showToast(
      'Donation Confirmed!',
      `Thank you for your independent contribution of $${amountNum.toFixed(2)} to ${selectedCharityForDonation?.name}. A tax receipt will be sent to your email.`,
      'success'
    );
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
                { value: 'youth', label: 'Youth & Sports' },
                { value: 'environment', label: 'Environment' },
                { value: 'health', label: 'Health & Research' },
                { value: 'veteran', label: 'Veteran Welfare' },
              ]}
            />
          </div>
        </div>

        {/* Charity Grid */}
        {filteredCharities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-8 custom-card-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-2xl">
                        {charity.logo}
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
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Upcoming Golf Day</span>
                      <span className="font-body-sm text-body-sm text-on-surface">{charity.upcoming_event}</span>
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
                  <Link
                    href={`/subscribe?charity=${charity.id}`}
                    className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Select for Subscription</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
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

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Contribution Total:</span>
            <span className="font-bold text-primary text-sm">${parseFloat(donationAmount || '0').toFixed(2)}</span>
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
              Complete Independent Gift
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
