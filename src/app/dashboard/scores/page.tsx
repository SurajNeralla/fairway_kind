"use client";

import React, { useEffect, useState } from 'react';
import { Target, Calendar, Plus, Trash2, Edit3, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { GolfScore } from '@/lib/types';
import { validateScoreValue, validateScoreDate } from '@/lib/scores/score-engine';

export default function GolfScoresPage() {
  const { showToast } = useToast();
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string>('');

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scoreToDelete, setScoreToDelete] = useState<GolfScore | null>(null);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      if (res.ok) {
        setScores(data.scores || []);
      } else {
        // Fallback demo scores if not logged in or offline
        setScores([
          { id: '1', user_id: 'u1', score: 38, played_on: '2026-09-18', is_active: true, created_at: '2026-09-18T00:00:00Z' },
          { id: '2', user_id: 'u1', score: 41, played_on: '2026-09-12', is_active: true, created_at: '2026-09-12T00:00:00Z' },
          { id: '3', user_id: 'u1', score: 36, played_on: '2026-09-05', is_active: true, created_at: '2026-09-05T00:00:00Z' },
          { id: '4', user_id: 'u1', score: 40, played_on: '2026-08-28', is_active: true, created_at: '2026-08-28T00:00:00Z' },
          { id: '5', user_id: 'u1', score: 39, played_on: '2026-08-20', is_active: true, created_at: '2026-08-20T00:00:00Z' },
        ]);
      }
    } catch (err) {
      console.error('Fetch scores error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setScoreInput('');
    setDateInput(new Date().toISOString().split('T')[0]);
    setFormError('');
  };

  const handleStartEdit = (scoreItem: GolfScore) => {
    setEditingId(scoreItem.id);
    setScoreInput(scoreItem.score.toString());
    setDateInput(scoreItem.played_on);
    setFormError('');
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const numScore = Number(scoreInput);
    const scoreVal = validateScoreValue(numScore);
    if (!scoreVal.isValid) {
      setFormError(scoreVal.error || 'Invalid score value.');
      return;
    }

    const existingDates = scores.filter(s => s.id !== editingId).map(s => s.played_on);
    const dateVal = validateScoreDate(dateInput, existingDates);
    if (!dateVal.isValid) {
      setFormError(dateVal.error || 'Invalid played date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingId);
      const endpoint = '/api/scores';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          score: numScore,
          played_on: dateInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Operation failed.');
        showToast('Error', data.error || 'Failed to save score.', 'error');
      } else {
        showToast(
          isEditing ? 'Score Updated' : 'Score Added!',
          isEditing ? 'Golf score updated successfully.' : 'New score added to rolling-five draw ticket.',
          'success'
        );
        resetForm();
        await fetchScores();
      }
    } catch (err: any) {
      setFormError(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteScore = (scoreItem: GolfScore) => {
    setScoreToDelete(scoreItem);
    setDeleteModalOpen(true);
  };

  const handleDeleteScore = async () => {
    if (!scoreToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/scores?id=${scoreToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('Delete Failed', data.error || 'Could not delete score.', 'error');
      } else {
        showToast('Score Deleted', 'Golf score removed successfully.', 'info');
        setDeleteModalOpen(false);
        setScoreToDelete(null);
        await fetchScores();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeScores = scores.filter(s => s.is_active !== false).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-[#00F0FF]" />
            <h1 className="text-2xl font-bold text-white">Golf Score Engine</h1>
            <Badge variant="cyan">Rolling-Five Active</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Log your latest 5 Stableford scores (range 1–45). Only 1 score is allowed per date. Adding a 6th score automatically replaces the oldest stored score.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Score Form Column */}
        <Card variant="glow" className="md:col-span-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {editingId ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-[#00F0FF]" />}
              {editingId ? 'Edit Golf Score' : 'Log New Golf Score'}
            </h2>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs text-slate-400">
                Cancel Edit
              </Button>
            )}
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitScore} className="space-y-4">
            <Input
              label="Stableford Score (1 – 45)"
              type="number"
              min={1}
              max={45}
              placeholder="e.g. 38"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              helperText="Valid range is 1 to 45 points."
              required
            />

            <Input
              label="Date Played (Mandatory)"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              helperText="Only 1 score is allowed per date. Future dates are prohibited."
              required
            />

            <Button
              type="submit"
              variant={editingId ? 'gold' : 'primary'}
              className="w-full"
              isLoading={isSubmitting}
            >
              {editingId ? 'Update Score' : 'Submit Score to Rolling 5'}
            </Button>
          </form>

          {/* Rolling Five Explanation Box */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <span className="text-white font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" /> Rolling-Five Score Rule
            </span>
            <p className="leading-relaxed">
              Your 5 newest scores directly form your ticket for the monthly draw. Adding a 6th score automatically rotates out the oldest date entry.
            </p>
          </div>
        </Card>

        {/* Score Cards Column */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Active 5 Score Cards (Newest First)
            </h2>
            <Badge variant="emerald">{activeScores.length} / 5 Logged</Badge>
          </div>

          {isLoading ? (
            <LoadingState message="Fetching active scores..." />
          ) : activeScores.length > 0 ? (
            <div className="space-y-3">
              {activeScores.map((item, idx) => (
                <Card
                  key={item.id}
                  variant="glass"
                  className="flex items-center justify-between p-4 border-slate-800/80 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                      <span className="text-lg font-extrabold text-white">{item.score}</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {item.score} Points
                        </span>
                        <Badge variant="cyan" size="sm">Active Ticket</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>Played on {item.played_on}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(item)}
                      className="text-slate-400 hover:text-amber-400 p-2"
                      title="Edit Score"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDeleteScore(item)}
                      className="text-slate-400 hover:text-rose-400 p-2"
                      title="Delete Score"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Scores Logged Yet"
              description="Start entering your latest Stableford golf scores (1–45) to qualify for the monthly draw."
              actionLabel="Add First Score"
              onAction={() => {
                setScoreInput('36');
              }}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Golf Score?"
        description="Are you sure you want to remove this score entry? This action cannot be undone."
      >
        {scoreToDelete && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
              Score: <strong>{scoreToDelete.score} Points</strong> | Played: <strong>{scoreToDelete.played_on}</strong>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleDeleteScore}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
