"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Plus, Edit3, Trash2, Shield, Search, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Charity } from '@/lib/types';

export default function AdminCharitiesPage() {
  const { showToast } = useToast();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Youth & Sports Access');
  const [formDescription, setFormDescription] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');

  const fetchCharities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/charities?includeInactive=true');
      const data = await res.json();
      if (res.ok) {
        setCharities(data.charities || []);
      }
    } catch (err) {
      console.error('Fetch charities error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const openAddModal = () => {
    setEditingCharity(null);
    setFormName('');
    setFormCategory('Youth & Sports Access');
    setFormDescription('');
    setFormLogoUrl('⛳');
    setIsModalOpen(true);
  };

  const openEditModal = (charity: Charity) => {
    setEditingCharity(charity);
    setFormName(charity.name);
    setFormCategory(charity.category);
    setFormDescription(charity.description);
    setFormLogoUrl(charity.logo_url || '💙');
    setIsModalOpen(true);
  };

  const handleSaveCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDescription) {
      showToast('Validation Error', 'Please complete charity name and description.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingCharity);
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch('/api/charities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCharity?.id,
          name: formName,
          category: formCategory,
          description: formDescription,
          logo_url: formLogoUrl,
          is_active: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast('Error', data.error || 'Failed to save charity.', 'error');
      } else {
        showToast(
          isEditing ? 'Charity Updated' : 'Charity Added',
          isEditing ? 'Charity details updated.' : 'New charity added to directory.',
          'success'
        );
        setIsModalOpen(false);
        await fetchCharities();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateCharity = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/charities?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        showToast('Error', data.error || 'Failed to deactivate charity.', 'error');
      } else {
        showToast('Charity Deactivated', 'Charity removed from public catalog.', 'info');
        await fetchCharities();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-150 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Console</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Charity Administration</h1>
            <Badge variant="emerald">Admin CRUD</Badge>
          </div>
          <p className="text-xs text-slate-400">Add, edit, deactivate, and monitor partner 501(c)(3) charities.</p>
        </div>
        <Button variant="charity" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Charity
        </Button>
      </div>

      {/* Charities Management Table */}
      {isLoading ? (
        <LoadingState message="Loading charities catalog..." />
      ) : charities.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Charity Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Total Raised</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charities.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold text-white flex items-center gap-2">
                  <span className="text-lg">{c.logo_url || '💙'}</span>
                  <span>{c.name}</span>
                </TableCell>
                <TableCell><Badge variant="neutral">{c.category}</Badge></TableCell>
                <TableCell className="font-extrabold text-emerald-400">
                  ${(c.total_raised || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  {c.is_active ? <Badge variant="emerald">Active</Badge> : <Badge variant="rose">Deactivated</Badge>}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(c)}
                    className="text-slate-400 hover:text-amber-400 p-1.5"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  {c.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeactivateCharity(c.id)}
                      className="text-slate-400 hover:text-rose-400 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          title="No Charities Found"
          description="Click below to add your first charity partner to the platform."
          actionLabel="Add First Charity"
          onAction={openAddModal}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCharity ? 'Edit Charity' : 'Add New Charity'}
        description="Provide 501(c)(3) details, cause category, and description."
      >
        <form onSubmit={handleSaveCharity} className="space-y-4">
          <Input
            label="Charity Name"
            placeholder="e.g. Akshaya Patra Foundation"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            options={[
              { value: 'Youth & Sports Access', label: 'Youth & Sports Access' },
              { value: 'Ecological Stewardship', label: 'Ecological Stewardship' },
              { value: 'Pediatric Health', label: 'Pediatric Health' },
              { value: 'Veteran Welfare', label: 'Veteran Welfare' },
            ]}
          />

          <Input
            label="Logo Emoji / Icon URL"
            placeholder="e.g. ⛳ or https://..."
            value={formLogoUrl}
            onChange={(e) => setFormLogoUrl(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
              Full Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl glass-input text-sm p-3"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Describe the cause, mission, and impact..."
              required
            />
          </div>

          <Button type="submit" variant="charity" className="w-full" isLoading={isSubmitting}>
            {editingCharity ? 'Save Changes' : 'Create Charity'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
