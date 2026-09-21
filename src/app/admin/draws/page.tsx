"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Play, CheckCircle2, Shield, RefreshCw, AlertCircle, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DrawSimulationResult } from '@/lib/draws/draw-engine';

export default function AdminDrawStudioPage() {
  const { showToast } = useToast();
  const [periodMonth, setPeriodMonth] = useState<number>(9);
  const [periodYear, setPeriodYear] = useState<number>(2026);
  const [drawMode, setDrawMode] = useState<'random' | 'algorithmic'>('random');
  const [customSeed, setCustomSeed] = useState<string>(`seed-${Date.now()}`);

  const [simulation, setSimulation] = useState<DrawSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setErrorMessage('');
    setPublishMessage('');
    try {
      const res = await fetch('/api/draws/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodMonth,
          periodYear,
          mode: drawMode,
          seed: customSeed || `seed-${Date.now()}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Simulation failed.');
        showToast('Simulation Failed', data.error, 'error');
      } else {
        setSimulation(data.simulation);
        showToast('Dry-Run Simulation Complete', 'Result displayed below. NOT published.', 'info');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Simulation error.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublishDraw = async () => {
    if (!simulation) {
      showToast('Simulation Required', 'Please run a dry-run simulation first.', 'error');
      return;
    }

    setIsPublishing(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/draws/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodMonth,
          periodYear,
          mode: drawMode,
          seed: customSeed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Publishing failed.');
        showToast('Publish Error', data.error, 'error');
      } else {
        setPublishMessage(`Draw ${periodMonth}/${periodYear} successfully published to platform!`);
        showToast('Draw Published!', 'Winners committed to database.', 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Publishing error.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Draw Control Studio</h1>
            <Badge variant="gold">Deterministic & Auditable</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Configure, simulate, and publish monthly prize draws. Dry-run simulations do NOT mutate persistent database state.
          </p>
        </div>
      </div>

      {/* Control Configuration Card */}
      <Card variant="glow" className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00F0FF]" /> Draw Configuration Settings
          </h2>
          <Badge variant="cyan">{drawMode.toUpperCase()} MODE</Badge>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {publishMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{publishMessage}</span>
            </div>
            <Link href="/admin/winners">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Go to Winner Verification
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Period Month"
            value={periodMonth.toString()}
            onChange={(e) => setPeriodMonth(Number(e.target.value))}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: (i + 1).toString(),
              label: `Month ${i + 1}`,
            }))}
          />

          <Input
            label="Period Year"
            type="number"
            value={periodYear.toString()}
            onChange={(e) => setPeriodYear(Number(e.target.value))}
          />

          <Select
            label="Draw Mode"
            value={drawMode}
            onChange={(e) => setDrawMode(e.target.value as 'random' | 'algorithmic')}
            options={[
              { value: 'random', label: 'Random (Crypto PRNG)' },
              { value: 'algorithmic', label: 'Algorithmic (Score Frequency Weighted)' },
            ]}
          />

          <Input
            label="Audit Seed (Optional)"
            value={customSeed}
            onChange={(e) => setCustomSeed(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            isLoading={isSimulating}
            onClick={handleRunSimulation}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Run Dry-Run Simulation
          </Button>

          {simulation && (
            <Button
              variant="gold"
              className="w-full sm:w-auto"
              isLoading={isPublishing}
              onClick={handlePublishDraw}
              leftIcon={<Lock className="w-4 h-4" />}
            >
              Publish Finalized Draw to DB
            </Button>
          )}
        </div>
      </Card>

      {/* Simulation Results Display */}
      {simulation && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Simulation Results Preview
            </h2>
            <Badge variant="gold">Dry-Run (Unpublished)</Badge>
          </div>

          {/* Winning Numbers Banner */}
          <Card variant="glass" className="space-y-4 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Generated Winning 5 Numbers</span>
            <div className="flex justify-center items-center gap-3">
              {simulation.winningNumbers.map((num, idx) => (
                <div
                  key={idx}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-300 text-slate-950 text-2xl font-black flex items-center justify-center shadow-gold-glow"
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Mode: {simulation.mode.toUpperCase()} | Audit Seed: {simulation.seed}
            </div>
          </Card>

          {/* Tiers Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 5 */}
            <Card variant="glass" className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <Badge variant="gold">Tier 5 (5 Matches)</Badge>
                <span className="text-xs text-slate-400">40% Pool + Rollover</span>
              </div>
              <div className="space-y-1">
                <span className="block text-2xl font-extrabold text-amber-400">
                  ${simulation.tier5.totalTierPool.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300">
                  Winners: <strong>{simulation.tier5.winnerCount}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prize per Winner: ${simulation.tier5.prizePerWinner.toLocaleString()}
              </p>
              {simulation.tier5.winnerCount === 0 && (
                <div className="p-2 rounded bg-amber-950/60 border border-amber-500/30 text-[11px] text-amber-300">
                  No 5-match winners. <strong>${simulation.nextRollover.toLocaleString()}</strong> rolls over to next draw jackpot!
                </div>
              )}
            </Card>

            {/* Tier 4 */}
            <Card variant="glass" className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <Badge variant="cyan">Tier 4 (4 Matches)</Badge>
                <span className="text-xs text-slate-400">35% Pool</span>
              </div>
              <div className="space-y-1">
                <span className="block text-2xl font-extrabold text-[#00F0FF]">
                  ${simulation.tier4.totalTierPool.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300">
                  Winners: <strong>{simulation.tier4.winnerCount}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prize per Winner: ${simulation.tier4.prizePerWinner.toLocaleString()}
              </p>
            </Card>

            {/* Tier 3 */}
            <Card variant="glass" className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <Badge variant="emerald">Tier 3 (3 Matches)</Badge>
                <span className="text-xs text-slate-400">25% Pool</span>
              </div>
              <div className="space-y-1">
                <span className="block text-2xl font-extrabold text-emerald-400">
                  ${simulation.tier3.totalTierPool.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300">
                  Winners: <strong>{simulation.tier3.winnerCount}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prize per Winner: ${simulation.tier3.prizePerWinner.toLocaleString()}
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
