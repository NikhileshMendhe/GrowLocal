import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ExternalLink,
  MessageCircle,
  Package,
  Plus,
  Radio,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useApiData } from '../hooks/useApiData';
import { formatCurrency, formatDate } from '../lib/format';
import PageHeader from '../components/PageHeader';
import { LoadingState, ErrorState } from '../components/StateViews';

export default function Dashboard() {
  const { loading, data, error, refetch } = useApiData(() => api.get('/admin/dashboard'), []);

  const counts = data?.counts || {};
  const recentActivity = data?.recentActivity || [];

  const { data: productsData, refetch: refetchProducts } = useApiData(
    () => api.get('/admin/products', { query: { limit: 5 } }),
    []
  );
  const recentProducts = productsData?.products || [];

  const { data: ordersData, refetch: refetchOrders } = useApiData(
    () => api.get('/admin/orders', { query: { limit: 5 } }),
    []
  );
  const recentOrders = ordersData?.orders || [];

  const { data: enquiriesData, refetch: refetchEnquiries } = useApiData(
    () => api.get('/admin/enquiries', { query: { limit: 5 } }),
    []
  );
  const recentEnquiries = enquiriesData?.enquiries || enquiriesData?.data || [];

  // Real-time Supabase Data Synchronization
  useEffect(() => {
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        refetch();
        refetchProducts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refetch();
        refetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, () => {
        refetch();
        refetchEnquiries();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_activities' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, refetchProducts, refetchOrders, refetchEnquiries]);

  const totalInquiriesOrders =
    counts.total_inquiries_and_orders !== undefined
      ? counts.total_inquiries_and_orders
      : (counts.orders || 0) + (counts.enquiries || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your product catalog, customer activity, and orders."
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Sync
            </div>
            <button
              type="button"
              onClick={() => {
                refetch();
                refetchProducts();
                refetchOrders();
                refetchEnquiries();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-[#E5E7E5] bg-white text-[#111111] hover:bg-[#F7F8F7] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-[#0F752C] shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Manage Products
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-[#E5E7E5]">
          <LoadingState label="Loading dashboard metrics…" />
        </div>
      ) : error ? (
        <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-6">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : (
        <>
          {/* 4 Core Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Products */}
            <Link
              to="/products"
              className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow hover:border-brand/50 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Total Products
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#111111] mt-2">
                {counts.products ?? 0}
              </p>
              <p className="text-xs text-brand font-medium mt-1 flex items-center gap-1">
                View catalog &rarr;
              </p>
            </Link>

            {/* Card 2: Active In Stock */}
            <Link
              to="/products?availability=In+Stock"
              className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow hover:border-brand/50 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Active In Stock
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#111111] mt-2">
                {counts.active_in_stock ?? 0}
              </p>
              <p className="text-xs text-brand font-medium mt-1 flex items-center gap-1">
                View in-stock &rarr;
              </p>
            </Link>

            {/* Card 3: Inquiries & Orders */}
            <Link
              to="/orders"
              className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow hover:border-brand/50 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Inquiries & Orders
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#111111] mt-2">
                {totalInquiriesOrders}
              </p>
              <p className="text-xs text-[#666666] mt-1">
                {(counts.orders ?? 0)} orders &bull; {(counts.enquiries ?? 0)} inquiries
              </p>
            </Link>

            {/* Card 4: Registered Customers */}
            <Link
              to="/customers"
              className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow hover:border-brand/50 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Registered Customers
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#111111] mt-2">
                {counts.customers ?? 0}
              </p>
              <p className="text-xs text-brand font-medium mt-1 flex items-center gap-1">
                View customers &rarr;
              </p>
            </Link>
          </div>

          {/* Quick shortcuts banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-[#F0FDF4] border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Official GrowLocal WhatsApp Business Inquiry Channel
              </div>
              <p className="text-xs text-[#555555] mt-1 max-w-xl">
                Customers discover products on the storefront and contact directly via WhatsApp (
                <span className="font-mono text-emerald-700 font-semibold">
                  https://wa.me/message/YYPIT2XYSY5WD1
                </span>
                ).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-[#E5E7E5] text-[#111111] hover:bg-[#F7F8F7] transition-colors"
              >
                Open Storefront
                <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
              </a>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand text-white hover:bg-[#0F752C] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Link>
            </div>
          </div>

          {/* 3-Column Overview: Catalog, Live Inquiries, Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Catalog Highlights */}
            <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#111111] text-base">Catalog Highlights</h3>
                <Link to="/products" className="text-xs font-semibold text-brand hover:underline">
                  View all &rarr;
                </Link>
              </div>

              {recentProducts.length === 0 ? (
                <p className="text-sm text-[#666666] py-6 text-center">No products found.</p>
              ) : (
                <div className="divide-y divide-[#E5E7E5]">
                  {recentProducts.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#F0F2F0] overflow-hidden shrink-0 flex items-center justify-center">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-[#999999]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#111111] truncate">{p.name}</p>
                          <p className="text-xs text-[#666666] truncate">
                            {p.category_name || 'Direct'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm text-brand-dark">
                          {formatCurrency(Number(p.price || 0))}
                        </p>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {p.availability_status || 'In Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live WhatsApp Customer Inquiries */}
            <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <h3 className="font-bold text-[#111111] text-base">Live Customer Inquiries</h3>
                </div>
                <Link to="/orders?tab=enquiries" className="text-xs font-semibold text-brand hover:underline">
                  View all &rarr;
                </Link>
              </div>

              {recentEnquiries.length === 0 ? (
                <p className="text-sm text-[#666666] py-6 text-center">
                  No recorded customer inquiries yet.
                </p>
              ) : (
                <div className="divide-y divide-[#E5E7E5]">
                  {recentEnquiries.map((inq) => (
                    <div key={inq.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#111111] truncate">
                          {inq.customer_name || 'WhatsApp Customer'}
                        </p>
                        <p className="text-xs text-[#666666] truncate">
                          {inq.product_name ? `Product: ${inq.product_name}` : inq.message}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {inq.status || 'Pending'}
                        </span>
                        <p className="text-[10px] text-[#999999] mt-0.5">{formatDate(inq.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#111111] text-base">Store Orders</h3>
                <Link to="/orders?tab=orders" className="text-xs font-semibold text-brand hover:underline">
                  View all &rarr;
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-sm text-[#666666] py-6 text-center">
                  No orders yet. As customers place orders, they will appear here.
                </p>
              ) : (
                <div className="divide-y divide-[#E5E7E5]">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#111111] truncate">
                          {o.customer_name || 'Guest Customer'}
                        </p>
                        <p className="text-xs text-[#666666] truncate">
                          {o.product_name} &bull; Qty {o.quantity || 1}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm text-[#111111]">
                          {formatCurrency(Number(o.total_amount || 0))}
                        </p>
                        <p className="text-[11px] text-[#999999]">{formatDate(o.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Customer Activity Stream Widget */}
          <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5 card-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111111] text-base">Live Customer Activity Stream</h3>
                  <p className="text-xs text-[#666666]">Real-time events recorded from customer browsing, carts, and inquiries</p>
                </div>
              </div>
              <Link to="/activities" className="text-xs font-semibold text-brand hover:underline flex items-center gap-1">
                View all activities &rarr;
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="py-8 text-center bg-[#F7F8F7] rounded-xl border border-dashed border-[#E5E7E5]">
                <Activity className="w-6 h-6 text-[#999999] mx-auto mb-1.5" />
                <p className="text-xs text-[#666666]">No recent customer activities yet. Actions taken on the storefront will stream here live.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentActivity.slice(0, 6).map((act) => {
                  const isCart = act.activity_type?.includes('cart');
                  const isWhatsApp = act.activity_type?.includes('whatsapp');
                  const isView = act.activity_type?.includes('view');

                  const badgeColor = isCart
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isWhatsApp
                    ? 'bg-[#E7F9EE] text-[#1EBE5D] border-[#25D366]/30'
                    : isView
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200';

                  const badgeLabel = isCart
                    ? act.activity_type === 'add_to_cart'
                      ? 'Added to Cart'
                      : act.activity_type === 'remove_from_cart'
                      ? 'Removed from Cart'
                      : 'Cart Quantity'
                    : isWhatsApp
                    ? 'WhatsApp Inquiry'
                    : isView
                    ? 'Viewed Product'
                    : act.activity_type?.replace(/_/g, ' ');

                  return (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-[#E5E7E5] bg-[#FAFBFA] flex flex-col justify-between space-y-2 hover:border-brand/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeColor}`}>
                          {badgeLabel}
                        </span>
                        <span className="text-[10px] text-[#999999] whitespace-nowrap">
                          {formatDate(act.created_at)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-[#111111] truncate">
                          {act.customer_name || 'Storefront Visitor'}
                        </p>
                        {act.product_name ? (
                          <p className="text-xs text-[#555555] truncate mt-0.5">
                            {act.product_name} {act.quantity > 1 ? `(×${act.quantity})` : ''}
                          </p>
                        ) : null}
                      </div>
                      {act.product_price ? (
                        <p className="text-xs font-bold text-brand-dark pt-1 border-t border-[#E5E7E5]/60">
                          {formatCurrency(Number(act.product_price))}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
