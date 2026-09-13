import React from 'react';
import { Home, Compass, MessageSquare, User, Store, LayoutDashboard, Package, Inbox } from 'lucide-react';

export default function BottomNavigation({ 
  activeTab, 
  setActiveTab, 
  activePlatform, 
  setActivePlatform, 
  savedCount = 0, 
  enquiriesCount = 0, 
  onOpenMerchantMarketing, 
  currentUser, 
  onOpenAuthModal 
}) {
  if (activePlatform === "merchant") {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111] text-white border-t border-white/10 px-2 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab("merchantDashboard")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold min-w-[50px] min-h-[44px] justify-center transition-colors cursor-pointer ${
            activeTab === "merchantDashboard" || activeTab === "home" ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab("merchantProducts")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold min-w-[50px] min-h-[44px] justify-center transition-colors cursor-pointer ${
            activeTab === "merchantProducts" ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab("merchantEnquiries")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold min-w-[50px] min-h-[44px] justify-center transition-colors cursor-pointer ${
            activeTab === "merchantEnquiries" ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <Inbox className="w-5 h-5" />
          <span>Enquiries</span>
        </button>

        <button
          onClick={() => setActiveTab("merchantShopProfile")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold min-w-[50px] min-h-[44px] justify-center transition-colors cursor-pointer ${
            activeTab === "merchantShopProfile" ? "text-emerald-400 font-bold" : "text-gray-400 hover:text-white"
          }`}
        >
          <Store className="w-5 h-5" />
          <span>Store</span>
        </button>
      </div>
    );
  }

  const handleAccountClick = () => {
    setActivePlatform("customer");
    if (currentUser) {
      setActiveTab("profile");
    } else {
      if (onOpenAuthModal) onOpenAuthModal("customer");
      else setActiveTab("profile");
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E5E7E5] px-3 pt-1.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-6px_25px_rgba(0,0,0,0.07)] flex items-center justify-between"
    >
      {/* 1. HOME */}
      <button
        id="bottom-nav-home"
        onClick={() => { setActivePlatform("customer"); setActiveTab("home"); }}
        className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeTab === "home" 
            ? "text-[#138A36] font-black" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === "home" ? "bg-[#EAF7EE]" : ""}`}>
          <Home className={`w-5 h-5 ${activeTab === "home" ? "stroke-[2.5] text-[#138A36]" : "stroke-[1.8]"}`} />
        </div>
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      {/* 2. DISCOVER */}
      <button
        id="bottom-nav-discover"
        onClick={() => { setActivePlatform("customer"); setActiveTab("search"); }}
        className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeTab === "search" || activeTab === "searchResults" || activeTab === "categories"
            ? "text-[#138A36] font-black" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === "search" || activeTab === "searchResults" || activeTab === "categories" ? "bg-[#EAF7EE]" : ""}`}>
          <Compass className={`w-5 h-5 ${activeTab === "search" || activeTab === "searchResults" || activeTab === "categories" ? "stroke-[2.5] text-[#138A36]" : "stroke-[1.8]"}`} />
        </div>
        <span className="text-[10px] tracking-tight">Discover</span>
      </button>

      {/* 3. ENQUIRIES */}
      <button
        id="bottom-nav-enquiries"
        onClick={() => { setActivePlatform("customer"); setActiveTab("enquiries"); }}
        className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 relative ${
          activeTab === "enquiries" 
            ? "text-[#138A36] font-black" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors relative ${activeTab === "enquiries" ? "bg-[#EAF7EE]" : ""}`}>
          <MessageSquare className={`w-5 h-5 ${activeTab === "enquiries" ? "stroke-[2.5] text-[#138A36]" : "stroke-[1.8]"}`} />
          {enquiriesCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] bg-[#138A36] text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shadow-xs border border-white">
              {enquiriesCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Enquiries</span>
      </button>

      {/* 4. ACCOUNT */}
      <button
        id="bottom-nav-account"
        onClick={handleAccountClick}
        className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
          activeTab === "profile" 
            ? "text-[#138A36] font-black" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === "profile" ? "bg-[#EAF7EE]" : ""}`}>
          {currentUser ? (
            <div className="w-5 h-5 rounded-full bg-[#138A36] text-white text-[10px] font-black flex items-center justify-center">
              {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
            </div>
          ) : (
            <User className={`w-5 h-5 ${activeTab === "profile" ? "stroke-[2.5] text-[#138A36]" : "stroke-[1.8]"}`} />
          )}
        </div>
        <span className="text-[10px] tracking-tight">
          {currentUser ? 'Account' : 'Sign In'}
        </span>
      </button>
    </nav>
  );
}
