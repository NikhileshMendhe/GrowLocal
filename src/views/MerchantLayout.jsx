import React, { useState } from 'react';
import {
  LayoutDashboard, Package, MessageSquare, Inbox, ShoppingBag,
  TrendingUp, Sparkles, Tag, Store, CreditCard, LogOut, Eye,
  Bell, ChevronDown, Menu, X, CheckCircle2, ShieldCheck, Plus, ArrowUpRight
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';

export default function MerchantLayout({
  activeTab,
  setActiveTab,
  onSwitchPlatform,
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

  const currentShop = shops?.find(s => s.merchantId === currentUser?.id) || shops?.[0] || {
    name: merchantProfile?.businessName || currentUser?.shopName || 'My Store',
    category: 'Local Retail',
    verified: true
  };

  const shopName = currentShop.name || merchantProfile?.businessName || currentUser?.shopName || 'My Store';
  const ownerName = merchantProfile?.ownerName || currentUser?.name || 'Store Manager';
  const userEmail = currentUser?.email || merchantProfile?.email || 'merchant@growlocal.in';
  const isVerified = merchantProfile?.verificationStatus === 'approved' || merchantProfile?.verified || currentShop.verified;

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
    { id: 'merchantCreators', label: 'Creators', icon: Sparkles },
    { id: 'merchantOffers', label: 'Offers', icon: Tag },
    { id: 'merchantShopProfile', label: 'Store Profile', icon: Store },
    { id: 'merchantSubscription', label: 'Plan & Billing', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col font-sans selection:bg-[#EAF7EE] selection:text-[#138A36]">
      {/* ── Top Dedicated Merchant Portal Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7E5] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-gray-700 hover:bg-gray-100 shrink-0"
              aria-label="Toggle Navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => setActiveTab('merchantDashboard')}
              className="flex items-center gap-2 cursor-pointer select-none min-w-0"
            >
              <img src="/growlocal-logo.png" alt="GrowLocal" className="h-7 sm:h-8 w-auto object-contain shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-[#111111] font-poppins">GrowLocal</span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#138A36] text-white px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs shrink-0">
                    <span className="inline sm:hidden">Hub</span>
                    <span className="hidden sm:inline">Merchant Portal</span>
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium leading-none hidden sm:block">Partner Store Control Center</span>
              </div>
            </div>
          </div>

          {/* Center: Live Realtime Status Pill (Desktop only) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#EAF7EE] border border-[#CDEED5] rounded-full shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-bold text-[#138A36]">Realtime Sync Active</span>
            <span className="text-gray-300">|</span>
            <span className="text-[11px] text-gray-600 font-medium">Nagpur</span>
          </div>

          {/* Right: Store Pill & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* View As Customer button */}
            <button
              onClick={() => onSwitchPlatform('customer')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors shrink-0"
              title="Preview Customer Marketplace"
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden md:inline">Customer View</span>
              <ArrowUpRight className="w-3 h-3 text-gray-400" />
            </button>

            {/* Store Information on Tablet/Desktop */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl shrink-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EAF7EE] flex items-center justify-center text-[#138A36] shrink-0 font-bold text-xs">
                🏪
              </div>
              <div className="text-left max-w-[110px] md:max-w-[150px] truncate">
                <p className="text-xs font-bold text-[#111111] truncate">{shopName}</p>
                <p className="text-[10px] text-gray-500 truncate">{userEmail || 'Active Store'}</p>
              </div>
              {isVerified && <VerifiedBadge text="Verified" />}
            </div>

            {/* Mobile Store Chip: Clean, compact store pill */}
            <div 
              onClick={() => setMobileNavOpen(true)}
              className="sm:hidden flex items-center gap-1.5 px-2 py-1 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl cursor-pointer"
              title={shopName}
            >
              <span className="text-xs">🏪</span>
              <span className="text-[11px] font-bold text-gray-800 max-w-[80px] truncate">{shopName}</span>
              {isVerified && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#138A36] shrink-0" />
              )}
            </div>

            {/* Add Shop quick trigger (All screens - prominently lookable) */}
            {onAddShop && (
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
            {/* Store Information Card in Drawer */}
            <div className="p-3.5 bg-gradient-to-br from-[#EAF7EE] to-[#DDF3E3] rounded-2xl border border-[#CDEED5]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-[#138A36] uppercase tracking-wider">Active Store</span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span className="text-[9px] font-bold bg-white text-[#138A36] px-1.5 py-0.5 rounded-md border border-[#CDEED5]">
                    LIVE
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-sm text-[#111111] truncate">{shopName}</p>
                {isVerified && <VerifiedBadge text="Verified" />}
              </div>
              <p className="text-[11px] text-gray-600 truncate">{userEmail || 'Nagpur, Maharashtra'}</p>
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onSwitchPlatform('customer');
                  setMobileNavOpen(false);
                }}
                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                <span>View Customer App</span>
              </button>

              {onAddShop && (
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
            
            {/* Store Information Card */}
            <div className="p-3.5 bg-gradient-to-br from-[#EAF7EE] to-[#DDF3E3] rounded-2xl border border-[#CDEED5]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-[#138A36] uppercase tracking-wider">Active Store</span>
                <span className="text-[9px] font-bold bg-white text-[#138A36] px-1.5 py-0.5 rounded-md border border-[#CDEED5]">
                  🟢 LIVE
                </span>
              </div>
              <p className="font-extrabold text-sm text-[#111111] truncate">{shopName}</p>
              <p className="text-[11px] text-gray-600 truncate">{currentShop.address || 'Nagpur, Maharashtra'}</p>
            </div>

            {/* High-visibility Add / Setup Shop button */}
            {onAddShop && (
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
                onClick={() => onSwitchPlatform('customer')}
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
    </div>
  );
}
