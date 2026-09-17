export const ORDER_STATUS_META = {
  pending_confirmation: {
    label: 'Pending confirmation',
    shortLabel: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  confirmed: {
    label: 'Confirmed',
    shortLabel: 'Confirmed',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ready_for_pickup: {
    label: 'Ready for pickup',
    shortLabel: 'Ready',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    shortLabel: 'Delivery',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  completed: {
    label: 'Completed',
    shortLabel: 'Completed',
    className: 'bg-[#EAF7EE] text-[#138A36] border-[#BBE3C8]',
  },
  rejected_by_merchant: {
    label: 'Rejected by merchant',
    shortLabel: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  cancelled_by_customer: {
    label: 'Cancelled by customer',
    shortLabel: 'Cancelled',
    className: 'bg-gray-100 text-gray-600 border-gray-300',
  },
  expired: {
    label: 'Expired',
    shortLabel: 'Expired',
    className: 'bg-stone-100 text-stone-600 border-stone-300',
  },
};

export const ORDER_TRANSITIONS = {
  pending_confirmation: ['confirmed', 'rejected_by_merchant'],
  confirmed: ['ready_for_pickup', 'out_for_delivery', 'completed'],
  ready_for_pickup: ['completed'],
  out_for_delivery: ['completed'],
  completed: [],
  rejected_by_merchant: [],
  cancelled_by_customer: [],
  expired: [],
};

export const ORDER_TRANSITION_META = {
  confirmed: { label: 'Confirm order', tone: 'primary' },
  rejected_by_merchant: { label: 'Reject order', tone: 'danger' },
  ready_for_pickup: { label: 'Mark ready for pickup', tone: 'primary' },
  out_for_delivery: { label: 'Mark out for delivery', tone: 'primary' },
  completed: { label: 'Mark completed', tone: 'primary' },
};

export const ENQUIRY_STATUS_META = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  responded: { label: 'Responded', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  offer_sent: { label: 'Offer sent', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  accepted: { label: 'Accepted', className: 'bg-[#EAF7EE] text-[#138A36] border-[#BBE3C8]' },
  declined: { label: 'Declined', className: 'bg-red-50 text-red-700 border-red-200' },
  expired: { label: 'Expired', className: 'bg-stone-100 text-stone-600 border-stone-300' },
};

export const ENQUIRY_MERCHANT_TRANSITIONS = {
  pending: ['responded', 'declined'],
  responded: ['declined'],
  offer_sent: ['declined'],
  accepted: [],
  declined: [],
  expired: [],
};

export const OFFER_STATUS_META = {
  sent: { label: 'Sent', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  accepted: { label: 'Accepted', className: 'bg-[#EAF7EE] text-[#138A36] border-[#BBE3C8]' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  expired: { label: 'Expired', className: 'bg-stone-100 text-stone-600 border-stone-300' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 border-gray-300' },
};

export const AVAILABILITY_META = {
  'In Stock': { label: 'In Stock', className: 'bg-[#EAF7EE] text-[#138A36] border-[#BBE3C8]' },
  'Low Stock': { label: 'Low Stock', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Out of Stock': { label: 'Out of Stock', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const APPROVAL_STATUS_META = {
  approved: { label: 'Approved', className: 'bg-[#EAF7EE] text-[#138A36] border-[#BBE3C8]' },
  pending: { label: 'Pending review', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  hidden: { label: 'Hidden', className: 'bg-stone-100 text-stone-600 border-stone-300' },
};

export const SHOP_STATUS_META = {
  open: { label: 'Open', className: 'bg-[#EAF7EE] text-[#138A36] border-[#BBE3C8]' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  temporarily_closed: { label: 'Temporarily closed', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspended: { label: 'Suspended', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const PAYMENT_STATUS_META = {
  pending: { label: 'Payment pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid: { label: 'Paid', className: 'bg-[#EAF7EE] text-[#138A36] border-[#BBE3C8]' },
  refunded: { label: 'Refunded', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  failed: { label: 'Payment failed', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const SUBSCRIPTION_STATUS_META = {
  active: { label: 'Active', className: 'bg-[#EAF7EE] text-[#138A36] border-[#BBE3C8]' },
  trial: { label: 'Trial', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  past_due: { label: 'Past due', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  expired: { label: 'Expired', className: 'bg-stone-100 text-stone-600 border-stone-300' },
};

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function formatINR(value) {
  const n = Number(value ?? 0);
  if (Number.isInteger(n)) return `₹${n.toLocaleString('en-IN')}`;
  return inr.format(n);
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
