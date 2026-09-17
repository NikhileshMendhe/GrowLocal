import React, { useState } from 'react';
import { Modal } from '@growlocal/ui';
import { Loader2, MessageSquare } from 'lucide-react';
import { ENDPOINTS, api } from '../lib/apiClient';
import { useToast } from '../context/ToastContext.jsx';

export default function EnquiryModal({ open, onClose, shopId, productId, productName }) {
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  function reset() {
    setMessage('');
    setBudget('');
    setSize('');
    setColor('');
    setError('');
  }

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.ENQUIRIES.CREATE, {
        shopId,
        ...(productId ? { productId } : {}),
        message: message.trim(),
        ...(budget.trim() ? { budget: budget.trim() } : {}),
        ...(size.trim() ? { requestedSize: size.trim() } : {}),
        ...(color.trim() ? { requestedColor: color.trim() } : {}),
      });
      toast('Enquiry sent! The shop will respond with an offer.');
      reset();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not send the enquiry');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title="Send an enquiry"
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
            disabled={submitting || message.trim().length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            Send enquiry
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {productName ? (
          <p className="text-sm text-[#666666] bg-[#F7F8F7] border border-[#E5E7E5] rounded-lg px-3 py-2">
            Asking about <span className="font-semibold text-[#111111]">{productName}</span>
          </p>
        ) : null}
        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            Message
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            placeholder="What are you looking for? Ask about availability, variants, best price…"
            className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
              Budget
            </label>
            <input
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="e.g. ₹1,500"
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
              placeholder="e.g. XL"
              className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            Color
          </label>
          <input
            value={color}
            onChange={(event) => setColor(event.target.value)}
            placeholder="e.g. Forest green"
            className="mt-1.5 w-full border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
