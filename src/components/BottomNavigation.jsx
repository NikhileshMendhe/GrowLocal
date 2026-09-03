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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7E5] px-2 py-2 shadow-lg flex items-center justify-around">
      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("home"); }}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
          activeTab === "home" ? "text-[#138A36]" : "text-[#666666]"
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("search"); }}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
          activeTab === "search" || activeTab === "searchResults" ? "text-[#138A36]" : "text-[#666666]"
        }`}
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>

      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("enquiries"); }}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors relative ${
          activeTab === "enquiries" ? "text-[#138A36]" : "text-[#666666]"
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span>Enquiries</span>
        {enquiriesCount > 0 && (
          <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-[#138A36] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {enquiriesCount}
          </span>
        )}
      </button>

      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("saved"); }}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors relative ${
          activeTab === "saved" ? "text-[#138A36]" : "text-[#666666]"
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span>Saved</span>
        {savedCount > 0 && (
          <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-[#138A36] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {savedCount}
          </span>
        )}
      </button>

      <button
        onClick={() => { setActivePlatform("customer"); setActiveTab("profile"); }}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
          activeTab === "profile" ? "text-[#138A36]" : "text-[#666666]"
        }`}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </button>

      <button
        onClick={() => onOpenMerchantMarketing ? onOpenMerchantMarketing() : null}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
          activePlatform === 'merchantMarketing' ? "text-[#138A36]" : "text-[#666666]"
        }`}
      >
        <Store className="w-5 h-5" />
        <span>For Biz</span>
      </button>
    </div>
  );
}
