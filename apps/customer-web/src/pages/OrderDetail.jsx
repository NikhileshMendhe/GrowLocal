import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SOCKET_EVENTS } from '@growlocal/api-client';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MapPin,
  Package,
  Store,
  Truck,
  XCircle,
} from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, formatMoney, initials } from '../lib/format';

const TIMELINE = [
  'pending_confirmation',
  'confirmed',
  'ready_for_pickup',
  'out_for_delivery',
  'completed',
];

export default function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { socket } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.ORDERS.DETAIL(id))
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message || 'Could not load this order'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket) return undefined;
    const onStatusChanged = (payload) => {
      if (payload?.id === id) {
        setOrder((prev) => (prev ? { ...prev, ...payload } : prev));
        toast(`Order update: ${String(payload.status || '').replaceAll('_', ' ')}`);
      }
    };
    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, onStatusChanged);
    return () => socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED, onStatusChanged);
  }, [socket, id, toast]);

  async function cancelOrder() {
    setCancelling(true);
    try {
      const data = await api.patch(ENDPOINTS.ORDERS.CANCEL(id));
      setOrder(data.order);
      toast('Order cancelled.');
    } catch (err) {
      toast(err.message || 'Could not cancel this order', 'error');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return <EmptyState title="Order not found" subtitle={error} />;
  }

  const canCancel = order.status === 'pending_confirmation';
  const canReview = order.status === 'completed' && !reviewed;
  const timelineIndex = TIMELINE.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#666666] hover:text-brand"
      >
        <ArrowLeft className="w-4 h-4" /> All orders
      </Link>

      <div className="bg-white border border-[#E5E7E5] rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-base font-bold text-brand shrink-0">
            {initials(order.product_name)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-[#111111]">{order.product_name}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-[#666666] mt-1">
              Order {order.order_code} · placed {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        {timelineIndex >= 0 ? (
          <div className="flex items-center">
            {TIMELINE.map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <span
                    className={`w-3 h-3 rounded-full border-2 ${
                      index <= timelineIndex
                        ? 'bg-brand border-brand'
                        : 'bg-white border-[#E5E7E5]'
                    }`}
                  />
                  <span
                    className={`text-[10px] mt-1 whitespace-nowrap ${
                      index <= timelineIndex ? 'text-brand-dark font-semibold' : 'text-[#999999]'
                    }`}
                  >
                    {step === 'ready_for_pickup'
                      ? 'Ready'
                      : step === 'out_for_delivery'
                        ? 'Delivering'
                        : step === 'pending_confirmation'
                          ? 'Pending'
                          : step[0].toUpperCase() + step.slice(1)}
                  </span>
                </div>
                {index < TIMELINE.length - 1 ? (
                  <span
                    className={`flex-1 h-0.5 -mt-4 ${
                      index < timelineIndex ? 'bg-brand' : 'bg-[#E5E7E5]'
                    }`}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-[#666666]">
            <Store className="w-4 h-4 text-brand" />
            <Link
              to={`/shops/${order.shop_id}`}
              className="font-medium text-brand hover:underline truncate"
            >
              {order.shop_name}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[#666666]">
            {order.fulfillment_type === 'delivery' ? (
              <Truck className="w-4 h-4 text-brand" />
            ) : (
              <Package className="w-4 h-4 text-brand" />
            )}
            {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Store pickup'}
          </div>
          <div className="flex items-center gap-2 text-[#666666]">
            <Calendar className="w-4 h-4 text-brand" />
            {order.pickup_or_delivery_time
              ? formatDate(order.pickup_or_delivery_time)
              : 'Time to be confirmed'}
          </div>
          <div className="flex items-center gap-2 text-[#666666]">
            <MapPin className="w-4 h-4 text-brand" />
            <span className="truncate">
              {order.fulfillment_type === 'delivery'
                ? order.delivery_address || 'Address on file'
                : 'Pick up at shop'}
            </span>
          </div>
        </div>

        <div className="border-t border-[#E5E7E5] pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#666666]">
            <span>
              {formatMoney(order.unit_price)} × {order.quantity}
            </span>
            <span>{formatMoney(Number(order.unit_price) * Number(order.quantity))}</span>
          </div>
          <div className="flex justify-between font-bold text-[#111111]">
            <span>Total</span>
            <span>{formatMoney(order.total_amount)}</span>
          </div>
          <p className="text-xs text-[#666666]">
            Payment: {String(order.payment_method || 'pay_at_store').replaceAll('_', ' ')} ·{' '}
            <span className="capitalize">{order.payment_status}</span>
            {order.origin === 'offer_accepted' ? ' · from an accepted offer' : ''}
          </p>
        </div>

        {canCancel || canReview ? (
          <div className="flex flex-wrap gap-3 border-t border-[#E5E7E5] pt-4">
            {canCancel ? (
              <button
                type="button"
                onClick={cancelOrder}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:border-red-400 rounded-lg disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel order
              </button>
            ) : null}
            {canReview ? (
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg"
              >
                ★ Write a review
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        order={order}
        onReviewed={() => setReviewed(true)}
      />
    </div>
  );
}
