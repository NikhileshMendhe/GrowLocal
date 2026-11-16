import { AlertCircle, Inbox, Loader2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clearToken } from '../lib/token';

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

export function ErrorState({ message, onRetry, action }) {
  const isAuthError =
    typeof message === 'string' &&
    (message.toLowerCase().includes('role: admin') ||
      message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('forbidden') ||
      message.toLowerCase().includes('privileges'));

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <AlertCircle className="w-8 h-8 text-red-500" />
      <p className="text-sm text-[#111111] max-w-md font-medium">
        {isAuthError
          ? 'Administrator privileges required to access this view.'
          : message || 'Something went wrong.'}
      </p>
      {isAuthError ? (
        <p className="text-xs text-[#666666] max-w-sm">
          Your current session does not have admin permissions. Please sign in with your admin credentials.
        </p>
      ) : null}
      <div className="flex items-center gap-3 mt-1">
        {isAuthError ? (
          <Link
            to="/login"
            onClick={() => clearToken()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-[#0F752C] transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign in as Admin
          </Link>
        ) : null}
        {action || null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-semibold text-brand hover:text-brand-dark px-3 py-2 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            Try again
          </button>
        ) : null}
      </div>
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
