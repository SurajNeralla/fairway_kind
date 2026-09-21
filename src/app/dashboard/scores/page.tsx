"use client";

import React, { useEffect, useState } from 'react';
import { Target, Calendar, Plus, Trash2, Edit3, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
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
        setScores([
          { id: '1', user_id: 'u1', score: 39, played_on: '2024-10-22', is_active: true, created_at: '2024-10-22T00:00:00Z' },
          { id: '2', user_id: 'u1', score: 36, played_on: '2024-10-14', is_active: true, created_at: '2024-10-14T00:00:00Z' },
          { id: '3', user_id: 'u1', score: 41, played_on: '2024-10-04', is_active: true, created_at: '2024-10-04T00:00:00Z' },
          { id: '4', user_id: 'u1', score: 34, played_on: '2024-09-28', is_active: true, created_at: '2024-09-28T00:00:00Z' },
          { id: '5', user_id: 'u1', score: 38, played_on: '2024-09-18', is_active: true, created_at: '2024-09-18T00:00:00Z' },
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

    const numScore = parseInt(scoreInput, 10);
    const scoreValResult = validateScoreValue(numScore);
    if (!scoreValResult.isValid) {
      setFormError(scoreValResult.error || 'Invalid score.');
      return;
    }

    const dateValResult = validateScoreDate(dateInput);
    if (!dateValResult.isValid) {
      setFormError(dateValResult.error || 'Invalid date.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch('/api/scores', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            score: numScore,
            played_on: dateInput,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Failed to update score.');
          showToast('Update Failed', data.error || 'Score update error', 'error');
        } else {
          showToast('Score Updated', 'Your golf score has been successfully modified.', 'success');
          resetForm();
          await fetchScores();
        }
      } else {
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: numScore,
            played_on: dateInput,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Failed to submit score.');
          showToast('Submission Error', data.error || 'Failed to add score.', 'error');
        } else {
          showToast('Score Attested', 'New score saved to your rolling 5 entries.', 'success');
          resetForm();
          await fetchScores();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
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
    <div className="bg-background text-on-surface antialiased py-10">
      <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 custom-card-shadow">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
                <Target className="w-5 h-5" />
              </div>
              <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Golf Score Engine</h1>
              <span className="bg-primary-fixed/40 text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                Rolling 5 Active
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Log your official Stableford scores (range 1–45). Only 1 score is allowed per date. Adding a 6th score automatically replaces the oldest stored score.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Score Form Column */}
          <div className="md:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 md:p-8 custom-floating-shadow space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                {editingId ? <Edit3 className="w-4 h-4 text-secondary" /> : <Plus className="w-4 h-4 text-primary" />}
                {editingId ? 'Edit Golf Score' : 'Log New Golf Score'}
              </h2>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs text-on-surface-variant">
                  Cancel Edit
                </Button>
              )}
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-error-container text-xs text-on-error-container flex items-start gap-2.5 border border-error/30">
                <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
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
                className="w-full h-11 rounded-xl font-semibold"
                isLoading={isSubmitting}
              >
                {editingId ? 'Update Score' : 'Submit Score to Rolling 5'}
              </Button>
            </form>

            {/* Rolling Five Explanation Box */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-variant space-y-1.5">
              <span className="text-on-surface font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Rolling-Five Score Rule
              </span>
              <p className="leading-relaxed">
                Your 5 newest attested scores directly form your ticket for the monthly draw. Adding a 6th score automatically rotates out the oldest date entry.
              </p>
            </div>
          </div>

          {/* Score Cards Column */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Active 5 Score Cards (Newest First)
              </h2>
              <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold">
                {activeScores.length} / 5 Logged
              </span>
            </div>

            {isLoading ? (
              <LoadingState message="Fetching active scores..." />
            ) : activeScores.length > 0 ? (
              <div className="space-y-3">
                {activeScores.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex items-center justify-between custom-card-shadow hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex flex-col items-center justify-center">
                        <span className="text-[10px] text-on-surface-variant font-mono">#{idx + 1}</span>
                        <span className="text-lg font-extrabold text-primary">{item.score}</span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-on-surface">
                            {item.score} Points
                          </span>
                          <span className="bg-[#E8EFEA] text-[#2E5A44] font-label-sm text-[11px] px-2 py-0.5 rounded-md font-semibold">
                            Active Ticket
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <Calendar className="w-3.5 h-3.5 text-outline" />
                          <span>Played on {item.played_on}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(item)}
                        className="text-on-surface-variant hover:text-secondary p-2"
                        title="Edit Score"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDeleteScore(item)}
                        className="text-on-surface-variant hover:text-error p-2"
                        title="Delete Score"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
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
              <div className="p-3.5 rounded-xl bg-error-container text-xs text-on-error-container border border-error/30">
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
    </div>
  );
}
