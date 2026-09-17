import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ENDPOINTS, SOCKET_EVENTS } from '@growlocal/api-client';
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Clock,
  IndianRupee,
  MessageCircle,
  Package,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';
import { api } from '../lib/apiClient';
import { formatINR, ORDER_STATUS_META, timeAgo } from '../lib/format';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, PageLoader, StatCard } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const ACTIVE_ORDER_STATUSES = ['confirmed', 'ready_for_pickup', 'out_for_delivery'];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [enquiries, setEnquiries] = useState(null);
  const [offers, setOffers] = useState(null);
  const [products, setProducts] = useState(null);
  const [shop, setShop] = useState(undefined);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [ordersData, enquiriesData, offersData, productsData] = await Promise.all([
        api.get(ENDPOINTS.ORDERS.SHOP, { query: { limit: 100 } }),
        api.get(ENDPOINTS.ENQUIRIES.SHOP, { query: { limit: 100 } }),
        api.get(ENDPOINTS.OFFERS.CREATE, { query: { limit: 100 } }),
        api.get(ENDPOINTS.PRODUCTS.LIST, { query: { limit: 100 } }),
      ]);
      setOrders(ordersData.orders);
      setEnquiries(enquiriesData.enquiries);
      setOffers(offersData.offers);
      setProducts(productsData.products);
      try {
        const shopData = await api.get(ENDPOINTS.MERCHANTS.MY_SHOP);
        setShop(shopData.shop);
      } catch (err) {
        if (err.status !== 404) throw err;
        setShop(null);
      }
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upsertOrder = useCallback((order) => {
    setOrders((prev) => {
      if (!prev) return prev;
      const existing = prev.some((item) => item.id === order.id);
      if (existing) return prev.map((item) => (item.id === order.id ? order : item));
      return [order, ...prev];
    });
  }, []);

  useSocketEvent(SOCKET_EVENTS.ORDER_CREATED, (order) => {
    upsertOrder(order);
    toast(`New order ${order.order_code} — ${order.quantity} × ${order.product_name}`);
  });

  useSocketEvent(SOCKET_EVENTS.ORDER_STATUS_CHANGED, (payload) => {
    upsertOrder(payload);
  });

  useSocketEvent(SOCKET_EVENTS.ENQUIRY_CREATED, (enquiry) => {
    setEnquiries((prev) => (prev ? [enquiry, ...prev.filter((item) => item.id !== enquiry.id)] : prev));
    toast(`New enquiry from ${enquiry.customer_name}`);
  });

  useSocketEvent(SOCKET_EVENTS.OFFER_STATUS_CHANGED, (offer) => {
    setOffers((prev) => (prev ? prev.map((item) => (item.id === offer.id ? offer : item)) : prev));
    if (offer.status === 'accepted') toast(`Offer accepted — ${formatINR(offer.price)} on ${offer.product_name}`);
    if (offer.status === 'rejected') toast(`Offer declined on ${offer.product_name}`, 'error');
  });

  const stats = useMemo(() => {
    if (!orders || !enquiries || !offers || !products) return null;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return {
      pendingOrders: orders.filter((order) => order.status === 'pending_confirmation').length,
      activeOrders: orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status)).length,
      completedToday: orders.filter(
        (order) => order.status === 'completed' && new Date(order.updated_at) >= startOfToday
      ).length,
      revenueToday: orders
        .filter((order) => order.status === 'completed' && new Date(order.updated_at) >= startOfToday)
        .reduce((sum, order) => sum + Number(order.total_amount), 0),
      totalRevenue: orders
        .filter((order) => order.status === 'completed')
        .reduce((sum, order) => sum + Number(order.total_amount), 0),
      productCount: products.length,
      stockIssues: products.filter((product) => product.availability_status !== 'In Stock').length,
      pendingEnquiries: enquiries.filter((enquiry) =>
        ['pending', 'responded', 'offer_sent'].includes(enquiry.status)
      ).length,
      openOffers: offers.filter((offer) => offer.status === 'sent').length,
    };
  }, [orders, enquiries, offers, products]);

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!stats) return <PageLoader label="Loading your dashboard…" />;

  const recentOrders = (orders || []).slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">
            Welcome back, {user?.owner_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-[#666666] mt-0.5">
            {shop ? `${shop.name} · ${shop.city || 'your shop'}` : 'No shop linked to this account yet'}
          </p>
        </div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
        >
          Manage orders <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Orders awaiting confirmation" value={stats.pendingOrders} tone="amber" />
        <StatCard icon={Truck} label="Active orders" value={stats.activeOrders} tone="blue" hint="confirmed → delivered" />
        <StatCard icon={IndianRupee} label="Revenue today" value={formatINR(stats.revenueToday)} hint={`${stats.completedToday} completed today`} />
        <StatCard icon={CheckCircle2} label="Completed revenue" value={formatINR(stats.totalRevenue)} tone="gray" />
        <StatCard icon={Package} label="Products" value={stats.productCount} />
        <StatCard
          icon={AlertTriangle}
          label="Stock issues"
          value={stats.stockIssues}
          tone={stats.stockIssues > 0 ? 'red' : 'gray'}
          hint={stats.stockIssues > 0 ? 'low or out of stock' : 'all in stock'}
        />
        <StatCard icon={MessageCircle} label="Open enquiries" value={stats.pendingEnquiries} tone="blue" />
        <StatCard icon={BadgePercent} label="Offers awaiting reply" value={stats.openOffers} tone="amber" />
      </div>

      <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7E5]">
          <h2 className="text-sm font-semibold text-[#111111]">Recent orders</h2>
          <Link to="/orders" className="text-xs font-semibold text-brand hover:text-brand-dark">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Orders customers place with your shop appear here in real time."
          />
        ) : (
          <ul className="divide-y divide-[#E5E7E5]">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link to="/orders" className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F8F7] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                    {order.fulfillment_type === 'delivery' ? (
                      <Truck className="w-4 h-4 text-brand" />
                    ) : (
                      <Store className="w-4 h-4 text-brand" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111111] truncate">
                      {order.order_code} · {order.customer_name}
                    </p>
                    <p className="text-xs text-[#666666] truncate">
                      {order.quantity} × {order.product_name} · {timeAgo(order.created_at)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#111111] shrink-0">{formatINR(order.total_amount)}</p>
                  <StatusBadge meta={ORDER_STATUS_META[order.status]} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
