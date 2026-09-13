import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Bookmark, MessageSquare, User, Store, LayoutDashboard, ShieldCheck, LogOut, ChevronDown, ShoppingBag, Sparkles } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  currentLocation, 
  onOpenLocationModal, 
  onOpenAuthModal, 
  activePlatform, 
  setActivePlatform,
  savedCount = 0,
  enquiriesCount = 0,
  onNavigatePath,
  onOpenMerchantMarketing,
  currentUser,
  onLogout
}) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
  const [showGetStartedDropdown, setShowGetStartedDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const customerDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGetStartedDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="hidden md:block sticky top-0 z-40 bg-white border-b border-[#E5E7E5] shadow-xs">
      {/* Top Banner Bar for Platform Switcher (Desktop only - Logged-out visitors only) */}
      {!currentUser && (
        <div className="bg-[#111111] text-white text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-[#138A36] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Nagpur
              </span>
              <span className="text-gray-300">Demand-Driven Hyperlocal Retail Platform</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-white/10 p-0.5 rounded-lg">
                <button
                  onClick={() => handleNav('/', 'customer', 'home')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activePlatform === "customer" ? "bg-[#138A36] text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  Shopper Experience
                </button>
                <button
                  onClick={() => onOpenMerchantMarketing ? onOpenMerchantMarketing() : null}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                    activePlatform === "merchantMarketing" ? "bg-yellow-400 text-[#0B3D1A]" : "text-yellow-300 hover:text-yellow-200"
                  }`}
                >
                  <Store className="w-3 h-3" />
                  <span>For Shop Owners</span>
                </button>
                <button
                  onClick={() => handleNav('/overview', 'landing', 'home')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    activePlatform === "landing" ? "bg-white text-[#111111]" : "text-gray-300 hover:text-white"
                  }`}
                >
                  Overview
                </button>
              </div>

              <button
                onClick={() => onOpenMerchantMarketing ? onOpenMerchantMarketing() : onOpenAuthModal('merchant')}
                className="text-xs font-semibold text-yellow-300 hover:text-yellow-200 underline flex items-center gap-1 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>List Your Shop Free</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Desktop Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNav('/', 'customer', 'home')}>
          <div className="flex items-center gap-3">
            <img 
              src="/growlocal-logo.png" 
              alt="GrowLocal Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#111111] font-poppins">GrowLocal</span>
                <span className="w-2 h-2 rounded-full bg-[#138A36]"></span>
              </div>
              <p className="text-[11px] font-medium text-[#666666]">
                Find Local. Buy Local. Grow Local.
              </p>
            </div>
          </div>
        </div>

        {/* Location Selector Button */}
        <button
          onClick={onOpenLocationModal}
          className="flex items-center gap-2 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] px-3 py-2 rounded-xl text-xs font-semibold text-[#111111] transition-colors cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-[#138A36]" />
          <span>{currentLocation.area}</span>
          <span className="bg-[#EAF7EE] text-[#138A36] font-bold px-1.5 py-0.5 rounded text-[10px]">
            {currentLocation.radius}
          </span>
        </button>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-6 text-sm font-semibold text-[#111111]">
          <button 
            onClick={() => handleNav('/', 'customer', 'home')}
            className={`hover:text-[#138A36] transition-colors cursor-pointer ${
              currentPath === '/' || currentPath === '/home' || (activePlatform === 'customer' && activeTab === 'home') 
                ? 'text-[#138A36] border-b-2 border-[#138A36] pb-1 font-bold' 
                : ''
            }`}
          >
            Home
          </button>

          <button 
            onClick={() => handleNav('/discover', 'customer', 'search')}
            className={`hover:text-[#138A36] transition-colors cursor-pointer ${
              currentPath === '/discover' || currentPath === '/search' || (activePlatform === 'customer' && activeTab === 'search')
                ? 'text-[#138A36] border-b-2 border-[#138A36] pb-1 font-bold' 
                : ''
            }`}
          >
            Discover
          </button>

          <button 
            onClick={() => handleNav('/categories', 'customer', 'categories')}
            className={`hover:text-[#138A36] transition-colors cursor-pointer ${
              currentPath === '/categories' || (activePlatform === 'customer' && activeTab === 'categories')
                ? 'text-[#138A36] border-b-2 border-[#138A36] pb-1 font-bold' 
                : ''
            }`}
          >
            Categories
          </button>

          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                const el = document.getElementById('how-it-works-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handleNav('/', 'customer', 'home');
              }
            }}
            className="hover:text-[#138A36] transition-colors cursor-pointer"
          >
            How It Works
          </button>

          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                const el = document.getElementById('community-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handleNav('/', 'customer', 'home');
              }
            }}
            className="hover:text-[#138A36] transition-colors cursor-pointer"
          >
            Community
          </button>
        </nav>

        {/* Right Actions & Single Unified Get Started */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleNav('/discover', 'customer', 'search')}
            className="p-2 text-[#111111] hover:text-[#138A36] hover:bg-[#EAF7EE] rounded-xl transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleNav('/saved', 'customer', 'saved')}
            className="p-2 text-[#111111] hover:text-[#138A36] hover:bg-[#EAF7EE] rounded-xl transition-colors relative cursor-pointer"
            title="Saved Shops"
          >
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#138A36] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('/enquiries', 'customer', 'enquiries')}
            className="p-2 text-[#111111] hover:text-[#138A36] hover:bg-[#EAF7EE] rounded-xl transition-colors relative cursor-pointer"
            title="My Enquiries"
          >
            <MessageSquare className="w-5 h-5" />
            {enquiriesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#138A36] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {enquiriesCount}
              </span>
            )}
          </button>

          {/* USER LOGGED IN: CUSTOMER MODE AVATAR & DROPDOWN */}
          {currentUser ? (
            <div className="relative" ref={customerDropdownRef}>
              <button
                onClick={() => setShowCustomerDropdown(prev => !prev)}
                className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
                  showCustomerDropdown || activeTab === 'profile'
                    ? 'bg-[#138A36] text-white border-[#138A36]'
                    : 'bg-[#F8FAF8] hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] border-[#E5E7E5] hover:border-[#138A36]'
                }`}
                title="Customer Account Menu"
                id="customer-user-menu-btn"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${
                  showCustomerDropdown || activeTab === 'profile' ? 'bg-white text-[#138A36]' : 'bg-[#138A36] text-white'
                }`}>
                  {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
                <div className="text-left max-w-[120px] truncate">
                  <p className="text-xs font-black truncate leading-tight">
                    {currentUser.name || currentUser.email?.split('@')[0] || 'Customer'}
                  </p>
                  <span className={`text-[10px] font-bold leading-none ${
                    showCustomerDropdown || activeTab === 'profile' ? 'text-white/90' : 'text-[#138A36]'
                  }`}>
                    Customer Mode
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCustomerDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Customer Dropdown Menu */}
              {showCustomerDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#E5E7E5] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Account Header */}
                  <div className="p-2.5 pb-2 border-b border-gray-100 mb-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-black text-[#111111] truncate">
                        {currentUser.name || 'Customer'}
                      </p>
                      <span className="text-[9px] bg-emerald-100 text-[#138A36] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Customer
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>

                  {/* 1. My Enquiries */}
                  <button
                    onClick={() => {
                      setShowCustomerDropdown(false);
                      handleNav('/enquiries', 'customer', 'enquiries');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#EAF7EE] transition-all flex items-center justify-between group cursor-pointer text-xs font-bold text-[#111111]"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-[#138A36]" />
                      <span>My Enquiries</span>
                    </div>
                    {enquiriesCount > 0 && (
                      <span className="text-[10px] font-black bg-[#138A36] text-white px-1.5 py-0.2 rounded-full">
                        {enquiriesCount}
                      </span>
                    )}
                  </button>

                  {/* 2. My Reservations */}
                  <button
                    onClick={() => {
                      setShowCustomerDropdown(false);
                      handleNav('/reservations', 'customer', 'reservations');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#EAF7EE] transition-all flex items-center gap-2.5 group cursor-pointer text-xs font-bold text-[#111111]"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#138A36]" />
                    <span>My Reservations</span>
                  </button>

                  {/* 3. Account Settings */}
                  <button
                    onClick={() => {
                      setShowCustomerDropdown(false);
                      handleNav('/profile', 'customer', 'profile');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#EAF7EE] transition-all flex items-center gap-2.5 group cursor-pointer text-xs font-bold text-[#111111]"
                  >
                    <User className="w-4 h-4 text-[#138A36]" />
                    <span>Account Settings</span>
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  {/* 4. Log Out */}
                  <button
                    onClick={() => {
                      setShowCustomerDropdown(false);
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
          ) : (
            /* UNIFIED "GET STARTED" BUTTON WITH DUAL IDENTITY POPOVER */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowGetStartedDropdown(prev => !prev)}
                className="bg-[#138A36] hover:bg-[#0F752C] active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                title="Get Started on GrowLocal"
              >
                <span>Get Started</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showGetStartedDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showGetStartedDropdown && (
                <div className="absolute right-0 top-full mt-2 w-76 bg-white rounded-2xl shadow-2xl border border-[#E5E7E5] p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#777777] px-2.5 py-1 mb-1">
                    Choose Your Role
                  </p>

                  <button
                    onClick={() => {
                      setShowGetStartedDropdown(false);
                      onOpenAuthModal('customer');
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#EAF7EE] transition-all flex items-start gap-3 group cursor-pointer border border-transparent hover:border-[#DDF3E3]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#EAF7EE] group-hover:bg-[#138A36] text-[#138A36] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <ShoppingBag className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#111111] group-hover:text-[#138A36] flex items-center justify-between">
                        <span>I'm shopping</span>
                        <span className="text-[11px] text-[#138A36] font-extrabold">→</span>
                      </p>
                      <p className="text-[11px] text-[#666666] leading-snug mt-0.5">
                        Search real stock, reserve items, pay when you pick up.
                      </p>
                    </div>
                  </button>

                  <div className="my-1 border-t border-[#F0F2F0]" />

                  <button
                    onClick={() => {
                      setShowGetStartedDropdown(false);
                      onOpenAuthModal('merchant');
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F8FAF8] transition-all flex items-start gap-3 group cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#111111] group-hover:bg-black text-white flex items-center justify-center shrink-0 transition-colors">
                      <Store className="w-4.5 h-4.5 text-yellow-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#111111] flex items-center justify-between">
                        <span>I own a shop</span>
                        <span className="text-[9px] bg-yellow-100 text-yellow-800 font-extrabold px-1.5 py-0.2 rounded">
                          0% Comm
                        </span>
                      </p>
                      <p className="text-[11px] text-[#666666] leading-snug mt-0.5">
                        List products free, get local demand leads, zero fees.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
