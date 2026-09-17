import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function Spinner({ className = 'w-6 h-6' }) {
  return <Loader2 className={`animate-spin text-[#138A36] ${className}`} />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#666666]">
      <Spinner className="w-8 h-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F7F8F7]">
      <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center">
        <span className="text-white font-bold text-xl font-[Poppins,sans-serif]">G</span>
      </div>
      <Spinner className="w-6 h-6" />
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#111111]">{error?.message || 'Something went wrong'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-semibold text-brand hover:text-brand-dark underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mb-1">
          <Icon className="w-6 h-6 text-brand" />
        </div>
      )}
      <p className="text-sm font-semibold text-[#111111]">{title}</p>
      {description && <p className="text-sm text-[#666666] max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export function Pagination({ offset, limit, total, onOffset }) {
  if (total <= 0) return null;
  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <p className="text-xs text-[#666666]">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOffset(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="p-2 rounded-lg border border-[#E5E7E5] bg-white text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8F7]"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onOffset(offset + limit)}
          disabled={to >= total}
          className="p-2 rounded-lg border border-[#E5E7E5] bg-white text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8F7]"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-light text-brand',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-500',
    gray: 'bg-gray-100 text-gray-600',
  };
  return (
    <div className="bg-white border border-[#E5E7E5] rounded-xl p-4 card-shadow flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#666666]">{label}</p>
        <p className="text-xl font-bold text-[#111111] font-[Poppins,sans-serif] leading-tight">{value}</p>
        {hint && <p className="text-xs text-[#666666] truncate">{hint}</p>}
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
              active
                ? 'bg-brand text-white border-brand'
                : 'bg-white text-[#666666] border-[#E5E7E5] hover:border-[#BBE3C8] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
