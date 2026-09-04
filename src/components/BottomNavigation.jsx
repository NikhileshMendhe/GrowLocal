import React from 'react';
import { Home, Search, MessageSquare, Bookmark, User, Store } from 'lucide-react';

export default function BottomNavigation({ 
  activeTab, 
  setActiveTab, 
  activePlatform,
  setActivePlatform,
  savedCount = 0,
  enquiriesCount = 0,
  onOpenMerchantMarketing
}) {
  if (activePlatform === "merchant") {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7E5] px-2 py-2 shadow-lg flex items-center justify-around">
        <button
          onClick={() => setActiveTab("merchantDashboard")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === "merchantDashboard" ? "text-[#138A36]" : "text-[#666666]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("merchantProducts")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === "merchantProducts" ? "text-[#138A36]" : "text-[#666666]"
          }`}
        >
          <Store className="w-5 h-5" />
          <span>Products</span>
        </button>
        <button
          onClick={() => setActiveTab("merchantChats")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === "merchantChats" ? "text-[#138A36]" : "text-[#666666]"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chats</span>
        </button>
        <button
          onClick={() => setActivePlatform("customer")}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#111111] bg-gray-100 px-2 py-1 rounded-lg"
        >
          <User className="w-5 h-5" />
          <span>Customer View</span>
        </button>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E5E7E5] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-6px_25px_rgba(0,0,0,0.07)] flex items-center justify-around">
      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("home"); }}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-90 ${
          activeTab === "home" 
            ? "text-[#138A36] bg-[#EAF7EE] font-black scale-105" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <Home className={`w-5 h-5 transition-transform ${activeTab === "home" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("search"); }}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-90 ${
          activeTab === "search" || activeTab === "searchResults" 
            ? "text-[#138A36] bg-[#EAF7EE] font-black scale-105" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <Search className={`w-5 h-5 transition-transform ${activeTab === "search" || activeTab === "searchResults" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className="text-[10px] tracking-tight">Search</span>
      </button>

      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("enquiries"); }}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-90 relative ${
          activeTab === "enquiries" 
            ? "text-[#138A36] bg-[#EAF7EE] font-black scale-105" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <div className="relative">
          <MessageSquare className={`w-5 h-5 transition-transform ${activeTab === "enquiries" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          {enquiriesCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] bg-[#138A36] text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shadow-xs">
              {enquiriesCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Enquiries</span>
      </button>

      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("saved"); }}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-90 relative ${
          activeTab === "saved" 
            ? "text-[#138A36] bg-[#EAF7EE] font-black scale-105" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <div className="relative">
          <Bookmark className={`w-5 h-5 transition-transform ${activeTab === "saved" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] bg-[#138A36] text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shadow-xs">
              {savedCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Saved</span>
      </button>

      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("profile"); }}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-90 ${
          activeTab === "profile" 
            ? "text-[#138A36] bg-[#EAF7EE] font-black scale-105" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <User className={`w-5 h-5 transition-transform ${activeTab === "profile" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className="text-[10px] tracking-tight">Profile</span>
      </button>

      <button
        onClick={() => onOpenMerchantMarketing ? onOpenMerchantMarketing() : null}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all cursor-pointer active:scale-90 ${
          activePlatform === 'merchantMarketing' 
            ? "text-[#138A36] bg-[#EAF7EE] font-black scale-105" 
            : "text-[#666666] hover:text-[#111111] font-semibold"
        }`}
      >
        <Store className={`w-5 h-5 transition-transform ${activePlatform === 'merchantMarketing' ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className="text-[10px] tracking-tight">For Biz</span>
      </button>
    </div>
  );
}
