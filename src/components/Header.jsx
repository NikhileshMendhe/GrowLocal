import React from 'react';
import { MapPin, Search, Bookmark, MessageSquare, User, Store, LayoutDashboard, ShieldCheck } from 'lucide-react';

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
  onNavigatePath
}) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';

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
      {/* Top Banner Bar for Platform Switcher (Desktop only) */}
      <div className="bg-[#111111] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#138A36] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Nagpur MVP
            </span>
            <span className="text-gray-300">Demand-Driven Local Commerce Platform</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white/10 p-0.5 rounded-lg">
              <button
                onClick={() => handleNav('/', 'customer', 'home')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activePlatform === "customer" ? "bg-[#138A36] text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                Customer App
              </button>
              <button
                onClick={() => handleNav('/merchant', 'merchant', 'merchantDashboard')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  activePlatform === "merchant" ? "bg-[#138A36] text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Merchant Portal</span>
              </button>
              <button
                onClick={() => handleNav('/admin', 'admin', 'dashboard', 'dashboard')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  activePlatform === "admin" ? "bg-purple-600 text-white" : "text-[#DDF3E3] hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin</span>
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
              onClick={() => onOpenAuthModal("merchant")}
              className="text-xs font-semibold text-[#DDF3E3] hover:text-white underline flex items-center gap-1 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant Sign In</span>
            </button>
          </div>
        </div>
      </div>

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
            onClick={() => handleNav('/shops', 'customer', 'searchResults')}
            className={`hover:text-[#138A36] transition-colors cursor-pointer ${
              currentPath === '/shops' || currentPath === '/nearby-shops' || (activePlatform === 'customer' && activeTab === 'searchResults')
                ? 'text-[#138A36] border-b-2 border-[#138A36] pb-1 font-bold' 
                : ''
            }`}
          >
            Nearby Shops
          </button>
        </nav>

        {/* Right Actions & List Your Shop CTA */}
        <div className="flex items-center gap-3">
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

          <button
            onClick={() => handleNav('/profile', 'customer', 'profile')}
            className="p-2 text-[#111111] hover:text-[#138A36] hover:bg-[#EAF7EE] rounded-xl transition-colors cursor-pointer"
            title="Profile"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Primary CTA: List Your Shop */}
          <button
            onClick={() => onOpenAuthModal("merchant")}
            className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-102 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>List Your Shop</span>
          </button>
        </div>
      </div>
    </header>
  );
}
