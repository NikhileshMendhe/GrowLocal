import React from 'react';
import { User, MapPin, Bookmark, MessageSquare, ShoppingBag, Shield, Bell, HelpCircle, LogOut, Store } from 'lucide-react';

export default function CustomerProfile({ 
  onNavigate, 
  onOpenAuthModal, 
  onSwitchPlatform,
  savedCount,
  enquiriesCount,
  reservationsCount 
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow text-center space-y-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-[#138A36]/20 shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
            alt="Ananya Deshmukh" 
            className="w-full h-full object-cover" 
          />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-[#111111] font-poppins">Ananya Deshmukh</h2>
          <p className="text-xs text-[#666666] flex items-center justify-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#138A36]" />
            <span>Butibori, Nagpur, Maharashtra</span>
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-4 text-xs font-semibold">
          <span className="bg-[#EAF7EE] text-[#138A36] px-3 py-1 rounded-full">
            Local Shopper Level 2
          </span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate("saved")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] text-center hover:border-[#138A36] transition-all card-shadow-hover"
        >
          <Bookmark className="w-5 h-5 text-[#138A36] mx-auto mb-1" />
          <span className="block font-bold text-base text-[#111111]">{savedCount}</span>
          <span className="text-[11px] text-[#666666]">Saved Shops</span>
        </button>

        <button
          onClick={() => onNavigate("enquiries")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] text-center hover:border-[#138A36] transition-all card-shadow-hover"
        >
          <MessageSquare className="w-5 h-5 text-[#138A36] mx-auto mb-1" />
          <span className="block font-bold text-base text-[#111111]">{enquiriesCount}</span>
          <span className="text-[11px] text-[#666666]">Enquiries</span>
        </button>

        <button
          onClick={() => onNavigate("reservations")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] text-center hover:border-[#138A36] transition-all card-shadow-hover"
        >
          <ShoppingBag className="w-5 h-5 text-[#138A36] mx-auto mb-1" />
          <span className="block font-bold text-base text-[#111111]">{reservationsCount}</span>
          <span className="text-[11px] text-[#666666]">Reservations</span>
        </button>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-3xl border border-[#E5E7E5] overflow-hidden card-shadow divide-y divide-[#E5E7E5]">
        <button 
          onClick={() => onSwitchPlatform("merchant")}
          className="w-full p-4 flex items-center justify-between hover:bg-[#EAF7EE] text-[#138A36] font-bold text-xs transition-colors"
        >
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5" />
            <span>Switch to Merchant / Business Portal</span>
          </div>
          <span className="bg-[#138A36] text-white px-2 py-0.5 rounded text-[10px]">Merchant</span>
        </button>

        <button 
          onClick={() => onNavigate("saved")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold"
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-[#666666]" />
            <span>Saved Shops & Bookmarks</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate("enquiries")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#666666]" />
            <span>My Inquiries & Offers</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate("reservations")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#666666]" />
            <span>Store Visit Reservations</span>
          </div>
        </button>

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#666666]" />
            <span>Notification Preferences</span>
          </div>
        </button>

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#666666]" />
            <span>Privacy & Security</span>
          </div>
        </button>

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-[#666666]" />
            <span>Help & Support</span>
          </div>
        </button>

        <button 
          onClick={() => onOpenAuthModal("customer")}
          className="w-full p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
