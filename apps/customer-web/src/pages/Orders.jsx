import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SOCKET_EVENTS } from '@growlocal/api-client';
import { ChevronRight, Loader2, Package } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useSocket } from '../context/SocketContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, formatMoney, initials } from '../lib/format';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending_confirmation', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'ready_for_pickup', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled_by_customer', label: 'Cancelled' },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.ORDERS.MINE, { query: { limit: 50, ...(status ? { status } : {}) } })
      .then((data) => {
        setOrders(data.orders || []);
        setError('');
      })
      .catch((err) => setError(err.message || 'Could not load orders'))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (!socket) return undefined;
    const onCreated = (order) => {
      if (!order?.id) return;
      setOrders((prev) =>
        prev.some((item) => item.id === order.id) ? prev : [order, ...prev]
      );
    };
    const onStatusChanged = (payload) => {
      if (!payload?.id) return;
      setOrders((prev) =>
        prev.map((item) =>
          item.id === payload.id ? { ...item, ...payload } : item
        )
      );
    };
    socket.on(SOCKET_EVENTS.ORDER_CREATED, onCreated);
    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, onStatusChanged);
    return () => {
      socket.off(SOCKET_EVENTS.ORDER_CREATED, onCreated);
      socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED, onStatusChanged);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">My orders</h1>
        <p className="text-sm text-[#666666] mt-1">
          Everything you've committed to buy — live updates as shops confirm.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatus(filter.value)}
            className={`shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-full border ${
              status === filter.value
                ? 'text-white bg-brand border-brand'
                : 'text-[#666666] bg-white border-[#E5E7E5] hover:border-brand hover:text-brand'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : error ? (
        <EmptyState title="Something went wrong" subtitle={error} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          subtitle="When you buy from a local shop, your orders show up here."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white border border-[#E5E7E5] rounded-xl p-4 hover:border-brand card-shadow-hover"
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center text-sm font-bold text-brand shrink-0">
                  {initials(order.product_name)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#111111] truncate">
                      {order.product_name}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-[#666666] mt-0.5 truncate">
                    {order.order_code} · {order.shop_name || 'GrowLocal Order'} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#111111]">
                    {formatMoney(order.total_amount)}
                  </p>
                  <p className="text-xs text-[#666666]">×{order.quantity}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#999999] shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
