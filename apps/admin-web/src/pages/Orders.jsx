import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Loader2,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatCurrency, formatDate } from '../lib/format';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { LoadingState, ErrorState } from '../components/StateViews';
import OrderDrawer from '../components/OrderDrawer';

const PAGE_SIZE = 15;

const ENQUIRY_STATUSES = [
  { value: 'pending', label: 'Pending Response', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'responded', label: 'Responded / Contacted', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'accepted', label: 'Accepted / Converted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'declined', label: 'Declined', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
];

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'pending_confirmation', label: 'Pending Confirmation', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'processing', label: 'Processing', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'shipped', label: 'Shipped', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'completed', label: 'Completed / Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' },
];

export default function Orders() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get('tab') === 'enquiries' ? 'enquiries' : 'orders';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [inspectingId, setInspectingId] = useState(null);

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

  const endpoint = tab === 'orders' ? '/admin/orders' : '/admin/enquiries';

  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get(endpoint, {
        query: {
          status: status || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        },
      }),
    [tab, page, status]
  );

  // Real-time Supabase sync on orders, enquiries, and deliveries
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-enquiries-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const { items, total } = normalizeList(data);
  const pageCount = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;

  async function handleInspectOrder(orderId) {
    setInspectingId(orderId);
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.order);
    } catch (err) {
      toast(err?.message || 'Failed to load order details', { variant: 'error' });
    } finally {
      setInspectingId(null);
    }
  }

  async function handleStatusChange(id, nextStatus) {
    setUpdatingId(id);
    try {
      const path = tab === 'orders' ? `/admin/orders/${id}/status` : `/admin/enquiries/${id}/status`;
      await api.patch(path, { status: nextStatus });
      toast('Status updated successfully');
      refetch();
    } catch (err) {
      toast(err?.message || 'Failed to update status', { variant: 'error' });
    } finally {
      setUpdatingId(null);
    }
  }

  function getWhatsAppHref(row) {
    if (row.customer_phone) {
      const cleanPhone = String(row.customer_phone).replace(/\D/g, '');
      const ref = row.enquiry_code || row.order_code || row.id?.slice(0, 8);
      const text = encodeURIComponent(`Hi ${row.customer_name || 'Customer'}, regarding your GrowLocal inquiry (${ref}):`);
      return `https://wa.me/${cleanPhone}?text=${text}`;
    }
    return 'https://wa.me/message/YYPIT2XYSY5WD1';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries & Orders"
        description="Track customer purchase inquiries and orders placed through WhatsApp and the storefront."
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7E5] pb-3">
        <button
          type="button"
          onClick={() => updateSearchParam('tab', 'orders')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${tab === 'orders'
              ? 'bg-brand text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F0F2F0] hover:text-[#111111]'
            }`}
        >
          Customer Orders
        </button>
        <button
          type="button"
          onClick={() => updateSearchParam('tab', 'enquiries')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${tab === 'enquiries'
              ? 'bg-brand text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F0F2F0] hover:text-[#111111]'
            }`}
        >
          <MessageCircle className="w-4 h-4" />
          Direct Inquiries
        </button>
      </div>

      {/* Table view */}
      <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingState label={`Loading customer ${tab}…`} />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error.message} onRetry={refetch} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg text-[#111111]">
              No {tab === 'orders' ? 'orders' : 'inquiries'} found
            </h3>
            <p className="text-sm text-[#666666] mt-1 max-w-sm mx-auto">
              Customer purchase requests will appear here in real time as customers contact via
              WhatsApp and the storefront.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F7F8F7] border-b border-[#E5E7E5] text-[#666666] font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">{tab === 'orders' ? 'Total Amount' : 'Budget / Value'}</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E5]">
                  {items.map((row) => {
                    const refCode = row.enquiry_code || row.order_code || row.id?.slice(0, 8);
                    const amount = Number(row.total_amount || row.product_price || row.budget || row.price || 0);

                    return (
                      <tr key={row.id} className="hover:bg-[#FBFDFB] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-brand">
                          <div>#{refCode}</div>
                          {tab === 'enquiries' && (
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${row.message?.toLowerCase().includes('whatsapp') || row.message?.toLowerCase().includes('cart inquiry')
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                            >
                              {row.message?.toLowerCase().includes('whatsapp') || row.message?.toLowerCase().includes('cart inquiry')
                                ? 'WhatsApp Lead'
                                : 'Direct Inquiry'}
                            </span>
                          )}
                          {tab === 'orders' && (
                            <div className="flex flex-col gap-1 mt-1">
                              {row.item_count > 1 && (
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                                  {row.item_count} Items
                                </span>
                              )}
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                                {row.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#111111]">
                            {row.recipient_name || row.customer_name || (tab === 'enquiries' ? 'Store Visitor' : 'Customer')}
                          </div>
                          <div className="text-xs text-[#666666]">
                            {row.recipient_phone || row.customer_phone || row.customer_email || 'Inquiry Contact'}
                          </div>
                          {tab === 'orders' && (row.delivery_full_address || row.delivery_address) && (
                            <div className="text-[11px] text-[#888888] truncate max-w-xs mt-0.5" title={row.delivery_full_address || row.delivery_address}>
                              📍 {row.delivery_full_address || row.delivery_address}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-[#F0F2F0] border border-[#E5E7E5] overflow-hidden shrink-0 flex items-center justify-center">
                              {row.product_image ? (
                                <img
                                  src={row.product_image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-[#999999]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#111111] truncate max-w-xs">
                                {row.product_name || 'Store Item'}
                              </p>
                              {row.message ? (
                                <p className="text-xs text-[#666666] truncate max-w-xs" title={row.message}>
                                  {row.message}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-brand-dark whitespace-nowrap">
                          {amount > 0 ? formatCurrency(amount) : '—'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={row.status || (tab === 'orders' ? 'pending' : 'pending')}
                            disabled={updatingId === row.id}
                            onChange={(e) => handleStatusChange(row.id, e.target.value)}
                            className="py-1 px-2.5 text-xs font-semibold rounded-lg border border-[#E5E7E5] bg-white text-[#111111] focus:ring-2 focus:ring-brand cursor-pointer disabled:opacity-50"
                          >
                            {(tab === 'orders' ? ORDER_STATUSES : ENQUIRY_STATUSES).map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#666666] whitespace-nowrap">
                          {formatDate(row.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {tab === 'orders' && (
                              <button
                                type="button"
                                onClick={() => handleInspectOrder(row.id)}
                                disabled={inspectingId === row.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111111] bg-[#F0F2F0] hover:bg-[#E5E7E5] border border-[#E5E7E5] transition-colors"
                              >
                                {inspectingId === row.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                                Details & Delivery
                              </button>
                            )}

                            <a
                              href={getWhatsAppHref(row)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-xs transition-transform hover:scale-105"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white" />
                              WhatsApp
                            </a>
                          </div>
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

      {/* Order & Delivery Management Drawer */}
      <OrderDrawer
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdate={() => {
          refetch();
          if (selectedOrder?.id) {
            handleInspectOrder(selectedOrder.id);
          }
        }}
      />
    </div>
  );
}
