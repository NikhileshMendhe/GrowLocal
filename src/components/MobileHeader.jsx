import React, { useState } from 'react';
import { Menu, Search, MapPin, Store, X, LayoutDashboard, Home, Bookmark, MessageSquare, User, Sparkles, Tag, Package, ChevronRight, Grid, LogOut, ShoppingBag } from 'lucide-react';

export default function MobileHeader({ 
  currentLocation, 
  onOpenLocationModal, 
  onOpenSearch, 
  onOpenAuthModal,
  activePlatform,
  setActivePlatform,
  activeTab,
  setActiveTab,
  onOpenDemandModal,
  onNavigatePath,
  onOpenMerchantMarketing,
  currentUser,
  onLogout
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showDualAuthSheet, setShowDualAuthSheet] = useState(false);

  const handleNav = (path, platform, tab, adminTab) => {
    if (onNavigatePath) {
      onNavigatePath(path, platform, tab, adminTab);
    } else {
      if (typeof window !== 'undefined') window.history.pushState({}, '', path);
      if (platform) setActivePlatform(platform);
      if (tab) setActiveTab(tab);
    }
  };

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E5E7E5] px-3.5 py-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 text-[#111111] hover:bg-gray-100 rounded-xl"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => { setActivePlatform("customer"); setActiveTab("home"); }}
            >
              <img src="/growlocal-logo.png" alt="GrowLocal Logo" className="h-8 w-auto object-contain" />
              <span className="text-base font-black tracking-tight text-[#111111] font-poppins">GrowLocal</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Location Chip */}
            <button
              onClick={onOpenLocationModal}
              className="bg-[#EAF7EE] text-[#138A36] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#DDF3E3]"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[70px]">{currentLocation.city}</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="p-1.5 text-[#111111] hover:bg-gray-100 rounded-xl"
            >
              <Search className="w-5 h-5" />
            </button>

            {currentUser ? (
              <button
                onClick={() => { setActivePlatform("customer"); setActiveTab("profile"); }}
                className="w-7 h-7 rounded-full bg-[#138A36] text-white flex items-center justify-center font-black text-xs shadow-xs"
                title="View Profile"
              >
                {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => setShowDualAuthSheet(true)}
                className="bg-[#138A36] hover:bg-[#0B6B2B] text-white px-3 py-1 rounded-xl text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Get Started"
              >
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Side Drawer Menu */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="p-4 space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7E5]">
                <div className="flex items-center gap-2">
                  <img src="/growlocal-logo.png" alt="GrowLocal Logo" className="h-9 w-auto object-contain" />
                  <div>
                    <h3 className="font-extrabold text-base text-[#111111] font-poppins">GrowLocal</h3>
                    <p className="text-[10px] text-[#666666]">Buy Local. Grow Local.</p>
                  </div>
                </div>

                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-[#666666] hover:text-[#111111] rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Platform Selector Tabs (Logged-out visitors only) */}
              {!currentUser && (
                <>
                  <div className="bg-[#F7F8F7] p-1 rounded-xl border border-[#E5E7E5] space-y-1">
                    <p className="text-[10px] font-extrabold text-[#666666] uppercase px-2 pt-1">Select Experience</p>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => { setActivePlatform("customer"); setActiveTab("home"); setDrawerOpen(false); }}
                        className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
                          activePlatform === "customer" ? "bg-[#138A36] text-white shadow-xs" : "text-[#666666]"
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Customer</span>
                      </button>

                      <button
                        onClick={() => { 
                          if (onOpenMerchantMarketing) onOpenMerchantMarketing();
                          else if (typeof window !== 'undefined') window.history.pushState({}, '', '/for-merchants');
                          setDrawerOpen(false); 
                        }}
                        className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
                          activePlatform === "merchantMarketing" ? "bg-[#138A36] text-white shadow-xs" : "text-[#666666]"
                        }`}
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>For Merchants</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <button
                    onClick={() => { 
                      if (onOpenMerchantMarketing) onOpenMerchantMarketing(); 
                      else onOpenAuthModal("merchant"); 
                      setDrawerOpen(false); 
                    }}
                    className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <Store className="w-4 h-4" />
                    <span>Why Sell on GrowLocal? →</span>
                  </button>
                </>
              )}

              {/* Customer Links */}
              {activePlatform === "customer" && (
                <div className="space-y-1 text-xs font-semibold text-[#111111] pt-2">
                  <p className="text-[10px] font-extrabold text-[#666666] uppercase px-2 mb-1">Navigation</p>
                  <button
                    onClick={() => { setActiveTab("home"); setDrawerOpen(false); }}
                    className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left font-bold"
                  >
                    <Home className="w-4 h-4 text-[#138A36]" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => { 
                      if (typeof window !== 'undefined') window.history.pushState({}, '', '/discover');
                      setActiveTab("search"); 
                      setDrawerOpen(false); 
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left"
                  >
                    <Search className="w-4 h-4 text-[#138A36]" />
                    <span>Discover</span>
                  </button>
                  <button
                    onClick={() => { 
                      if (typeof window !== 'undefined') window.history.pushState({}, '', '/categories');
                      setActiveTab("categories"); 
                      setDrawerOpen(false); 
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left"
                  >
                    <Grid className="w-4 h-4 text-[#138A36]" />
                    <span>Categories</span>
                  </button>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      if (typeof window !== 'undefined') {
                        const el = document.getElementById('how-it-works-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        else setActiveTab("home");
                      }
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left"
                  >
                    <Sparkles className="w-4 h-4 text-[#138A36]" />
                    <span>How It Works</span>
                  </button>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      if (typeof window !== 'undefined') {
                        const el = document.getElementById('community-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        else setActiveTab("home");
                      }
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left"
                  >
                    <Store className="w-4 h-4 text-[#138A36]" />
                    <span>Community</span>
                  </button>

                  {currentUser ? (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="p-3 bg-gradient-to-br from-[#EAF7EE] to-[#DDF3E3] rounded-2xl border border-[#CDEED5] flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#138A36] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs text-[#111111] truncate">{currentUser.name || currentUser.email}</p>
                            <p className="text-[10px] text-[#138A36] font-semibold">{currentUser.role === 'merchant' ? 'Merchant Account' : 'Customer Account'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActivePlatform('customer');
                            setActiveTab('profile');
                            setDrawerOpen(false);
                          }}
                          className="text-xs font-black text-[#138A36] hover:underline shrink-0 bg-white px-2.5 py-1 rounded-lg border border-[#CDEED5]"
                        >
                          Profile
                        </button>
                      </div>

                      {/* Customer Navigation Links */}
                      <div className="space-y-1 py-1">
                        <button
                          onClick={() => {
                            setActivePlatform('customer');
                            setActiveTab('enquiries');
                            setDrawerOpen(false);
                          }}
                          className="w-full p-2.5 rounded-xl hover:bg-[#EAF7EE] text-gray-800 hover:text-[#138A36] flex items-center gap-3 text-xs font-bold transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-[#138A36]" />
                          <span>My Enquiries</span>
                        </button>

                        <button
                          onClick={() => {
                            setActivePlatform('customer');
                            setActiveTab('reservations');
                            setDrawerOpen(false);
                          }}
                          className="w-full p-2.5 rounded-xl hover:bg-[#EAF7EE] text-gray-800 hover:text-[#138A36] flex items-center gap-3 text-xs font-bold transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-[#138A36]" />
                          <span>My Reservations</span>
                        </button>

                        <button
                          onClick={() => {
                            setActivePlatform('customer');
                            setActiveTab('profile');
                            setDrawerOpen(false);
                          }}
                          className="w-full p-2.5 rounded-xl hover:bg-[#EAF7EE] text-gray-800 hover:text-[#138A36] flex items-center gap-3 text-xs font-bold transition-colors"
                        >
                          <User className="w-4 h-4 text-[#138A36]" />
                          <span>Account Settings</span>
                        </button>
                      </div>

                      {onLogout && (
                        <button
                          onClick={() => {
                            setDrawerOpen(false);
                            onLogout();
                          }}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-gray-500" />
                          <span>Log Out</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#777777] px-1">
                        Get Started
                      </p>
                      <button
                        onClick={() => { onOpenAuthModal("customer"); setDrawerOpen(false); }}
                        className="w-full text-left p-3 rounded-2xl bg-[#EAF7EE] border border-[#DDF3E3] flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#138A36] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <ShoppingBag className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#111111] flex items-center gap-1">
                            <span>I'm shopping</span>
                            <span className="text-[#138A36]">→</span>
                          </p>
                          <p className="text-[10px] text-[#666666] leading-tight mt-0.5">
                            Reserve stock & pay in-store
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => { onOpenAuthModal("merchant"); setDrawerOpen(false); }}
                        className="w-full text-left p-3 rounded-2xl bg-[#111111] text-white flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/10 text-yellow-300 flex items-center justify-center shrink-0 border border-white/10">
                          <Store className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white flex items-center gap-1">
                            <span>I own a shop</span>
                            <span className="text-[9px] bg-yellow-400 text-black font-extrabold px-1.5 py-0.2 rounded">0% Comm</span>
                          </p>
                          <p className="text-[10px] text-gray-300 leading-tight mt-0.5">
                            List free & get local leads
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Merchant Links */}
              {activePlatform === "merchant" && (
                <div className="space-y-1 text-xs font-semibold text-[#111111] pt-2">
                  <p className="text-[10px] font-extrabold text-[#666666] uppercase px-2 mb-1">Merchant Portal</p>
                  <button onClick={() => { setActiveTab("merchantDashboard"); setDrawerOpen(false); }} className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left">
                    <LayoutDashboard className="w-4 h-4 text-[#138A36]" />
                    <span>Dashboard</span>
                  </button>
                  <button onClick={() => { setActiveTab("merchantProducts"); setDrawerOpen(false); }} className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left">
                    <Package className="w-4 h-4 text-[#138A36]" />
                    <span>Products Inventory</span>
                  </button>
                  <button onClick={() => { setActiveTab("merchantChats"); setDrawerOpen(false); }} className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left">
                    <MessageSquare className="w-4 h-4 text-[#138A36]" />
                    <span>Live Customer Chats</span>
                  </button>
                  <button onClick={() => { setActiveTab("merchantCreators"); setDrawerOpen(false); }} className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left">
                    <Sparkles className="w-4 h-4 text-[#138A36]" />
                    <span>Creator Campaigns</span>
                  </button>
                  <button onClick={() => { setActiveTab("merchantSubscription"); setDrawerOpen(false); }} className="w-full p-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-left">
                    <Tag className="w-4 h-4 text-[#138A36]" />
                    <span>Membership Plans</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E5E7E5] bg-[#F7F8F7]">
              <button
                onClick={() => { setActivePlatform("landing"); setActiveTab("home"); setDrawerOpen(false); }}
                className="w-full text-center text-xs font-bold text-[#666666] hover:text-[#111111]"
              >
                GrowLocal Platform Overview →
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setDrawerOpen(false)}></div>
        </div>
      )}

      {/* Mobile Dual-Identity "Get Started" Bottom Sheet Modal */}
      {showDualAuthSheet && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-t-3xl p-5 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-poppins font-black text-base text-[#111111]">Get Started on GrowLocal</h3>
                <p className="text-xs text-[#666666]">Choose your experience to begin</p>
              </div>
              <button
                onClick={() => setShowDualAuthSheet(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dual Cards */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowDualAuthSheet(false);
                  onOpenAuthModal('customer');
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-[#EAF7EE] border border-[#DDF3E3] flex items-center gap-3.5 active:scale-98 transition-transform cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#138A36] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-[#111111]">I'm shopping</p>
                    <span className="text-xs font-bold text-[#138A36]">Continue →</span>
                  </div>
                  <p className="text-xs text-[#555555] leading-snug mt-0.5">
                    Search real store stock, reserve items & pay on pickup in Nagpur.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowDualAuthSheet(false);
                  onOpenAuthModal('merchant');
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-[#111111] text-white flex items-center gap-3.5 active:scale-98 transition-transform cursor-pointer shadow-lg"
              >
                <div className="w-11 h-11 rounded-2xl bg-white/10 text-yellow-300 flex items-center justify-center shrink-0 border border-white/10">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>I own a shop</span>
                      <span className="text-[9px] bg-yellow-400 text-[#111111] font-black px-1.5 py-0.5 rounded-full">
                        0% Commission
                      </span>
                    </p>
                    <span className="text-xs font-bold text-yellow-300">Join Free →</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-snug mt-0.5">
                    List products free, get local demand leads & bring shoppers to your counter.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
