import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Clock,
  Eye,
  LogIn,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  User,
  UserCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatCurrency, formatDateTime } from '../lib/format';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews';

const PAGE_SIZE = 20;

const ACTIVITY_FILTERS = [
  { value: '', label: 'All Activities' },
  { value: 'add_to_cart', label: 'Added to Cart' },
  { value: 'whatsapp_inquiry_click', label: 'WhatsApp Inquiries' },
  { value: 'update_cart_quantity', label: 'Cart Quantity Changes' },
  { value: 'remove_from_cart', label: 'Cart Removals' },
  { value: 'view_product', label: 'Product Views' },
  { value: 'login', label: 'Customer Logins' },
  { value: 'registered', label: 'New Registrations' },
];

function getActivityBadge(type) {
  switch (type) {
    case 'add_to_cart':
      return {
        label: 'Added to Cart',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: ShoppingBag,
      };
    case 'whatsapp_inquiry_click':
      return {
        label: 'WhatsApp Inquiry',
        className: 'bg-[#E7F9EE] text-[#1EBE5D] border-[#25D366]/30',
        icon: MessageCircle,
      };
    case 'update_cart_quantity':
      return {
        label: 'Quantity Changed',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Plus,
      };
    case 'remove_from_cart':
      return {
        label: 'Removed from Cart',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: Trash2,
      };
    case 'view_product':
      return {
        label: 'Viewed Product',
        className: 'bg-sky-50 text-sky-700 border-sky-200',
        icon: Eye,
      };
    case 'login':
      return {
        label: 'Customer Logged In',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: LogIn,
      };
    case 'registered':
      return {
        label: 'Customer Registered',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: UserCheck,
      };
    default:
      return {
        label: type?.replace(/_/g, ' ') || 'Action',
        className: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        icon: Activity,
      };
  }
}

export default function Activities() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activityType = searchParams.get('type') || '';
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  function updateSearchParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next, { replace: true });
  }

  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get('/admin/activities', {
        query: {
          q: q.trim() || undefined,
          activityType: activityType || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        },
      }),
    [page, q, activityType]
  );

  // Real-time Supabase sync on customer_activities
  useEffect(() => {
    const channel = supabase
      .channel('admin-activities-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'customer_activities' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const { items, total } = normalizeList(data);
  const pageCount = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Activity Log"
        description="Real-time chronological log of customer actions, cart additions, and inquiry events."
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Sync
            </div>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-[#E5E7E5] bg-white text-[#111111] hover:bg-[#F7F8F7] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="bg-white border border-[#E5E7E5] rounded-2xl p-4 card-shadow space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateSearchParam('q', searchInput.trim());
              }}
              onBlur={() => updateSearchParam('q', searchInput.trim())}
              placeholder="Search by customer name, email, or product…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          {/* Activity Type Dropdown */}
          <div className="sm:w-60">
            <select
              value={activityType}
              onChange={(e) => updateSearchParam('type', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
            >
              {ACTIVITY_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick pill filter buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ACTIVITY_FILTERS.slice(0, 6).map((f) => {
            const active = activityType === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => updateSearchParam('type', f.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-brand text-white'
                    : 'bg-[#F0F2F0] text-[#555555] hover:bg-[#E5E7E5] hover:text-[#111111]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingState label="Loading customer activities…" />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error.message} onRetry={refetch} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg text-[#111111]">No customer activities yet</h3>
            <p className="text-sm text-[#666666] mt-1 max-w-sm mx-auto">
              Real-time events will appear here automatically when customers view products, add to
              cart, update quantities, or click WhatsApp inquiries.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F7F8F7] border-b border-[#E5E7E5] text-[#666666] font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Activity</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4 text-right">Price / Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E5]">
                  {items.map((row) => {
                    const badge = getActivityBadge(row.activity_type);
                    const BadgeIcon = badge.icon;
                    const price = Number(row.product_price || 0);

                    return (
                      <tr key={row.id} className="hover:bg-[#FBFDFB] transition-colors">
                        <td className="py-3.5 px-4 text-xs text-[#666666] whitespace-nowrap">
                          <div className="font-medium text-[#111111]">
                            {formatDateTime(row.created_at)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#EAF7EE] text-brand font-bold text-xs flex items-center justify-center shrink-0">
                              {(row.customer_name || 'G')[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#111111] truncate max-w-[160px]">
                                {row.customer_name || 'Storefront Visitor'}
                              </p>
                              <p className="text-xs text-[#666666] truncate max-w-[160px]">
                                {row.customer_email || row.customer_phone || 'Guest'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.className}`}
                          >
                            <BadgeIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {row.product_name ? (
                            <div className="min-w-0">
                              <p className="font-medium text-[#111111] truncate max-w-xs">
                                {row.product_name}
                              </p>
                              {row.product_id ? (
                                <p className="text-[11px] text-[#999999] font-mono">
                                  ID: {row.product_id.slice(0, 8)}…
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-[#999999] text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#111111]">
                          {row.quantity > 0 ? row.quantity : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-brand-dark text-right whitespace-nowrap">
                          {price > 0 ? formatCurrency(price * (row.quantity || 1)) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pageCount > 1 ? (
              <div className="p-4 border-t border-[#E5E7E5]">
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onChange={(p) => updateSearchParam('page', p)}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
