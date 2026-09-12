import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, MessageSquare, Inbox, ShoppingBag,
  TrendingUp, Sparkles, Tag, Store, CreditCard, LogOut, Eye,
  Bell, ChevronDown, Menu, X, CheckCircle2, ShieldCheck, Plus, ArrowUpRight,
  Volume2, VolumeX, ArrowRight
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import { orderNotificationService } from '../services/orderNotificationService';

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
  const [incomingOrderAlert, setIncomingOrderAlert] = useState(null);
  const [sirenActive, setSirenActive] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    // Listen for customer "Buy Now" orders
    const unsubscribe = orderNotificationService.subscribe((order) => {
      setIncomingOrderAlert(order);
      setSirenActive(true);
      orderNotificationService.playSiren(10);
    });

    return () => {
      unsubscribe();
      orderNotificationService.stopSiren();
    };
  }, []);

  const handleDismissOrderAlert = () => {
    orderNotificationService.stopSiren();
    setSirenActive(false);
    setIncomingOrderAlert(null);
  };

  const handleViewOrder = () => {
    handleDismissOrderAlert();
    setActiveTab('merchantReservations');
  };

  const handleTestSiren = (e) => {
    e.stopPropagation();
    orderNotificationService.initAudio();
    setAudioUnlocked(true);
    if (sirenActive) {
      orderNotificationService.stopSiren();
      setSirenActive(false);
    } else {
      setSirenActive(true);
      orderNotificationService.playSiren(3);
      setTimeout(() => setSirenActive(false), 3000);
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
      {/* ── Top Dedicated Merchant Portal Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7E5] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand / Store Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#138A36] to-[#0B6B2B] flex items-center justify-center text-white font-black text-sm sm:text-base shadow-sm shrink-0">
                G
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base text-[#111111] leading-none tracking-tight">GrowLocal</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#138A36] px-1.5 py-0.5 rounded-md leading-none">
                    <span className="hidden sm:inline">Merchant Portal</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium leading-none hidden sm:block">Partner Store Control Center</span>
              </div>
            </div>
          </div>

          {/* Center: Live Realtime Status Pill & Order Siren Status (Desktop only) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#EAF7EE] border border-[#CDEED5] rounded-full shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-bold text-[#138A36]">Realtime Sync</span>
              <span className="text-gray-300">|</span>
              <span className="text-[11px] text-gray-600 font-medium">Nagpur</span>
            </div>

            {/* Siren Status & Test Button */}
            <button
              onClick={handleTestSiren}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                sirenActive
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/40 ring-2 ring-red-400'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-[#138A36] border border-emerald-200'
              }`}
              title="Order Dispatch Siren: Plays audio alarm whenever a customer clicks Buy Now. Click to test or toggle siren."
            >
              <Volume2 className={`w-3.5 h-3.5 ${sirenActive ? 'animate-bounce text-white' : 'text-[#138A36]'}`} />
              <span className="hidden sm:inline">{sirenActive ? 'Siren RRRINGING (Mute)' : 'Order Siren Ready'}</span>
              <span className="sm:hidden">{sirenActive ? '🚨 Siren' : '🔊 Siren'}</span>
            </button>
          </div>

          {/* Right: Store Pill & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* View As Customer button (intercepted with logout confirm) */}
            <button
              onClick={() => onRequestExitToCustomer ? onRequestExitToCustomer() : onSwitchPlatform('customer')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shrink-0"
              title="Return to Customer Marketplace"
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden md:inline">Customer View</span>
              <ArrowUpRight className="w-3 h-3 text-gray-400" />
            </button>


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

            {/* Sign Out */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                title="Sign Out of Merchant Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-[#E5E7E5] bg-white p-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">

            {/* Quick Actions in Mobile Drawer */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  if (onRequestExitToCustomer) onRequestExitToCustomer();
                  else onSwitchPlatform('customer');
                }}
                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                <span>Customer View</span>
              </button>

              {onAddShop && !hasListedShop && (
                <button
                  onClick={() => {
                    onAddShop();
                    setMobileNavOpen(false);
                  }}
                  className="py-2 px-3 bg-[#EAF7EE] text-[#138A36] text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors border border-[#CDEED5]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Setup Shop</span>
                </button>
              )}
            </div>

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
            <div className="pt-3 border-t border-[#E5E7E5] space-y-2">
              <button
                onClick={() => onRequestExitToCustomer ? onRequestExitToCustomer() : onSwitchPlatform('customer')}
                className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                  <span>Customer View</span>
                </div>
                <ArrowUpRight className="w-3 h-3 text-gray-400" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full py-2 px-3 text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

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

      {/* =========================================================================
          HIGH-URGENCY SIREN ORDER ALERT MODAL
      ========================================================================= */}
      {incomingOrderAlert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-4 border-red-500 animate-in zoom-in-95 duration-200 relative">
            {/* Emergency Red Flasher Top Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white p-5 text-center relative overflow-hidden">
              <div className="w-14 h-14 mx-auto bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-2 animate-bounce shadow-lg">
                🚨
              </div>
              <div className="inline-block bg-white text-red-600 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm mb-1">
                Incoming Customer Order!
              </div>
              <h2 className="text-xl font-black tracking-tight">NEW ORDER RECEIVED!</h2>
              <p className="text-xs text-red-100 font-semibold mt-0.5">
                A customer just clicked "Buy Now" on GrowLocal
              </p>
            </div>

            {/* Order Info Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800">Item Ordered:</span>
                  <span className="text-xs font-mono font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded">
                    {incomingOrderAlert.id || 'GL-ORDER'}
                  </span>
                </div>

                <p className="font-black text-base text-gray-900 leading-snug">
                  {incomingOrderAlert.productName || 'Store Item'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-red-200/60">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Customer:</span>
                    <span className="font-bold text-gray-800">{incomingOrderAlert.customerName || 'Local Customer'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Amount:</span>
                    <span className="font-black text-[#138A36] text-sm">{incomingOrderAlert.price || `₹${incomingOrderAlert.totalAmount || 0}`}</span>
                  </div>
                </div>

                {incomingOrderAlert.fulfillmentType && (
                  <div className="text-xs font-semibold text-gray-700 pt-1">
                    <span>Fulfillment: </span>
                    <span className="font-bold uppercase text-red-700">
                      {incomingOrderAlert.fulfillmentType === 'delivery' ? '🚚 Home Delivery' : '🏪 In-Store Pickup'}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleViewOrder}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#138A36] to-[#0E6828] hover:from-[#0B6B2B] hover:to-[#095020] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#138A36]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                >
                  <span>Accept & View in Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDismissOrderAlert}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <VolumeX className="w-4 h-4 text-gray-500" />
                  <span>Mute Siren & Dismiss</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
