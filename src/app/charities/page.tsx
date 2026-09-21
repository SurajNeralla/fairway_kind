"use client";

import React, { useState } from 'react';
import { Heart, Search, Filter, ShieldCheck, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';

const SAMPLE_CHARITIES = [
  {
    id: '1',
    name: 'Youth on Course Foundation',
    category: 'Youth & Sports Access',
    description: 'Providing junior golfers underrepresented in sport access to play for $5 per round at 2,000+ facilities.',
    total_raised: 384200,
    logo: '⛳',
  },
  {
    id: '2',
    name: 'Clean Oceans & Coastal Wetlands',
    category: 'Environment & Climate',
    description: 'Restoring marine ecosystems, protecting coastal golf link habitats, and removing plastic pollutants.',
    total_raised: 291500,
    logo: '🌊',
  },
  {
    id: '3',
    name: 'St. Jude Children’s Research Hospital',
    category: 'Pediatric Health',
    description: 'Leading the way the world understands, treats and defeats childhood cancer and other life-threatening diseases.',
    total_raised: 520800,
    logo: '🏥',
  },
  {
    id: '4',
    name: 'Veterans Golf Healing Alliance',
    category: 'Veteran Welfare',
    description: 'Empowering military veterans through adaptive golf rehabilitation and mental health support networks.',
    total_raised: 185400,
    logo: '🎗️',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <Badge variant="emerald">501(c)(3) Impact Catalog</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Partner Charities & Social Impact
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Every Digital Heroes member allocates a minimum of 10% (up to 100%) of their monthly subscription to a verified non-profit cause.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search charity name or cause..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCharities.map((charity) => (
            <Card key={charity.id} variant="glass" hoverEffect className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                      {charity.logo}
                    </div>
                    <div>
                      <Badge variant="neutral" size="sm">{charity.category}</Badge>
                      <h3 className="text-base font-bold text-white mt-0.5">{charity.name}</h3>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{charity.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Total Impact Raised</span>
                  <span className="text-base font-bold text-emerald-400">${charity.total_raised.toLocaleString()}</span>
                </div>
                <Button variant="charity" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Select Charity
                </Button>
              </div>
            </Card>
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
  );
}
