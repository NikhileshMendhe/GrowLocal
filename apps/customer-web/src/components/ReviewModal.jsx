import React, { useState } from 'react';
import { Modal } from '@growlocal/ui';
import { Loader2, Star } from 'lucide-react';
import { ENDPOINTS, api } from '../lib/apiClient';
import { useToast } from '../context/ToastContext.jsx';

export default function ReviewModal({ open, onClose, order, onReviewed }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  if (!order) return null;

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.REVIEWS.CREATE, {
        ...(order.shop_id ? { shopId: order.shop_id } : {}),
        rating,
        ...(reviewText.trim() ? { reviewText: reviewText.trim() } : {}),
        ...(order.product_id ? { productId: order.product_id } : {}),
        orderId: order.id,
      });
      toast('Thanks! Your review is live.');
      setRating(5);
      setReviewText('');
      onClose();
      onReviewed?.();
    } catch (err) {
      setError(err.message || 'Could not submit the review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={order.shop_name ? `Review ${order.shop_name}` : 'Rate your purchase'}
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
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Post review
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
              className="p-1"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  value <= rating ? 'fill-amber-500 text-amber-500' : 'fill-[#E5E7E5] text-[#E5E7E5]'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-[#111111]">{rating}.0</span>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            Your experience
          </label>
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            rows={4}
            placeholder={`How was ${order.product_name} from ${order.shop_name}?`}
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
