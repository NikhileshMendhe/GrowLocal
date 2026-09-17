import React from 'react';

const STATUS_STYLES = {
  pending_confirmation: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  ready_for_pickup: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-brand-light text-brand-dark border-brand/20',
  rejected_by_merchant: 'bg-red-50 text-red-700 border-red-200',
  cancelled_by_customer: 'bg-[#F7F8F7] text-[#666666] border-[#E5E7E5]',
  expired: 'bg-[#F7F8F7] text-[#666666] border-[#E5E7E5]',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  responded: 'bg-blue-50 text-blue-700 border-blue-200',
  offer_sent: 'bg-purple-50 text-purple-700 border-purple-200',
  accepted: 'bg-brand-light text-brand-dark border-brand/20',
  declined: 'bg-red-50 text-red-700 border-red-200',
  sent: 'bg-purple-50 text-purple-700 border-purple-200',
  broadcasted: 'bg-blue-50 text-blue-700 border-blue-200',
  fulfilled: 'bg-brand-light text-brand-dark border-brand/20',
};

const STATUS_LABELS = {
  pending_confirmation: 'Pending confirmation',
  ready_for_pickup: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  rejected_by_merchant: 'Rejected by shop',
  cancelled_by_customer: 'Cancelled',
  offer_sent: 'Offer received',
  broadcasted: 'Broadcasted',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-[#F7F8F7] text-[#666666] border-[#E5E7E5]';
  const label = STATUS_LABELS[status] || String(status || '').replaceAll('_', ' ');
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold border rounded-full px-2.5 py-0.5 capitalize ${style}`}
    >
      {label}
    </span>
  );
}
