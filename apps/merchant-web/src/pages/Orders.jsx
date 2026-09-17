import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ENDPOINTS, SOCKET_EVENTS } from '@growlocal/api-client';
import {
  AlertOctagon,
  BadgePercent,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  MapPin,
  ShoppingBag,
  Store,
  Truck,
  User,
  Wallet,
} from 'lucide-react';
import { api } from '../lib/apiClient';
import {
  formatDateTime,
  formatINR,
  ORDER_STATUS_META,
  ORDER_TRANSITIONS,
  ORDER_TRANSITION_META,
  PAYMENT_STATUS_META,
} from '../lib/format';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, PageLoader, Pagination, Tabs } from '../components/ui';

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_confirmation', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'ready_for_pickup', label: 'Ready for pickup' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected_by_merchant', label: 'Rejected' },
  { value: 'cancelled_by_customer', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

function StatusTimeline({ order }) {
  const flow =
    order.fulfillment_type === 'delivery'
      ? ['pending_confirmation', 'confirmed', 'out_for_delivery', 'completed']
      : ['pending_confirmation', 'confirmed', 'ready_for_pickup', 'completed'];
  const currentIndex = flow.indexOf(order.status);
  const isTerminal = currentIndex === -1;

  return (
    <div className="flex items-start w-full">
      {flow.map((status, index) => {
        const done = !isTerminal && index < currentIndex;
        const current = !isTerminal && index === currentIndex;
        return (
          <React.Fragment key={status}>
            {index > 0 && (
              <div
                className={`flex-1 h-0.5 mx-1 mt-2.5 rounded-full ${done ? 'bg-brand' : 'bg-[#E5E7E5]'}`}
              />
            )}
            <div className="flex flex-col items-center gap-1 min-w-fit">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  done
                    ? 'bg-brand text-white'
                    : current
                      ? 'bg-brand text-white ring-4 ring-[#EAF7EE]'
                      : 'bg-[#E5E7E5] text-[#999999]'
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : index + 1}
              </span>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  current ? 'text-brand-dark' : 'text-[#666666]'
                }`}
              >
                {ORDER_STATUS_META[status].shortLabel}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderCard({ order, expanded, onToggle, onTransition, busy }) {
  const nextStatuses = ORDER_TRANSITIONS[order.status] || [];
  const paymentMeta = PAYMENT_STATUS_META[order.payment_status];

  return (
    <article className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow overflow-hidden">
      <button
        onClick={() => onToggle(order.id)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F7F8F7] transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
          {order.fulfillment_type === 'delivery' ? (
            <Truck className="w-5 h-5 text-brand" />
          ) : (
            <Store className="w-5 h-5 text-brand" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-[#111111]">{order.order_code}</p>
            {order.origin === 'offer_accepted' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">
                <BadgePercent className="w-3 h-3" /> via offer
              </span>
            )}
          </div>
          <p className="text-xs text-[#666666] truncate mt-0.5">
            {order.customer_name} · {order.quantity} × {order.product_name} · {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-[#111111]">{formatINR(order.total_amount)}</p>
          <p className="text-[11px] text-[#666666] capitalize">{order.fulfillment_type}</p>
        </div>
        <div className="hidden sm:block shrink-0">
          <StatusBadge meta={ORDER_STATUS_META[order.status]} />
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#666666] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#666666] shrink-0" />
        )}
      </button>

      <div className="sm:hidden px-4 pb-3">
        <StatusBadge meta={ORDER_STATUS_META[order.status]} />
      </div>

      {expanded && (
        <div className="border-t border-[#E5E7E5] px-4 py-4 flex flex-col gap-4 bg-[#FCFDFC]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-[#999999] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#666666]">Customer</p>
                <p className="font-semibold text-[#111111] break-words">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-[#999999] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#666666]">Item</p>
                <p className="font-semibold text-[#111111] break-words">
                  {order.product_name} × {order.quantity}
                </p>
                <p className="text-[#666666]">{formatINR(order.unit_price)} each</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Wallet className="w-3.5 h-3.5 text-[#999999] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#666666]">Payment</p>
                <p className="font-semibold text-[#111111] capitalize">
                  {order.payment_method?.replace(/_/g, ' ')}
                </p>
                <StatusBadge meta={paymentMeta} className="mt-1" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Hash className="w-3.5 h-3.5 text-[#999999] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#666666]">Placed</p>
                <p className="font-semibold text-[#111111]">{formatDateTime(order.created_at)}</p>
                {order.pickup_or_delivery_time && (
                  <p className="text-[#666666]">
                    {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}:{' '}
                    {formatDateTime(order.pickup_or_delivery_time)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {order.fulfillment_type === 'delivery' && order.delivery_address && (
            <div className="flex items-start gap-2 text-xs bg-white border border-[#E5E7E5] rounded-xl px-3 py-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#999999] mt-0.5 shrink-0" />
              <p className="text-[#111111] break-words">{order.delivery_address}</p>
            </div>
          )}

          <div className="bg-white border border-[#E5E7E5] rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#666666] mb-2.5">Progress</p>
            {ORDER_STATUS_META[order.status] && ['rejected_by_merchant', 'cancelled_by_customer', 'expired'].includes(order.status) ? (
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-500" />
                <StatusBadge meta={ORDER_STATUS_META[order.status]} />
              </div>
            ) : (
              <StatusTimeline order={order} />
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#666666] mb-2">
              Next actions
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {nextStatuses.map((nextStatus) => {
                const transitionMeta = ORDER_TRANSITION_META[nextStatus];
                const isDanger = transitionMeta.tone === 'danger';
                const isBusy = busy === `${order.id}:${nextStatus}`;
                return (
                  <button
                    key={nextStatus}
                    onClick={() => onTransition(order, nextStatus)}
                    disabled={busy !== null}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      isDanger
                        ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
                        : 'bg-brand text-white hover:bg-brand-hover'
                    }`}
                  >
                    {isDanger && <AlertOctagon className="w-3.5 h-3.5" />}
                    {isBusy ? 'Updating…' : transitionMeta.label}
                  </button>
                );
              })}
              {nextStatuses.length === 0 && (
                <p className="text-xs text-[#666666] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Terminal state — no further transitions are allowed.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function Orders() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await api.get(ENDPOINTS.ORDERS.SHOP, {
          query: { status: statusFilter || undefined, limit: PAGE_SIZE, offset },
        });
        setRows(data.orders);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, offset]
  );

  useEffect(() => {
    load();
  }, [load]);

  const matchesFilter = useCallback(
    (status) => !statusFilter || status === statusFilter,
    [statusFilter]
  );

  const upsertOrder = useCallback(
    (order, isNew) => {
      setRows((prev) => {
        if (!prev) return prev;
        const exists = prev.some((item) => item.id === order.id);
        if (exists) {
          return matchesFilter(order.status)
            ? prev.map((item) => (item.id === order.id ? order : item))
            : prev.filter((item) => item.id !== order.id);
        }
        if (matchesFilter(order.status) && offset === 0) {
          return [order, ...prev];
        }
        return prev;
      });
      if (isNew && matchesFilter(order.status)) setTotal((prev) => prev + 1);
    },
    [matchesFilter, offset]
  );

  useSocketEvent(SOCKET_EVENTS.ORDER_CREATED, (order) => {
    upsertOrder(order, true);
    toast(`New order ${order.order_code} — ${order.quantity} × ${order.product_name}`);
  });

  useSocketEvent(SOCKET_EVENTS.ORDER_STATUS_CHANGED, (payload) => {
    setRows((prev) => {
      if (!prev) return prev;
      const exists = prev.some((item) => item.id === payload.id);
      if (exists) {
        return matchesFilter(payload.status)
          ? prev.map((item) => (item.id === payload.id ? payload : item))
          : prev.filter((item) => item.id !== payload.id);
      }
      return prev;
    });
  });

  async function handleTransition(order, nextStatus) {
    setBusy(`${order.id}:${nextStatus}`);
    try {
      const data = await api.patch(ENDPOINTS.ORDERS.STATUS(order.id), { status: nextStatus });
      setRows((prev) => (prev ? prev.map((item) => (item.id === order.id ? data.order : item)) : prev));
      toast(`Order ${data.order.order_code} is now ${ORDER_STATUS_META[nextStatus].label}`);
    } catch (err) {
      toast(err.message || 'Could not update the order', 'error');
      if (err.status === 409 || err.code === 'INVALID_TRANSITION') load(true);
    } finally {
      setBusy(null);
    }
  }

  const statusCounts = useMemo(() => {
    if (statusFilter || !rows) return null;
    const counts = {};
    for (const order of rows) counts[order.status] = (counts[order.status] || 0) + 1;
    return counts;
  }, [rows, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">Orders</h1>
          <p className="text-sm text-[#666666] mt-0.5">
            Confirm, fulfil and close customer orders — transitions follow the API state machine exactly.
          </p>
        </div>
        <p className="text-xs text-[#666666]">
          {total} order{total === 1 ? '' : 's'}
          {statusCounts && Object.keys(statusCounts).length > 0
            ? ` · ${Object.entries(statusCounts)
                .map(([status, count]) => `${ORDER_STATUS_META[status]?.shortLabel || status}: ${count}`)
                .join(' · ')}`
            : ''}
        </p>
      </div>

      <Tabs
        tabs={STATUS_TABS}
        value={statusFilter}
        onChange={(value) => {
          setStatusFilter(value);
          setOffset(0);
        }}
      />

      {loading ? (
        <PageLoader label="Loading orders…" />
      ) : error ? (
        <ErrorState error={error} onRetry={() => load()} />
      ) : !rows || rows.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={statusFilter ? `No ${ORDER_STATUS_META[statusFilter]?.label || statusFilter} orders` : 'No orders yet'}
          description="New orders arrive here live the moment a customer checks out."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={setExpandedId}
              onTransition={handleTransition}
              busy={busy}
            />
          ))}
          <Pagination offset={offset} limit={PAGE_SIZE} total={total} onOffset={setOffset} />
        </div>
      )}
    </div>
  );
}
