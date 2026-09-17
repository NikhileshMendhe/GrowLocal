import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

export function Spinner({ className = 'w-5 h-5' }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-[#666666]">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <AlertCircle className="w-8 h-8 text-red-500" />
      <p className="text-sm text-[#111111] max-w-md">{message || 'Something went wrong.'}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-brand hover:text-brand-dark"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message = 'No records found' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Inbox className="w-8 h-8 text-[#999999]" />
      <p className="text-sm text-[#666666]">{message}</p>
    </div>
  );
}
