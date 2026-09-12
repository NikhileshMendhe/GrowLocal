import React, { useState, useEffect } from 'react';
import {
  Store, MessageSquare, ShoppingBag, BarChart2, Package, Plus,
  ChevronRight, Zap, CheckCircle2, Clock, LogOut, Bell, Settings, Star,
  PackagePlus, Inbox, Tag, Sparkles, ArrowRight, Volume2
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import { orderNotificationService } from '../services/orderNotificationService';

// Animated number counter
function AnimatedStat({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === null || value === undefined || isNaN(Number(value))) return;
    const target = Number(value);
    if (target === 0) {
      setDisplay(0);
      return;
    }
    let start = 0;
    const duration = 600;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  if (value === null || value === undefined || isNaN(Number(value))) return <span>{value ?? '—'}</span>;
  return <span>{prefix}{display}{suffix}</span>;
}

export default function MerchantDashboard({
  stats,
  enquiries = [],
  reservations = [],
  products = [],
  onNavigateMerchant,
  currentUser,
  merchantProfile,
  shops,
  onAddShop,
  onLogout,
}) {
  const currentShop = shops?.find(s => 
    (currentUser?.id && (s.merchantId === currentUser.id || s.id === currentUser.id)) ||
    (currentUser?.email && s.merchantEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser?.shopId && s.id === currentUser.shopId)
  );
  const hasListedShop = Boolean(currentShop);
  const shopName = currentShop?.name || merchantProfile?.businessName || currentUser?.shopName || (currentUser?.name ? `${currentUser.name}'s Store` : 'My Store');
  const ownerName = merchantProfile?.ownerName || currentUser?.name || 'Store Manager';
  const userEmail = currentUser?.email || merchantProfile?.email || '';
  const isVerified = merchantProfile?.verificationStatus === 'approved' || merchantProfile?.verified || Boolean(currentShop?.verified);

  const pendingEnquiries = enquiries?.filter(e =>
    e.status === 'Pending' || e.status === 'pending' || e.status === 'Pending Quotes'
  ).length || 0;

  const recentEnquiries = (enquiries || []).slice(0, 3);
  const reservationsCount = reservations?.length !== undefined ? reservations.length : (stats?.reservations ?? 0);
  const todayEnquiriesCount = stats?.todayEnquiries !== undefined ? stats.todayEnquiries : (enquiries || []).filter(e => e.timestamp === 'Today' || e.date === 'Today' || e.submittedDate === 'Today').length;

  const [testingSiren, setTestingSiren] = useState(false);

  const handleTestSiren = () => {
    orderNotificationService.initAudio();
    setTestingSiren(true);
    orderNotificationService.playSiren(3.5);
    setTimeout(() => {
      setTestingSiren(false);
    }, 3500);
  };

  const kpiItems = [
    {
      label: "New Today",
      value: todayEnquiriesCount,
      icon: Bell,
      color: '#138A36',
      bg: '#EAF7EE',
      suffix: '',
      targetTab: 'merchantEnquiries'
    },
    {
      label: "Need Reply",
      value: pendingEnquiries,
      icon: MessageSquare,
      color: pendingEnquiries > 0 ? '#D97706' : '#138A36',
      bg: pendingEnquiries > 0 ? '#FEF3C7' : '#EAF7EE',
      suffix: '',
      urgent: pendingEnquiries > 0,
      targetTab: 'merchantEnquiries'
    },
    {
      label: "Reservations",
      value: reservationsCount,
      icon: ShoppingBag,
      color: '#2563EB',
      bg: '#EFF6FF',
      suffix: '',
      targetTab: 'merchantReservations'
    },
  ];

  const quickActions = [
    {
      id: 'merchantShopProfile',
      icon: Store,
      title: 'Your Shop',
      subtitle: hasListedShop ? 'Live storefront, timings & address' : 'Set up your shop storefront',
      iconColor: '#138A36',
      iconBg: '#EAF7EE',
      iconBorder: '#CDEED5',
      badge: hasListedShop ? 'Live' : 'Action Needed',
      badgeBg: hasListedShop ? 'bg-[#EAF7EE] text-[#138A36] border border-[#CDEED5]' : 'bg-amber-50 text-amber-700 border border-amber-200',
      onClick: () => onNavigateMerchant('merchantShopProfile')
    },
    {
      id: 'merchantProducts',
      icon: PackagePlus,
      title: 'Add Product',
      subtitle: 'List something new in store',
      iconColor: '#138A36',
      iconBg: '#EAF7EE',
      iconBorder: '#CDEED5',
      badge: 'Quick Add',
      badgeBg: 'bg-[#EAF7EE] text-[#138A36] border border-[#CDEED5]',
      onClick: () => onNavigateMerchant('merchantProducts')
    },
    {
      id: 'merchantEnquiries',
      icon: Inbox,
      title: 'Customer Enquiries',
      subtitle: pendingEnquiries > 0 ? `${pendingEnquiries} pending buyer requests` : 'All customer requests answered',
      iconColor: pendingEnquiries > 0 ? '#D97706' : '#2563EB',
      iconBg: pendingEnquiries > 0 ? '#FEF3C7' : '#EFF6FF',
      iconBorder: pendingEnquiries > 0 ? '#FDE68A' : '#DBEAFE',
      badge: pendingEnquiries > 0 ? `${pendingEnquiries} Need reply` : null,
      badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200',
      onClick: () => onNavigateMerchant('merchantEnquiries')
    },
    {
      id: 'merchantReservations',
      icon: ShoppingBag,
      title: 'Store Reservations',
      subtitle: `${reservationsCount} active held pickup orders`,
      iconColor: '#7C3AED',
      iconBg: '#F5F3FF',
      iconBorder: '#DDD6FE',
      onClick: () => onNavigateMerchant('merchantReservations')
    },
    {
      id: 'merchantAnalytics',
      icon: BarChart2,
      title: 'Store Analytics',
      subtitle: 'Local search demand & foot traffic',
      iconColor: '#0D9488',
      iconBg: '#F0FDFA',
      iconBorder: '#CCFBF1',
      onClick: () => onNavigateMerchant('merchantAnalytics')
    },
    {
      id: 'merchantChats',
      icon: MessageSquare,
      title: 'Direct Customer Chats',
      subtitle: 'Live conversations & negotiation',
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
      iconBorder: '#DBEAFE',
      onClick: () => onNavigateMerchant('merchantChats')
    },
    {
      id: 'merchantOffers',
      icon: Tag,
      title: 'Deals & Promotions',
      subtitle: 'Broadcast offers to nearby buyers',
      iconColor: '#EA580C',
      iconBg: '#FFF7ED',
      iconBorder: '#FFEDD5',
      onClick: () => onNavigateMerchant('merchantOffers')
    },
  ];

  const statusColor = { 'Pending Quotes': '#D97706', 'pending': '#D97706', 'Pending': '#D97706', 'Interested': '#138A36', 'Completed': '#888', 'Rejected': '#DC2626' };
  const statusBg = { 'Pending Quotes': '#FEF3C7', 'pending': '#FEF3C7', 'Pending': '#FEF3C7', 'Interested': '#EAF7EE', 'Completed': '#F5F5F5', 'Rejected': '#FEF2F2' };

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* ── Greeting Hero ─────────────────────────────────── */}
      <div className="rounded-3xl p-5 sm:p-6 mb-5 relative overflow-hidden text-white" style={{
        background: 'linear-gradient(135deg, #0B6B2B 0%, #138A36 55%, #1aad44 100%)'
      }}>
        {/* Decorative blobs */}
        <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-3 right-20 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5">
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 text-xl sm:text-2xl shadow-xs">
              🏪
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-white leading-tight truncate">
                  {shopName}
                </h1>
                {isVerified && <VerifiedBadge text="Verified" />}
              </div>
              <p className="text-xs text-white/80 mt-0.5 truncate">
                {ownerName}{userEmail ? ` · ${userEmail}` : ''}
              </p>
              {/* Live badge */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-[10px] font-bold text-white/90">
                  Live on GrowLocal — Realtime Active
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-col sm:items-end shrink-0">
            {hasListedShop ? (
              <button
                onClick={() => onNavigateMerchant('merchantShopProfile')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#138A36] hover:bg-emerald-50 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                title="View & Manage Your Shop"
              >
                <Store className="w-4 h-4" />
                <span>Your Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : onAddShop ? (
              <button
                onClick={onAddShop}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#138A36] hover:bg-emerald-50 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                title="Configure or Add Your Shop"
              >
                <Store className="w-4 h-4" />
                <span>+ Setup / Add Shop</span>
              </button>
            ) : null}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-red-500/20 border border-white/20 text-white/90 rounded-xl text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 mt-3.5 bg-white/15 rounded-xl px-3 py-1 border border-white/20">
          <span className="text-[11px] font-bold text-white/95">
            {isVerified ? '✓ Verified Merchant' : '⏳ Pending Verification'}
          </span>
          <span className="text-white/40 text-xs">·</span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-white/95">
            <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>{merchantProfile?.rating || '4.8'}</span>
          </div>
        </div>
      </div>

      {/* ── Express Order Siren Status Banner ─────────────── */}
      <div className="mb-5 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border border-red-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform ${testingSiren ? 'bg-red-500 text-white animate-bounce' : 'bg-red-100 text-red-600'}`}>
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-gray-900">
                Instant Order Siren Notification
              </h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ● Ready
              </span>
            </div>
            <p className="text-[11px] text-gray-600 font-medium mt-0.5">
              Whenever a customer clicks <strong>"Buy Now"</strong> on any of your products, a loud siren dispatch tone alerts you immediately.
            </p>
          </div>
        </div>

        <button
          onClick={handleTestSiren}
          className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            testingSiren
              ? 'bg-red-600 text-white animate-pulse shadow-md'
              : 'bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-2xs'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{testingSiren ? 'Siren Ringing... (3.5s)' : 'Test Siren Sound'}</span>
        </button>
      </div>

      {/* ── No Shop Prompt (hidden once shop is listed) ── */}
      {!hasListedShop && onAddShop && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 sm:p-5 mb-5 flex items-center gap-3 sm:gap-4">
          <span className="text-3xl sm:text-4xl shrink-0">🏪</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-amber-900 mb-0.5">
              Set up your shop listing first!
            </p>
            <p className="text-xs text-amber-700 mb-2">
              Customers can't find you until you add your shop details to GrowLocal.
            </p>
            <button
              onClick={onAddShop}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Add Shop Now</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Today at a Glance ─────────────────────────────── */}
      <div className="mb-5">
        <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-2.5">
          Today at a Glance
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {kpiItems.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div
                key={i}
                onClick={() => onNavigateMerchant(kpi.targetTab || 'merchantEnquiries')}
                className={`bg-white rounded-2xl p-2.5 sm:p-4 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 ${
                  kpi.urgent
                    ? 'border-2 border-amber-500 shadow-sm'
                    : 'border border-[#E5E7E5] shadow-xs'
                }`}
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mb-1.5 sm:mb-2.5"
                  style={{ backgroundColor: kpi.bg }}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: kpi.color }} />
                </div>
                <p className={`text-lg sm:text-2xl font-black mb-0.5 leading-tight ${kpi.urgent ? 'text-amber-600' : 'text-[#111111]'}`}>
                  <AnimatedStat value={kpi.value} />
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 truncate">
                  {kpi.label}
                </p>
                {kpi.urgent && (
                  <span className="inline-block mt-1 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                    Attention ⚡
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Prominent Store Setup / Management Card (hidden once shop is listed) ── */}
      {onAddShop && !hasListedShop && (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#F0FDF4] via-white to-[#EAF7EE] border-2 border-[#CDEED5] rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#138A36] text-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-[#111111]">
                  Store Setup & Listing Details
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#138A36] text-white px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Manage your shop name, 3D category, open hours, location & cover photos so local buyers find you easily.
              </p>
            </div>
          </div>

          <button
            onClick={onAddShop}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#138A36] hover:bg-[#0F752C] text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Open Shop Setup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Quick Actions ─────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </p>
          <span className="text-[11px] text-gray-400 font-medium">Store Shortcuts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="group relative flex items-center gap-3.5 p-4 bg-white border border-[#E5E7E5] hover:border-[#138A36] rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer overflow-hidden"
              >
                {/* Refined Icon Squircle */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: action.iconBg,
                    border: `1.5px solid ${action.iconBorder}`,
                    color: action.iconColor
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <p className="text-sm font-extrabold text-[#111111] group-hover:text-[#138A36] transition-colors truncate">
                      {action.title}
                    </p>
                    {action.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${action.badgeBg || 'bg-gray-100 text-gray-700'}`}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate leading-snug">
                    {action.subtitle}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-[#EAF7EE] flex items-center justify-center text-gray-400 group-hover:text-[#138A36] shrink-0 transition-colors">
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recent Activity ───────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Recent Enquiries
          </p>
          {recentEnquiries.length > 0 && (
            <button
              onClick={() => onNavigateMerchant('merchantEnquiries')}
              style={{
                fontSize: '11px', fontWeight: 700, color: '#138A36', background: 'none',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              See all <ChevronRight style={{ width: '12px', height: '12px' }} />
            </button>
          )}
        </div>

        {recentEnquiries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentEnquiries.map((enq, i) => {
              const status = enq.status || 'Pending';
              return (
                <div
                  key={enq.id || i}
                  onClick={() => onNavigateMerchant('merchantEnquiries')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fff', borderRadius: '16px',
                    border: '1.5px solid #EEEEEE', padding: '12px 14px',
                    cursor: 'pointer', transition: 'border-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#138A36'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#EEEEEE'}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '12px',
                    background: '#EAF7EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <MessageSquare style={{ width: '16px', height: '16px', color: '#138A36' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 800, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {enq.customerName || enq.productRequested || 'New Enquiry'}
                    </p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {enq.productRequested || enq.category || 'Product enquiry'} · {enq.submittedDate || 'Today'}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '8px',
                    color: statusColor[status] || '#888',
                    background: statusBg[status] || '#F5F5F5',
                    flexShrink: 0, whiteSpace: 'nowrap'
                  }}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5 text-center">
            <p className="text-xs font-bold text-gray-700 mb-0.5">No customer enquiries yet</p>
            <p className="text-[11px] text-gray-500">
              When shoppers in Nagpur enquire about size, availability, or prices, their requests will appear here.
            </p>
          </div>
        )}
      </div>

      {/* ── Performance Snapshot ─────────────────────────── */}
      {stats && (
        <div style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
            Performance
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #F8FAF8, #EAF7EE)',
            border: '1.5px solid #D1FAE5', borderRadius: '20px', padding: '16px 18px',
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'
          }}>
            {[
              { label: 'Response Rate', value: stats?.responseRate ?? '—', icon: '⚡' },
              { label: 'Store Visits', value: stats?.visits ?? 0, icon: '👀' },
              { label: 'Offers Sent', value: stats?.offersSent ?? 0, icon: '📤' },
              { label: 'Converted', value: stats?.completedEnquiries ?? 0, icon: '✅' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', align: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#111' }}>
                    {item.value}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#888', fontWeight: 600 }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(74,222,128,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(74,222,128,0.1); }
        }
      `}</style>
    </div>
  );
}
