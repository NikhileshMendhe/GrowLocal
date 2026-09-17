import React, { useState } from 'react';
import { Modal } from '@growlocal/ui';
import { Loader2, Megaphone } from 'lucide-react';
import { ENDPOINTS, api } from '../lib/apiClient';
import { useToast } from '../context/ToastContext.jsx';

export default function DemandRequestModal({ open, onClose, categories = [], onCreated }) {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.DEMAND_REQUESTS.CREATE, {
        productName: productName.trim(),
        description: description.trim() || undefined,
        budget: budget.trim() || undefined,
        size: size.trim() || undefined,
        color: color.trim() || undefined,
        categoryId: categoryId || undefined,
      });
      toast('Demand broadcast to nearby shops!');
      setProductName('');
      setDescription('');
      setBudget('');
      setSize('');
      setColor('');
      setCategoryId('');
      onClose();
      onCreated?.();
    } catch (err) {
      setError(err.message || 'Could not submit the request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title="Can't find it? Ask the neighbourhood"
      maxWidth="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-[#666666] hover:text-[#111111] rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || productName.trim().length < 2}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Megaphone className="w-4 h-4" />
            )}
            Broadcast demand
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            What are you looking for?
          </label>
          <input
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
            placeholder="e.g. Wireless earbuds under ₹2,000"
            className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            Details
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Brand preferences, condition, anything shops should know…"
            className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
              Budget
            </label>
            <input
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="₹"
              className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
              Size
            </label>
            <input
              value={size}
              onChange={(event) => setSize(event.target.value)}
              placeholder="Optional"
              className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
              Color
            </label>
            <input
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="Optional"
              className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>
        {categories.length > 0 ? (
          <div>
            <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              <option value="">Any category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
