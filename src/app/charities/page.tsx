"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Search, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';

const SAMPLE_CHARITIES = [
  {
    id: '1',
    name: 'Youth on Course Foundation',
    category: 'Youth & Sports Access',
    description: 'Providing junior golfers underrepresented in sport access to play for $5 per round at 2,000+ facilities nationwide.',
    total_raised: 384200,
    logo: '⛳',
    badge: 'GuideStar Platinum',
  },
  {
    id: '2',
    name: 'Clean Oceans & Coastal Wetlands',
    category: 'Environment & Climate',
    description: 'Restoring marine ecosystems, protecting coastal golf link habitats, and removing synthetic micro-plastic runoff.',
    total_raised: 291500,
    logo: '🌊',
    badge: 'Charity Navigator 4-Star',
  },
  {
    id: '3',
    name: 'St. Jude Children’s Research Hospital',
    category: 'Pediatric Health',
    description: 'Leading the way the world understands, treats and defeats childhood cancer. Families never receive a bill for treatment or housing.',
    total_raised: 520800,
    logo: '🏥',
    badge: '501(c)(3) Tier 1',
  },
  {
    id: '4',
    name: 'PGA REACH Military Rehabilitation',
    category: 'Veteran Welfare',
    description: 'Empowering wounded military veterans through adaptive golf rehabilitation, mental health programs, and peer community networks.',
    total_raised: 185400,
    logo: '🎗️',
    badge: 'Audited Partner',
  },
];

export default function CharitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCharities = SAMPLE_CHARITIES.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-background text-on-surface antialiased py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-tertiary font-label-sm text-label-sm uppercase tracking-wider">
            Philanthropic Partners
          </div>
          <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-background tracking-tight font-semibold">
            Partner Charities & Impact
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Every FairwayKind member allocates a minimum of 10% (and up to 100%) of their monthly subscription to a vetted 501(c)(3) non-profit cause.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 custom-card-shadow">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search charity name or cause..."
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
                    <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                      {charity.badge}
                    </span>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {charity.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-surface-container flex items-center justify-between">
                  <div>
                    <span className="block font-label-sm text-label-sm text-outline uppercase tracking-wider">Total Pool Donated</span>
                    <span className="font-headline-md text-headline-md font-bold text-primary">${charity.total_raised.toLocaleString()}</span>
                  </div>
                  <Link
                    href={`/subscribe?charity=${charity.id}`}
                    className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Select as My Charity</span>
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
    </div>
  );
}
