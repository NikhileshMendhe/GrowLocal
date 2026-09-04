import React, { useState } from 'react';
import { Menu, Search, MapPin, Store, X, LayoutDashboard, Home, Bookmark, MessageSquare, User, Sparkles, Tag, Package, ChevronRight, Grid, LogOut } from 'lucide-react';

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
                onClick={() => onOpenAuthModal("customer")}
                className="bg-[#138A36] hover:bg-[#0B6B2B] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Sign In"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
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

              {/* Platform Selector Tabs */}
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

              {/* Location Selector Pill */}
              <button
                onClick={() => { onOpenLocationModal(); setDrawerOpen(false); }}
                className="w-full bg-[#EAF7EE] border border-[#DDF3E3] p-3 rounded-xl flex items-center justify-between text-xs font-bold text-[#138A36]"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{currentLocation.area} ({currentLocation.radius})</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

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

                      {onLogout && (
                        <button
                          onClick={() => {
                            setDrawerOpen(false);
                            onLogout();
                          }}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <button
                        onClick={() => { onOpenAuthModal("customer"); setDrawerOpen(false); }}
                        className="w-full bg-white hover:bg-gray-50 text-[#111111] border border-[#E5E7E5] font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#138A36]" />
                        <span>User Login</span>
                      </button>
                      <button
                        onClick={() => { onOpenAuthModal("merchant"); setDrawerOpen(false); }}
                        className="w-full bg-[#138A36] text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Store className="w-4 h-4" />
                        <span>Merchant Login</span>
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
    </>
  );
}
