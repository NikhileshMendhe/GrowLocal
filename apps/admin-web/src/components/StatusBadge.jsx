import { humanize } from '../lib/format';

const TONES = {
  green: 'bg-[#EAF7EE] text-[#0B6B2B]',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  gray: 'bg-[#F0F1F0] text-[#666666]',
};

const STATUS_TONES = {
  active: 'green',
  open: 'green',
  approved: 'green',
  published: 'green',
  successful: 'green',
  completed: 'blue',
  confirmed: 'blue',
  under_review: 'blue',
  draft: 'gray',
  closed: 'gray',
  temporarily_closed: 'amber',
  pending: 'amber',
  trial: 'amber',
  past_due: 'amber',
  suspended: 'red',
  blocked: 'red',
  rejected: 'red',
  hidden: 'gray',
  expired: 'gray',
  cancelled: 'gray',
  failed: 'red',
};

export default function StatusBadge({ status }) {
  const value = status === null || status === undefined || status === '' ? 'unknown' : status;
  const tone = TONES[STATUS_TONES[String(value).toLowerCase()] ?? 'gray'];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tone}`}
    >
      {humanize(value)}
    </span>
  );
}
