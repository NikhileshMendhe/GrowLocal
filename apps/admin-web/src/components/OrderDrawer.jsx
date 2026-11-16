import React, { useState } from 'react';
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Save,
  Send,
  ShieldCheck,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';
import { useToast } from '../context/ToastContext';

const DELIVERY_STATUSES = [
  { value: 'pending', label: 'Pending Processing' },
  { value: 'dispatched', label: 'Dispatched / In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered Successfully' },
  { value: 'failed', label: 'Delivery Failed / Returned' },
];

export default function OrderDrawer({ open, onClose, order, onUpdate }) {
  const toast = useToast();
  const [deliveryStatus, setDeliveryStatus] = useState(
    order?.delivery?.delivery_status || 'pending'
  );
  const [deliveryNotes, setDeliveryNotes] = useState(
    order?.delivery?.delivery_notes || ''
  );
  const [updating, setUpdating] = useState(false);

  // Sync state when order prop changes
  React.useEffect(() => {
    if (order) {
      setDeliveryStatus(order?.delivery?.delivery_status || 'pending');
      setDeliveryNotes(order?.delivery?.delivery_notes || '');
    }
  }, [order]);

  if (!open || !order) return null;

  const refCode = order.order_code || order.id?.slice(0, 8);
  const delivery = order.delivery || {};
  const recipientName = delivery.recipient_name || order.customer_name || 'Customer';
  const recipientPhone = delivery.recipient_phone || order.customer_phone || '';
  const deliveryAddress = delivery.delivery_address || order.delivery_address || '';
  const items = order.items && order.items.length > 0 ? order.items : [];
  const statusHistory = order.status_history || [];

  function getWhatsAppHref() {
    if (recipientPhone) {
      const cleanPhone = String(recipientPhone).replace(/\D/g, '');
      const text = encodeURIComponent(
        `Hi ${recipientName}, regarding your GrowLocal order (#${refCode}):\nStatus: ${order.status}\nFulfillment: ${order.fulfillment_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}`
      );
      return `https://wa.me/${cleanPhone}?text=${text}`;
    }
    return 'https://wa.me/message/YYPIT2XYSY5WD1';
  }

  async function handleUpdateDelivery(e) {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.patch(`/admin/orders/${order.id}/delivery`, {
        deliveryStatus,
        deliveryNotes: deliveryNotes.trim() || null,
      });
      toast('Delivery details updated successfully');
      if (typeof onUpdate === 'function') {
        onUpdate();
      }
    } catch (err) {
      toast(err?.message || 'Failed to update delivery', { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-[#E5E7E5]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7E5] bg-[#F7F8F7] flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-brand">
                  #{refCode}
                </span>
                <span className="text-xs px-2.5 py-0.5 font-bold uppercase rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {order.fulfillment_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                </span>
                <span className="text-xs px-2.5 py-0.5 font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-1">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#666666] hover:text-[#111111] hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 divide-y divide-[#E5E7E5]">
            {/* Customer & Recipient Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand" /> Recipient & Customer Details
              </h4>
              <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#666666]">Recipient Name:</span>
                  <span className="font-semibold text-[#111111]">{recipientName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#666666]">Contact Phone:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#111111]">{recipientPhone || '—'}</span>
                    {recipientPhone && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <a
                          href={`tel:${recipientPhone}`}
                          className="p-1 rounded-lg bg-white border border-[#E5E7E5] text-brand hover:bg-brand hover:text-white transition-colors"
                          title="Call Recipient"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={getWhatsAppHref()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                {order.customer_email ? (
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Customer Email:</span>
                    <span className="text-[#111111]">{order.customer_email}</span>
                  </div>
                ) : null}
                {deliveryAddress ? (
                  <div className="flex justify-between gap-4 pt-1 border-t border-[#E5E7E5]">
                    <span className="text-[#666666] shrink-0">Delivery Address:</span>
                    <span className="font-medium text-[#111111] text-right">
                      {deliveryAddress}
                      {delivery.delivery_pincode ? ` - ${delivery.delivery_pincode}` : ''}
                    </span>
                  </div>
                ) : null}
                {delivery.delivery_notes ? (
                  <div className="flex justify-between gap-4 text-amber-800 bg-amber-50 p-2 rounded-xl mt-1">
                    <span className="shrink-0 font-semibold">Customer Notes:</span>
                    <span className="italic text-right">{delivery.delivery_notes}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Delivery Management & Dispatch Controls */}
            <div className="pt-6 space-y-3">
              <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand" /> Dispatch & Delivery Management
              </h4>

              <form onSubmit={handleUpdateDelivery} className="bg-white border border-[#E5E7E5] rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div>
                  <label className="text-xs font-semibold text-[#666666] block mb-1">
                    Delivery Status
                  </label>
                  <select
                    value={deliveryStatus}
                    onChange={(e) => setDeliveryStatus(e.target.value)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-[#E5E7E5] bg-white text-[#111111] focus:ring-2 focus:ring-brand focus:border-brand"
                  >
                    {DELIVERY_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#666666] block mb-1">
                    Delivery / Rider Notes (Internal & Tracking)
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Assigned to delivery partner Amit (Ph: 9876543210), out for delivery"
                    className="w-full py-2 px-3 text-xs rounded-xl border border-[#E5E7E5] focus:ring-2 focus:ring-brand/30 focus:border-brand focus:outline-none"
                  />
                </div>

                {delivery.dispatched_at && (
                  <p className="text-[11px] text-[#666666]">
                    🚀 Dispatched on: {formatDate(delivery.dispatched_at)}
                  </p>
                )}
                {delivery.delivered_at && (
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    ✅ Delivered on: {formatDate(delivery.delivered_at)}
                  </p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand hover:bg-[#0F752C] rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Delivery Update
                  </button>
                </div>
              </form>
            </div>

            {/* Ordered Items Breakdown */}
            <div className="pt-6 space-y-3">
              <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-brand" />
                Ordered Items ({items.length || 1})
              </h4>

              <div className="border border-[#E5E7E5] rounded-2xl overflow-hidden divide-y divide-[#E5E7E5] bg-[#F7F8F7]">
                {items.length > 0 ? (
                  items.map((it) => (
                    <div key={it.id} className="p-3.5 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7E5] overflow-hidden flex items-center justify-center shrink-0">
                          {it.product_image ? (
                            <img src={it.product_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-[#999999]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#111111] truncate">{it.product_name}</p>
                          <p className="text-[#666666] mt-0.5">
                            {formatCurrency(it.unit_price)} × {it.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#111111] shrink-0">
                        {formatCurrency(it.total_price)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#111111]">{order.product_name}</span>
                    <span className="font-bold text-[#111111]">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                )}

                <div className="p-3.5 bg-white flex justify-between items-center text-sm font-bold text-[#111111]">
                  <span>Total Amount Paid / Payable:</span>
                  <span className="text-base text-brand-dark">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Lifecycle / Status History Audit Trail */}
            <div className="pt-6 space-y-3">
              <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-brand" /> Status & Audit Trail ({statusHistory.length})
              </h4>

              {statusHistory.length > 0 ? (
                <div className="space-y-3 relative pl-4 border-l-2 border-[#E5E7E5] my-2">
                  {statusHistory.map((h, idx) => (
                    <div key={h.id || idx} className="relative text-xs space-y-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand absolute -left-[21px] top-1 border-2 border-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111111] uppercase tracking-wide">
                          {h.new_status}
                        </span>
                        <span className="text-[10px] text-[#888888] px-1.5 py-0.2 rounded-md bg-[#F0F2F0]">
                          by {h.changed_by_type}
                        </span>
                        <span className="text-[10px] text-[#888888] ml-auto">
                          {formatDate(h.created_at)}
                        </span>
                      </div>
                      {h.notes ? (
                        <p className="text-[#666666] italic">{h.notes}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#888888] italic">
                  Initial order recorded. Changes made to order or delivery status will appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
