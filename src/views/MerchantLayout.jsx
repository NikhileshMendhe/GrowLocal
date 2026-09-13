import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Package, MessageSquare, Inbox, ShoppingBag,
  TrendingUp, Sparkles, Tag, Store, CreditCard, LogOut, Eye,
  Bell, ChevronDown, Menu, X, CheckCircle2, ShieldCheck, Plus, ArrowUpRight,
  Volume2, VolumeX, ArrowRight
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import { orderNotificationService } from '../services/orderNotificationService';
import IncomingOrderAlertModal from '../components/IncomingOrderAlertModal';

export default function MerchantLayout({
  activeTab,
  setActiveTab,
  onSwitchPlatform,
  onRequestExitToCustomer,
  currentUser,
  merchantProfile,
  shops,
  products,
  enquiries,
  reservations,
  onAddShop,
  onLogout,
  children
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);
  const merchantDropdownRef = useRef(null);
  const [incomingOrderAlert, setIncomingOrderAlert] = useState(null);
  const [sirenActive, setSirenActive] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (merchantDropdownRef.current && !merchantDropdownRef.current.contains(event.target)) {
        setShowMerchantDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Listen for customer orders & enquiries
    const unsubscribe = orderNotificationService.subscribe((order) => {
      setIncomingOrderAlert(order);
      setSirenActive(true);
    });

    const unsubDismiss = orderNotificationService.onDismiss(() => {
      setIncomingOrderAlert(null);
      setSirenActive(false);
    });

    return () => {
      unsubscribe();
      unsubDismiss();
      orderNotificationService.stopRingtone();
    };
  }, []);

  const handleDismissOrderAlert = () => {
    orderNotificationService.stopRingtone();
    setSirenActive(false);
    setIncomingOrderAlert(null);
  };

  const handleViewOrder = () => {
    const isEnquiry = incomingOrderAlert?.isEnquiryOrder;
    handleDismissOrderAlert();
    if (isEnquiry) {
      setActiveTab('merchantEnquiries');
    } else {
      setActiveTab('merchantReservations');
    }
  };

  const handleTestSiren = (e) => {
    e.stopPropagation();
    orderNotificationService.initAudio();
    setAudioUnlocked(true);
    if (sirenActive || orderNotificationService.isRinging()) {
      orderNotificationService.stopRingtone();
      setSirenActive(false);
      setIncomingOrderAlert(null);
    } else {
      setSirenActive(true);
      orderNotificationService.notifyNewOrder({
        id: 'GL-' + Math.floor(10000 + Math.random() * 90000),
        productName: 'Sample Store Product (Test Order)',
        customerName: 'Priya Sharma',
        customerPhone: '+91 98221 54321',
        price: '₹1,299',
        totalAmount: 1299,
        shopName: shopName,
        fulfillmentType: 'pickup',
      });
    }
  };

  const handlePortalClick = () => {
    if (!audioUnlocked) {
      orderNotificationService.initAudio();
      setAudioUnlocked(true);
    }
  };

  const currentShop = shops?.find(s => 
    (currentUser?.id && (s.merchantId === currentUser.id || s.id === currentUser.id)) ||
    (currentUser?.email && s.merchantEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
    (currentUser?.shopId && s.id === currentUser.shopId)
  ) || null;

  const hasListedShop = Boolean(currentShop);

  const shopName = currentShop?.name || merchantProfile?.businessName || currentUser?.shopName || (currentUser?.name ? `${currentUser.name}'s Store` : 'My Store');
  const ownerName = merchantProfile?.ownerName || currentUser?.name || 'Store Manager';
  const userEmail = currentUser?.email || merchantProfile?.email || 'merchant@growlocal.in';
  const isVerified = merchantProfile?.verificationStatus === 'approved' || merchantProfile?.verified || Boolean(currentShop?.verified);

  const pendingEnquiriesCount = enquiries?.filter(e =>
    e.status === 'Pending' || e.status === 'pending' || e.status === 'Pending Quotes'
  ).length || 0;

  const navItems = [
    { id: 'merchantDashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'merchantProducts', label: 'Products', icon: Package, count: products?.length },
    { id: 'merchantChats', label: 'Live Chats', icon: MessageSquare },
    { id: 'merchantEnquiries', label: 'Enquiries', icon: Inbox, count: enquiries?.length, badge: pendingEnquiriesCount > 0 ? pendingEnquiriesCount : null, badgeColor: 'bg-amber-500 text-white' },
    { id: 'merchantReservations', label: 'Reservations', icon: ShoppingBag, count: reservations?.length },
    { id: 'merchantAnalytics', label: 'Analytics', icon: TrendingUp },
    { id: 'merchantOffers', label: 'Offers', icon: Tag },
    { id: 'merchantShopProfile', label: 'Your Shop', icon: Store, badge: (hasListedShop && (products?.length || 0) > 0) ? 'Live' : null, badgeColor: 'bg-[#138A36] text-white' },
  ];

  return (
    <div onClick={handlePortalClick} className="min-h-screen bg-[#F7F9F7] flex flex-col font-sans selection:bg-[#EAF7EE] selection:text-[#138A36]">
      {/* ── Top Dedicated Merchant Portal Header (Dark bar with distinct Merchant tag) ── */}
      <header className="sticky top-0 z-40 bg-[#111111] text-white border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand / Store Badge with Merchant tag */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#138A36] to-[#0B6B2B] flex items-center justify-center text-white font-black text-sm sm:text-base shadow-sm shrink-0">
                G
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-white leading-none tracking-tight truncate max-w-[150px] sm:max-w-[220px]">
                    {shopName}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full leading-none shrink-0">
                    Merchant
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium leading-none hidden sm:block mt-0.5">
                  Store Management Portal · Nagpur
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Realtime Status Pill & Order Siren Status (Desktop only) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400">Realtime Sync</span>
              <span className="text-white/20">|</span>
              <span className="text-[11px] text-gray-300 font-medium">Nagpur Grid</span>
            </div>

            {/* Siren Status & Test Button */}
            <button
              onClick={handleTestSiren}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                sirenActive
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/40 ring-2 ring-red-400'
                  : 'bg-white/10 hover:bg-white/15 text-gray-200 border border-white/10'
              }`}
              title="Order Dispatch Siren: Plays audio alarm whenever a customer clicks Buy Now. Click to test or toggle siren."
            >
              <Volume2 className={`w-3.5 h-3.5 ${sirenActive ? 'animate-bounce text-white' : 'text-emerald-400'}`} />
              <span className="hidden sm:inline">{sirenActive ? 'Siren RRRINGING (Mute)' : 'Order Siren Ready'}</span>
              <span className="sm:hidden">{sirenActive ? '🚨 Siren' : '🔊 Siren'}</span>
            </button>
          </div>

          {/* Right: Store Avatar Dropdown & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Add Shop quick trigger (hidden once shop is listed) */}
            {onAddShop && !hasListedShop && (
              <button
                onClick={onAddShop}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#138A36] hover:bg-[#0F752C] text-white text-xs font-black rounded-xl transition-all duration-200 shadow-xs hover:shadow-md shrink-0 cursor-pointer"
                title="Add or Setup Shop Listing"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Setup Shop</span>
                <span className="sm:hidden">+ Shop</span>
              </button>
            )}

            {/* MERCHANT AVATAR & DROPDOWN */}
            <div className="relative" ref={merchantDropdownRef}>
              <button
                onClick={() => setShowMerchantDropdown(prev => !prev)}
                className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer shadow-xs"
                title="Merchant Portal Menu"
                id="merchant-user-menu-btn"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#138A36] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  {(shopName || currentUser?.name || 'M')[0].toUpperCase()}
                </div>
                <div className="text-left max-w-[100px] sm:max-w-[130px] truncate hidden xs:block">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {shopName}
                  </p>
                  <span className="text-[10px] font-medium text-emerald-400 leading-none">
                    Merchant Mode
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${showMerchantDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Merchant Dropdown Menu */}
              {showMerchantDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-gray-800">
                  {/* Shop Info Header */}
                  <div className="p-2.5 pb-2 border-b border-gray-100 mb-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-black text-[#111111] truncate">
                        {shopName}
                      </p>
                      <span className="text-[9px] bg-emerald-100 text-[#138A36] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Merchant
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {userEmail}
                    </p>
                  </div>

                  {/* 1. Dashboard */}
                  <button
                    onClick={() => {
                      setShowMerchantDropdown(false);
                      setActiveTab('merchantDashboard');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#EAF7EE] transition-all flex items-center gap-2.5 group cursor-pointer text-xs font-bold ${
                      activeTab === 'merchantDashboard' ? 'bg-[#EAF7EE] text-[#138A36]' : 'text-[#111111]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#138A36]" />
                    <span>Dashboard</span>
                  </button>

                  {/* 2. Catalog */}
                  <button
                    onClick={() => {
                      setShowMerchantDropdown(false);
                      setActiveTab('merchantProducts');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#EAF7EE] transition-all flex items-center justify-between group cursor-pointer text-xs font-bold ${
                      activeTab === 'merchantProducts' ? 'bg-[#EAF7EE] text-[#138A36]' : 'text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-[#138A36]" />
                      <span>Catalog</span>
                    </div>
                    {products?.length !== undefined && (
                      <span className="text-[10px] font-semibold text-gray-400">
                        {products.length}
                      </span>
                    )}
                  </button>

                  {/* 3. Enquiry Inbox */}
                  <button
                    onClick={() => {
                      setShowMerchantDropdown(false);
                      setActiveTab('merchantEnquiries');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#EAF7EE] transition-all flex items-center justify-between group cursor-pointer text-xs font-bold ${
                      activeTab === 'merchantEnquiries' ? 'bg-[#EAF7EE] text-[#138A36]' : 'text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Inbox className="w-4 h-4 text-[#138A36]" />
                      <span>Enquiry Inbox</span>
                    </div>
                    {pendingEnquiriesCount > 0 && (
                      <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                        {pendingEnquiriesCount}
                      </span>
                    )}
                  </button>

                  {/* 4. Store Settings */}
                  <button
                    onClick={() => {
                      setShowMerchantDropdown(false);
                      setActiveTab('merchantShopProfile');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#EAF7EE] transition-all flex items-center gap-2.5 group cursor-pointer text-xs font-bold ${
                      activeTab === 'merchantShopProfile' ? 'bg-[#EAF7EE] text-[#138A36]' : 'text-[#111111]'
                    }`}
                  >
                    <Store className="w-4 h-4 text-[#138A36]" />
                    <span>Store Settings</span>
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  {/* 5. Log Out */}
                  <button
                    onClick={() => {
                      setShowMerchantDropdown(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-700 hover:text-[#111111] transition-all flex items-center gap-2.5 group cursor-pointer text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#111111] text-white p-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">

            {/* Quick Action in Mobile Drawer (Setup Shop if needed) */}
            {onAddShop && !hasListedShop && (
              <button
                onClick={() => {
                  onAddShop();
                  setMobileNavOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-[#138A36] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Setup Shop Listing</span>
              </button>
            )}

            {/* Navigation Grid */}
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Portal Navigation</p>
              <div className="grid grid-cols-2 gap-1.5 max-h-[50vh] overflow-y-auto py-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id === 'merchantDashboard' && activeTab === 'home');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors text-left ${
                        isActive
                          ? 'bg-[#138A36] text-white shadow-xs'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      ) : item.count !== undefined ? (
                        <span className={`text-[10px] font-semibold px-1 py-0.5 rounded ${
                          isActive ? 'bg-white/20 text-white' : 'text-gray-400'
                        }`}>
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sign Out Button in Drawer */}
            {onLogout && (
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-100"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Merchant Portal</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── Main Portal Body (Sidebar + Content) ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 flex-1">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs sticky top-24 space-y-4">
            

            {/* High-visibility Add / Setup Shop button (hidden if shop is already listed) */}
            {onAddShop && !hasListedShop && (
              <button
                onClick={onAddShop}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[#138A36] to-[#1aad44] hover:from-[#0F752C] hover:to-[#138A36] text-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white leading-tight">+ Setup / Add Shop</p>
                    <p className="text-[10px] text-white/80 leading-tight">Details, 3D category & timing</p>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/90 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Quick Link to Your Shop when shop is listed */}
            {hasListedShop && (
              <button
                onClick={() => setActiveTab('merchantShopProfile')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer group ${
                  activeTab === 'merchantShopProfile'
                    ? 'bg-gradient-to-r from-[#138A36] to-[#0F752C] text-white shadow-sm'
                    : 'bg-gradient-to-r from-[#EAF7EE] to-[#DCF5E3] hover:from-[#DCF5E3] hover:to-[#CEEED6] border border-[#CDEED5] text-[#138A36]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    activeTab === 'merchantShopProfile' ? 'bg-white/20 text-white' : 'bg-[#138A36] text-white'
                  }`}>
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-xs font-black leading-tight truncate ${
                      activeTab === 'merchantShopProfile' ? 'text-white' : 'text-[#111111]'
                    }`}>Your Shop</p>
                    <p className={`text-[10px] font-bold leading-tight ${
                      activeTab === 'merchantShopProfile' ? 'text-white/80' : 'text-[#138A36]'
                    }`}>View & Manage Storefront</p>
                  </div>
                </div>
                <ArrowUpRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform ${
                  activeTab === 'merchantShopProfile' ? 'text-white' : 'text-[#138A36]'
                }`} />
              </button>
            )}

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'merchantDashboard' && activeTab === 'home');
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#138A36] text-white shadow-sm translate-x-0.5'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.badge && (
                        <span className="text-[10px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && !item.badge && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Bottom Quick Tools */}
            {onLogout && (
              <div className="pt-3 border-t border-[#E5E7E5]">
                <button
                  onClick={onLogout}
                  className="w-full py-2.5 px-3 text-gray-600 hover:text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Merchant Portal</span>
                </button>
              </div>
            )}

          </div>
        </aside>

        {/* Dynamic Merchant Tab Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Merchant Footer */}
      <footer className="border-t border-[#E5E7E5] bg-white py-4 px-6 text-center text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 GrowLocal Merchant Hub · Realtime Store Control System</p>
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Connected to Nagpur Local Commerce Grid</span>
          </div>
        </div>
      </footer>

      {/* Realtime Incoming Order Alert Modal with Smooth Lovely Ringtone */}
      {incomingOrderAlert && (
        <IncomingOrderAlertModal
          order={incomingOrderAlert}
          onDismiss={handleDismissOrderAlert}
          onAccept={handleViewOrder}
          targetPortal="merchant"
        />
      )}
    </div>
  );
}
