import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  Check,
  ExternalLink,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { formatDate, humanize } from '../lib/format';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/orders', label: 'Inquiries & Orders', icon: ShoppingBag, badgeKey: 'inquiries' },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/activities', label: 'Activity Log', icon: Activity },
];

function playNotificationChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Inquiries & Orders notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeAlert, setActiveAlert] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const lastSeenIdRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const adminName = admin?.full_name || admin?.fullName || admin?.name || 'Admin';
  const adminEmail = admin?.email || '';
  const adminRole = admin?.role_name || admin?.roleName || null;

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  async function loadNotifications() {
    try {
      const res = await api.get('/notifications/mine', { query: { limit: 15 } });
      const list = res?.notifications || res?.rows || (Array.isArray(res) ? res : []);
      setNotifications(list);

      const unread = list.filter((n) => !n.is_read).length;
      setUnreadCount(unread);

      if (list.length > 0) {
        const topItem = list[0];
        if (!isInitialLoadRef.current && lastSeenIdRef.current && topItem.id !== lastSeenIdRef.current) {
          setActiveAlert(topItem);
          playNotificationChime();
        }
        lastSeenIdRef.current = topItem.id;
      }
      isInitialLoadRef.current = false;
    } catch {
      // Fallback: load recent inquiries if notifications table is empty
      try {
        const inqRes = await api.get('/admin/enquiries', { query: { limit: 10 } });
        const inqList = inqRes?.enquiries || [];
        setNotifications(
          inqList.map((i) => ({
            id: i.id,
            type: 'enquiry_created',
            title: 'Customer Inquiry',
            message: i.message || `Inquiry for ${i.product_name || 'Store Item'}`,
            created_at: i.created_at,
            is_read: i.status !== 'pending',
            reference_type: 'enquiry',
            reference_id: i.id,
          }))
        );
        setUnreadCount(inqList.filter((i) => i.status === 'pending' || !i.status).length);
      } catch {}
    }
  }

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel('admin-layout-notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        loadNotifications();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        loadNotifications();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enquiries' }, () => {
        loadNotifications();
      })
      .subscribe();

    const interval = setInterval(loadNotifications, 20000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  async function handleMarkAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }

  function handleNotificationClick(notif) {
    setShowNotifications(false);
    if (!notif.is_read) {
      api.patch(`/notifications/${notif.id}/read`).catch(() => null);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    if (notif.reference_type === 'order' || notif.type?.includes('order')) {
      navigate('/orders?tab=orders');
    } else if (notif.reference_type === 'enquiry' || notif.type?.includes('enquiry')) {
      navigate('/orders?tab=enquiries');
    } else if (notif.type?.includes('customer')) {
      navigate('/customers');
    } else {
      navigate('/orders');
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#E5E7E5] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-[#111111]">GrowLocal</p>
          <p className="text-xs text-[#666666]">Admin Console</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-light text-brand-dark font-semibold'
                  : 'text-[#666666] hover:bg-[#F7F8F7] hover:text-[#111111]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badgeKey === 'inquiries' && unreadCount > 0 ? (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500 text-white animate-pulse">
                {unreadCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[#E5E7E5] p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-light text-brand-dark flex items-center justify-center text-sm font-semibold shrink-0">
            {initials(adminName)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-sm font-medium text-[#111111] truncate">{adminName}</p>
            <p className="text-xs text-[#666666] truncate">
              {[adminRole ? humanize(adminRole) : null, adminEmail].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 rounded-lg text-[#666666] hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8F7]">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E5E7E5] z-30">
        {sidebar}
      </aside>

      {menuOpen ? (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85%] bg-white h-full">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar for Notifications & Shortcuts */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E5E7E5] shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-[#F7F8F7]"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#666666]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Store Live & Ready</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E5E7E5] text-[#444444] hover:bg-[#F7F8F7] hover:text-[#111111] transition-colors"
            >
              View Storefront
              <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
            </a>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-[#666666] hover:text-[#111111] hover:bg-[#F7F8F7] transition-colors"
                title="Customer Inquiries & Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-600 text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {showNotifications ? (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5E7E5] rounded-2xl shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3.5 border-b border-[#E5E7E5] bg-[#F7F8F7] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider">
                          Live Notifications ({notifications.length})
                        </h4>
                      </div>
                      {unreadCount > 0 ? (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-brand hover:underline"
                        >
                          Mark all read
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          All caught up
                        </span>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E7E5]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#666666]">
                          No notifications yet. When a customer registers, inquires on WhatsApp, or places an order, it will appear here live.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notif) => {
                          const isOrder = notif.reference_type === 'order' || notif.type?.includes('order');
                          const isEnquiry = notif.reference_type === 'enquiry' || notif.type?.includes('enquiry');

                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 hover:bg-[#F9FAF9] cursor-pointer transition-colors flex items-start gap-3 ${
                                !notif.is_read ? 'bg-emerald-50/30' : ''
                              }`}
                            >
                              <div className="w-8 h-8 rounded-xl bg-[#F0F2F0] border border-[#E5E7E5] flex items-center justify-center shrink-0 mt-0.5">
                                {isOrder ? (
                                  <ShoppingBag className="w-4 h-4 text-brand" />
                                ) : isEnquiry ? (
                                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Users className="w-4 h-4 text-blue-600" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-xs mb-0.5">
                                  <span className={`font-semibold ${!notif.is_read ? 'text-[#111111] font-bold' : 'text-[#444444]'}`}>
                                    {notif.title || 'Notification'}
                                  </span>
                                  <span className="text-[10px] text-[#888888]">
                                    {formatDate(notif.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-[#666666] line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>

                              {!notif.is_read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-2.5 border-t border-[#E5E7E5] bg-[#F7F8F7] text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/orders');
                        }}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        View all orders & inquiries &rarr;
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </header>

        {/* Floating Realtime Alert Banner */}
        {activeAlert ? (
          <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              {activeAlert.reference_type === 'order' || activeAlert.type?.includes('order') ? (
                <ShoppingBag className="w-5 h-5 animate-bounce text-brand" />
              ) : (
                <MessageCircle className="w-5 h-5 animate-bounce text-[#25D366]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm text-[#111111]">
                  {activeAlert.title || 'New Alert Received!'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveAlert(null)}
                  className="text-[#999999] hover:text-[#111111]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#555555] line-clamp-2 mt-1">
                {activeAlert.message || 'A new commerce activity occurred on GrowLocal.'}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const alert = activeAlert;
                    setActiveAlert(null);
                    handleNotificationClick(alert);
                  }}
                  className="text-xs font-bold text-white bg-brand px-3 py-1.5 rounded-lg hover:bg-[#0F752C] transition-colors"
                >
                  View Now
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAlert(null)}
                  className="text-xs font-medium text-[#666666] hover:text-[#111111] px-2 py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
