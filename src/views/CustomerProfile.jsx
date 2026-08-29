import React from 'react';
import { User, MapPin, Bookmark, MessageSquare, ShoppingBag, Shield, Bell, HelpCircle, LogOut, Store, LogIn, Mail, CheckCircle } from 'lucide-react';

export default function CustomerProfile({ 
  onNavigate, 
  onOpenAuthModal, 
  onSwitchPlatform,
  savedCount,
  enquiriesCount,
  reservationsCount,
  currentUser,
  onLogOut
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header Profile Card */}
      {currentUser ? (
        <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-[#EAF7EE] text-[#138A36] text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#DDF3E3]">
            <CheckCircle className="w-3 h-3" />
            <span>Logged In</span>
          </div>

          <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto border-4 border-[#138A36]/20 shadow-md bg-[#138A36] text-white flex items-center justify-center font-bold text-2xl">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#111111] font-poppins">
              {currentUser.name || currentUser.email.split('@')[0]}
            </h2>
            <p className="text-xs text-[#666666] flex items-center justify-center gap-1 mt-1 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#138A36]" />
              <span>{currentUser.email || currentUser.phone || 'nagpur.user@growlocal.in'}</span>
            </p>
            <p className="text-[11px] text-[#666666] flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#138A36]" />
              <span>Butibori, Nagpur, Maharashtra</span>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold">
            <span className="bg-[#EAF7EE] text-[#138A36] px-3 py-1 rounded-full border border-[#DDF3E3]">
              Verified {currentUser.role?.toUpperCase() || 'CUSTOMER'} Account
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#138A36] to-[#0B6B2B] rounded-3xl p-6 text-white text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white backdrop-blur-xs">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold font-poppins">Log In to GrowLocal</h2>
            <p className="text-xs text-white/80 mt-1 max-w-md mx-auto">
              Sign in with your email address to save nearby shops, track your enquiries, and manage store reservations in Nagpur.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal("customer")}
              className="bg-white hover:bg-gray-100 text-[#138A36] font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account with Email</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate("saved")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] text-center hover:border-[#138A36] transition-all card-shadow-hover cursor-pointer"
        >
          <Bookmark className="w-5 h-5 text-[#138A36] mx-auto mb-1" />
          <span className="block font-bold text-base text-[#111111]">{savedCount}</span>
          <span className="text-[11px] text-[#666666]">Saved Shops</span>
        </button>

        <button
          onClick={() => onNavigate("enquiries")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] text-center hover:border-[#138A36] transition-all card-shadow-hover cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 text-[#138A36] mx-auto mb-1" />
          <span className="block font-bold text-base text-[#111111]">{enquiriesCount}</span>
          <span className="text-[11px] text-[#666666]">Enquiries</span>
        </button>

        <button
          onClick={() => onNavigate("reservations")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] text-center hover:border-[#138A36] transition-all card-shadow-hover cursor-pointer"
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
          className="w-full p-4 flex items-center justify-between hover:bg-[#EAF7EE] text-[#138A36] font-bold text-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5" />
            <span>Switch to Merchant / Business Portal</span>
          </div>
          <span className="bg-[#138A36] text-white px-2 py-0.5 rounded text-[10px]">Merchant</span>
        </button>

        <button 
          onClick={() => onNavigate("saved")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-[#666666]" />
            <span>Saved Shops & Bookmarks</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate("enquiries")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#666666]" />
            <span>My Inquiries & Offers</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate("reservations")}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 text-[#111111] text-xs font-semibold cursor-pointer"
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

        {currentUser ? (
          <button 
            onClick={onLogOut}
            className="w-full p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out ({currentUser.email || currentUser.name})</span>
          </button>
        ) : (
          <button 
            onClick={() => onOpenAuthModal("customer")}
            className="w-full p-4 flex items-center gap-3 text-[#138A36] hover:bg-[#EAF7EE] text-xs font-bold transition-colors cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>Log In with Email</span>
          </button>
        )}
      </div>
    </div>
  );
}
