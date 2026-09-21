"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ShieldCheck, ArrowLeft, ExternalLink, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { Charity } from '@/lib/types';

const SAMPLE_CHARITY_FALLBACKS: Record<string, any> = {
  'c1000000-0000-0000-0000-000000000001': {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Youth on Course Foundation',
    category: 'Youth & Sports Access',
    description: 'Providing junior golfers underrepresented in sport access to play for $5 per round at 2,000+ facilities nationwide.',
    total_raised: 384200,
    logo_url: '⛳',
    events: [
      { date: 'Oct 15, 2026', title: 'National Junior Open Qualifier' },
      { date: 'Nov 02, 2026', title: 'Equipment Access Drive' },
    ],
  },
  'c2000000-0000-0000-0000-000000000002': {
    id: 'c2000000-0000-0000-0000-000000000002',
    name: 'Clean Oceans & Coastal Wetlands',
    category: 'Ecological Stewardship',
    description: 'Restoring marine ecosystems, protecting coastal golf link habitats, and removing plastic pollutants.',
    total_raised: 291500,
    logo_url: '🌊',
    events: [
      { date: 'Oct 22, 2026', title: 'Coastal Link Cleanup Summit' },
      { date: 'Nov 18, 2026', title: 'Wetland Restoration Drive' },
    ],
  },
};

function CharityDetail() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const charityId = params.id as string;

  const [charity, setCharity] = useState<Charity | null>(null);
  const [voluntaryPercent, setVoluntaryPercent] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/charities/${charityId}`);
        const data = await res.json();

        if (res.ok && data.charity) {
          setCharity(data.charity);
        } else if (SAMPLE_CHARITY_FALLBACKS[charityId]) {
          setCharity(SAMPLE_CHARITY_FALLBACKS[charityId]);
        } else {
          setErrorMsg('Charity not found.');
        }
      } catch (err: any) {
        if (SAMPLE_CHARITY_FALLBACKS[charityId]) {
          setCharity(SAMPLE_CHARITY_FALLBACKS[charityId]);
        } else {
          setErrorMsg(err.message || 'Failed to load charity details.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [charityId]);

  const handleSelectCharity = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/charities/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId,
          voluntaryPercent,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        showToast('Sign In Required', 'Please log in to select your charity.', 'info');
        router.push(`/login?next=/charities/${charityId}`);
        return;
      }

      if (!res.ok) {
        showToast('Error', data.error || 'Failed to select charity.', 'error');
      } else {
        showToast(
          'Charity Selected!',
          `${charity?.name} set as target cause with ${voluntaryPercent}% contribution.`,
          'success'
        );
        router.push('/dashboard');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading charity details..." fullPage />;
  }

  if (errorMsg || !charity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState message={errorMsg || 'Charity details unavailable.'} />
        <div className="mt-4 text-center">
          <Link href="/charities">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Charities Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back Button */}
      <Link href="/charities" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Charities
      </Link>

      {/* Main Banner Card */}
      <Card variant="glow" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-lg">
              {charity.logo_url || '💙'}
            </div>
            <div className="space-y-1">
              <Badge variant="emerald">{charity.category}</Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{charity.name}</h1>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-right">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono">Total Impact Raised</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              ${(charity.total_raised || 384200).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Description & Cause Info */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">About the Cause</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{charity.description}</p>
        </div>

        {/* Voluntary Customizer & Select Button */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400" /> Allocate Subscription to {charity.name}
            </h4>
            <p className="text-xs text-slate-400">
              Select your voluntary charity contribution percentage (minimum 10% up to 100%).
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Voluntary Grant Percentage</span>
              <span className="text-emerald-400 font-bold">{voluntaryPercent}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={voluntaryPercent}
              onChange={(e) => setVoluntaryPercent(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Min 10% Required</span>
              <span>100% Maximum</span>
            </div>
          </div>

          <Button
            variant="charity"
            className="w-full"
            isLoading={isSubmitting}
            onClick={handleSelectCharity}
            rightIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Select {charity.name} as My Charity
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function CharityDetailPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading charity..." fullPage />}>
      <CharityDetail />
    </Suspense>
  );
}
