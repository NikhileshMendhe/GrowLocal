import React, { useState } from 'react';
import {
  Search, Mic, ArrowRight, ShieldCheck, MessageSquare,
  MapPin, Heart, Sparkles, ChevronRight, Shirt, Footprints, Glasses,
  Watch, Smartphone, ShoppingBag, Home as HomeIcon, Dumbbell, Gem, Store,
  User, CheckCircle2, Lock, Clock, TrendingUp, Users, Compass, Eye, CornerDownRight, Zap
} from 'lucide-react';
import AdvanceSearchBar from '../components/AdvanceSearchBar';
import { advancedProductSearch } from '../utils/searchHelper';

export default function CustomerHome({
  shops = [],
  products = [],
  categories = [],
  onSelectShop,
  onSelectProduct,
  onBuyNow,
  onSearch,
  onOpenDemandRequest,
  onOpenLocationModal,
  onOpenAuthModal,
  onOpenMerchantMarketing,
  currentLocation,
  cmsContent
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [visibleProductCount, setVisibleProductCount] = useState(8);
  const [visibleShopCount, setVisibleShopCount] = useState(6);
  const verifiedShopsCount = shops.filter(shop => shop.verified || shop.is_verified).length;

  const iconMap = {
    Shirt: Shirt,
    Footprints: Footprints,
    Glasses: Glasses,
    Watch: Watch,
    Smartphone: Smartphone,
    Sparkles: Sparkles,
    ShoppingBag: ShoppingBag,
    Home: HomeIcon,
    Dumbbell: Dumbbell,
    Gem: Gem
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredProducts = advancedProductSearch(products || [], productSearch, {
    selectedCategory: selectedCategory
  });
  const displayedProducts = filteredProducts.slice(0, visibleProductCount);
  const displayedShops = (shops || []).slice(0, visibleShopCount);

  return (
    <div className="homepage-shell space-y-12 pb-20">

      {/* =========================================================
          1. HERO SECTION — Demand-Driven Hyperlocal Retail
      ========================================================= */}
      <section className="homepage-hero relative overflow-hidden bg-white border-b border-[#E5E7E5] rounded-b-[2.5rem] shadow-sm">

        {/* Soft decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[#EAF7EE] blur-3xl opacity-80" />
          <div className="absolute top-40 -left-32 h-72 w-72 rounded-full bg-emerald-50 blur-3xl opacity-70" />
          <div className="absolute right-[18%] top-24 h-2 w-2 rounded-full bg-[#138A36] opacity-50 animate-pulse" />
          <div className="absolute right-[8%] top-52 h-3 w-3 rounded-full bg-emerald-200 opacity-70 animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-8 md:pt-10 md:pb-10">

          <div className="hero-ornament" aria-hidden="true">
            <span className="hero-ornament-dot hero-ornament-dot-one" />
            <span className="hero-ornament-dot hero-ornament-dot-two" />
            <span className="hero-ornament-line" />
          </div>

          {/* =====================================================
              MAIN HERO GRID
          ===================================================== */}
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-8 lg:gap-12">

            {/* ===================================================
                LEFT CONTENT
            =================================================== */}
            <div className="max-w-2xl">

              {/* Mini label */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#138A36] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                  Nagpur Hyperlocal Commerce
                </span>
                <span className="text-[11px] font-bold text-[#555555] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#138A36]" />
                  Reserve Online • Pay In-Store
                </span>
              </div>

              {/* Main heading */}
              <h1 className="homepage-title font-poppins text-3xl sm:text-4xl lg:text-[3.85rem] font-black leading-[1.05] tracking-tight text-[#111111]">
                {cmsContent?.heroHeadline || (
                  <>
                    Support local.
                    <span className="block text-[#138A36]">
                      Strengthen
                    </span>
                    <span className="block">
                      your community.
                    </span>
                  </>
                )}
              </h1>

              {/* Description */}
              <p className="mt-4 sm:mt-5 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed font-medium text-[#555555]">
                {cmsContent?.heroSubtitle ||
                  "Search real stock at shops near you, reserve it with zero prepayment, and inspect & pay when you pick it up in-store. No couriers. No prepaid risk."
                }
              </p>

              {/* =================================================
                  ADVANCE SEARCH BAR WITH AUTO-SUGGEST & VOICE
              ================================================= */}
              <div className="mt-5 sm:mt-7">
                <AdvanceSearchBar
                  onSearch={onSearch}
                  onSelectProduct={onSelectProduct}
                  onBuyNow={onBuyNow}
                  products={products}
                  categories={categories}
                  placeholder="Search shirts, sneakers, headphones, or local shops in Nagpur..."
                  size="large"
                />

                {/* Search benefits */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-[11px] font-bold text-[#666666]">
                  <span className="flex items-center gap-1.5 text-[#111111]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#138A36]" />
                    Real In-Store Inventory
                  </span>
                  <span className="flex items-center gap-1.5 text-[#111111]">
                    <MapPin className="w-3.5 h-3.5 text-[#138A36]" />
                    Sitabuldi, Sadar, Dharampeth
                  </span>
                  <span className="flex items-center gap-1.5 text-[#111111]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#138A36]" />
                    0% Prepayment Risk
                  </span>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={onOpenDemandRequest}
                  className="group flex items-center gap-2 rounded-xl border border-[#BDE7C9] bg-[#EAF7EE] px-4 py-2.5 text-xs font-extrabold text-[#138A36] hover:bg-[#DDF3E3] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                  <span>Tell Shops What You Need</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <a
                  href="#products-section"
                  className="flex items-center gap-1.5 rounded-xl border border-transparent bg-gray-100 hover:bg-gray-200 px-3.5 py-2.5 text-xs font-bold text-[#333333] transition-all cursor-pointer active:scale-95"
                >
                  <span>Explore Catalog ({products.length})</span>
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                </a>
              </div>

              {/* Mobile Storefront Summary Card (No Scooter) */}
              <div className="block lg:hidden mt-6 bg-gradient-to-br from-[#EAF7EE] via-white to-[#DDF3E3] rounded-3xl border border-[#DDF3E3] p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 bg-[#138A36] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      <Store className="w-3 h-3" />
                      <span>Nagpur Neighborhood Commerce</span>
                    </div>
                    <h3 className="font-poppins font-black text-sm text-[#111111]">
                      Real Stores. Real Stock. Pay in-store.
                    </h3>
                    <p className="text-[11px] text-[#555555] leading-relaxed">
                      Reserve items at verified shops in Sitabuldi, Sadar, or Dharampeth and inspect in-person today.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDF3E3] flex items-center justify-center text-[#138A36] shrink-0 shadow-xs">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#DDF3E3] flex items-center justify-between text-[10px] font-bold text-[#138A36]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Sitabuldi • Sadar • Dharampeth
                  </span>
                  <span>100% In-Store Pickup</span>
                </div>
              </div>
            </div>

            {/* ===================================================
                RIGHT VISUAL: NAGPUR STOREFRONT & NEIGHBORHOOD PIN CLUSTER
            =================================================== */}
            <div className="homepage-visual relative min-h-[440px] lg:min-h-[500px] hidden lg:flex items-center justify-center">
              {/* Background Glow */}
              <div className="absolute inset-4 rounded-[2.75rem] bg-gradient-to-br from-[#EAF7EE] via-white to-[#DDF3E3] border border-[#DDF3E3] shadow-[0_25px_70px_rgba(19,138,54,0.10)]" />

              <div className="absolute top-8 right-8 z-20 rounded-full bg-white/90 border border-[#DDF3E3] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#0B6B2B] shadow-xs backdrop-blur">
                Nagpur Retail Hub
              </div>

              {/* Decorative Concentric Map Radius Rings */}
              <div className="absolute h-[340px] w-[340px] rounded-full border border-[#BDE7C9]/60 animate-[spin_30s_linear_infinite]" />
              <div className="absolute h-[240px] w-[240px] rounded-full border border-dashed border-[#138A36]/25 animate-[spin_20s_linear_infinite_reverse]" />

              {/* CENTRAL VERIFIED STOREFRONT SHOWCASE CARD */}
              <div className="relative z-10 w-[84%] max-w-[390px] bg-white rounded-3xl border-2 border-[#DDF3E3] p-5 shadow-2xl space-y-4">
                {/* Store Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center shadow-xs">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-black text-[#111111]">Sitabuldi Retail Store</p>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#138A36]" />
                      </div>
                      <p className="text-[10px] font-bold text-[#777777]">
                        Verified Nagpur Merchant • ★ 4.9
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#EAF7EE] text-[#138A36] text-[9px] font-black px-2 py-0.5 rounded-full">
                    OPEN NOW
                  </span>
                </div>

                {/* Interactive Product & Stock Preview */}
                <div className="bg-[#F8FAF8] rounded-2xl p-3 border border-[#E5E7E5] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-[#111111]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#138A36] animate-ping" />
                      Live In-Store Stock
                    </span>
                    <span className="text-[#138A36] font-mono">Ready in 15 mins</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#555555]">
                    <span>Reserve Online:</span>
                    <span className="font-bold text-[#111111]">₹0 Prepayment Required</span>
                  </div>
                </div>

                {/* Inspection & Trust Strip */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-[#EAF7EE] p-2 rounded-xl">
                    <p className="text-[9px] font-black uppercase text-[#138A36]">Inspection</p>
                    <p className="text-[11px] font-extrabold text-[#111111]">Touch Before Buying</p>
                  </div>
                  <div className="bg-[#111111] p-2 rounded-xl text-white">
                    <p className="text-[9px] font-black uppercase text-yellow-300">Payment</p>
                    <p className="text-[11px] font-extrabold">Pay at Store Counter</p>
                  </div>
                </div>
              </div>

              {/* FLOATING NEIGHBORHOOD PIN 1: Sitabuldi */}
              <div className="absolute left-2 top-12 z-20 rounded-2xl border border-white bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur animate-[bounce_4s_ease-in-out_infinite] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#138A36]">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#999999]">Hub</p>
                  <p className="text-xs font-extrabold text-[#111111]">Sitabuldi Main</p>
                </div>
              </div>

              {/* FLOATING NEIGHBORHOOD PIN 2: Dharampeth */}
              <div className="absolute right-2 bottom-20 z-20 rounded-2xl border border-white bg-[#111111]/95 px-3 py-2.5 text-white shadow-xl backdrop-blur animate-[bounce_5s_ease-in-out_infinite] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#138A36]">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-emerald-300">Boutiques</p>
                  <p className="text-xs font-extrabold">Dharampeth</p>
                </div>
              </div>

              {/* FLOATING NEIGHBORHOOD PIN 3: Sadar */}
              <div className="absolute left-6 bottom-8 z-20 rounded-2xl border border-white bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Store className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#999999]">Electronics</p>
                  <p className="text-xs font-extrabold text-[#111111]">Sadar Market</p>
                </div>
              </div>
            </div>

          </div>

          {/* =====================================================
              MOMENTUM STRIP (Replaces the old 4+/5+ stat strip)
          ===================================================== */}
          <div className="mt-8 rounded-2xl border border-[#DDF3E3] bg-[#F8FAF8] p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#138A36] animate-pulse shrink-0" />
                <p className="text-xs sm:text-sm font-extrabold text-[#111111]">
                  Live in Nagpur: Connecting Sitabuldi, Sadar, Dharampeth, Ramdaspeth and 12+ neighborhoods with verified local shopkeepers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 text-[11px] font-bold text-[#138A36]">
                <span className="bg-[#EAF7EE] border border-[#DDF3E3] px-3 py-1 rounded-full">
                  ✓ 100% Pay On Pickup
                </span>
                <span className="bg-[#EAF7EE] border border-[#DDF3E3] px-3 py-1 rounded-full">
                  ✓ 0% Prepayment Risk
                </span>
                <span className="bg-[#EAF7EE] border border-[#DDF3E3] px-3 py-1 rounded-full">
                  ✓ ₹0 Platform Commission
                </span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================
          PERSISTENT DUAL-PATH BAND (Shopper vs Merchant Entry Points)
      ========================================================= */}
      <section className="homepage-dual-path-band max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Shopper Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-[#DDF3E3] shadow-lg hover:shadow-xl hover:border-[#138A36] transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#EAF7EE] text-[#138A36] px-3 py-1 rounded-full border border-[#CDEED5]">
                  For Shoppers
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#111111] font-poppins">
                  Shopping in Nagpur?
                </h3>
                <p className="text-xs sm:text-sm text-[#555555] font-medium leading-relaxed mt-1.5">
                  Search real stock across local stores in Sitabuldi, Sadar, Dharampeth & more. Reserve items online with zero prepayment, inspect in person, and pay at the shop counter.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
              <a
                href="#products-section"
                className="inline-flex items-center gap-2 bg-[#EAF7EE] hover:bg-[#138A36] text-[#138A36] hover:text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>Browse Nearby Shops</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenDemandRequest}
                className="text-xs font-bold text-[#138A36] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tell Shops What You Need</span>
              </button>
            </div>
          </div>

          {/* Card 2: Merchant Card */}
          <div className="bg-[#111111] text-white rounded-3xl p-5 sm:p-7 border border-white/10 shadow-xl hover:border-[#138A36] transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-yellow-300 flex items-center justify-center border border-white/10">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-black px-3 py-1 rounded-full font-bold">
                  0% Commission • Free Leads
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-poppins">
                  Own a shop in Nagpur?
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed mt-1.5">
                  Zero listing fees. Free leads. When nearby customers search for items or post what they need, reply directly with your live stock and bring paying customers to your counter.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/10 relative z-10 flex items-center justify-between">
              <button
                onClick={() => onOpenMerchantMarketing ? onOpenMerchantMarketing() : (onOpenAuthModal && onOpenAuthModal('merchant'))}
                className="inline-flex items-center gap-2 bg-[#138A36] hover:bg-[#0B6B2B] text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#138A36]/30 active:scale-95"
              >
                <Store className="w-4 h-4" />
                <span>List Your Shop Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal('merchant') : null}
                className="text-xs font-bold text-gray-300 hover:text-white underline cursor-pointer"
              >
                Merchant Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT CONTAINER
      ========================================================= */}
      <div className="homepage-content max-w-7xl mx-auto px-4 space-y-12">

        {/* =======================================================
            2. CATEGORIES FILTER STRIP — Smooth Edge-to-Edge on Mobile
        ======================================================= */}
        <section className="homepage-categories space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">🏷️</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#111111] font-poppins">
                  Explore by Category
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#666666] mt-0.5">
                Quickly filter real items available from verified stores in your area
              </p>
            </div>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold text-[#138A36] bg-[#EAF7EE] px-3 py-1.5 rounded-full hover:bg-[#DDF3E3] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Reset</span>
                <span>✕</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-[#138A36] to-[#0E6828] text-white shadow-md shadow-[#138A36]/25'
                  : 'bg-white text-[#111111] border border-[#E5E7E5] hover:border-[#138A36] hover:bg-[#EAF7EE]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>All Products ({products.length})</span>
            </button>

            {categories.map((cat) => {
              const IconComp = iconMap[cat.icon] || ShoppingBag;
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              const catCount = products.filter(p => 
                p.category?.toLowerCase() === cat.name.toLowerCase() ||
                p.category?.toLowerCase()?.includes(cat.name.toLowerCase())
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#138A36] to-[#0E6828] text-white shadow-md shadow-[#138A36]/25'
                      : 'bg-white text-[#111111] border border-[#E5E7E5] hover:border-[#138A36] hover:bg-[#EAF7EE]'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#138A36]'}`} />
                  <span>{cat.name}</span>
                  {catCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#138A36]'
                    }`}>
                      {catCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>


        {/* =======================================================
            3. MAIN PRODUCTS SHOWCASE — The Heart of GrowLocal
        ======================================================= */}
        <section className="homepage-products space-y-5 sm:space-y-6 scroll-mt-24" id="products-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E5E7E5] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🔥</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#111111] font-poppins">
                  Available Products Near You
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#666666] mt-0.5">
                {products.length > 0
                  ? `Showing ${filteredProducts.length} real product${filteredProducts.length !== 1 ? 's' : ''} listed by local store merchants`
                  : 'Live digital product catalog from verified local stores in Nagpur'}
              </p>
            </div>

            {/* In-catalog live search */}
            <div className="flex items-center gap-2 sm:max-w-xs w-full">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter products in this list..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-[#F8FAF8] border border-[#E5E7E5] rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-[#111111] outline-none focus:border-[#138A36] focus:bg-white transition-all"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-[#111111]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PRODUCT CARDS OR UNAVAILABLE EMPTY STATE */}
          {filteredProducts.length === 0 ? (
            <div className="homepage-empty-state bg-gradient-to-br from-white to-[#F8FAF8] rounded-3xl border-2 border-dashed border-[#C6E6D0] p-6 sm:p-10 md:p-14 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#EAF7EE] flex items-center justify-center text-3xl sm:text-4xl mx-auto border border-[#DDF3E3] shadow-inner">
                📦
              </div>

              <div className="max-w-xl mx-auto space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                  <span>⚠</span> Catalog Status
                </span>
                
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#111111] font-poppins">
                  Sorry, but it's unavailable.
                </h3>
                
                <p className="text-xs sm:text-sm font-semibold text-[#444444]">
                  {selectedCategory !== 'all'
                    ? `Currently no products are listed under "${selectedCategory}" in your area.`
                    : 'Currently no products have been listed by merchants in this area yet.'}
                </p>

                <p className="text-[11px] sm:text-xs text-[#777777] leading-relaxed max-w-lg mx-auto">
                  Local shop owners are currently onboarding and publishing their store inventories. If you're looking for something specific, tell nearby shops what you need and local businesses will reply directly with prices & availability!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={onOpenDemandRequest}
                  className="bg-[#138A36] hover:bg-[#0B6B2B] active:scale-95 text-white font-black text-xs md:text-sm px-5 sm:px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-[#138A36]/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Tell Shops What You Need</span>
                </button>

                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => { setSelectedCategory('all'); setProductSearch(''); }}
                    className="bg-white border-2 border-[#E5E7E5] hover:border-[#138A36] text-[#111111] font-bold text-xs md:text-sm px-4 sm:px-5 py-3 rounded-2xl transition-all cursor-pointer"
                  >
                    <span>View All Categories</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenAuthModal ? onOpenAuthModal('merchant') : null}
                  className="bg-[#111111] hover:bg-black text-white font-bold text-xs md:text-sm px-4 sm:px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4 text-green-400" />
                  <span>I am a Merchant</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="homepage-product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                {displayedProducts.map((prod, idx) => {
                  const discountPct = prod.originalPrice > prod.price
                    ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod.id)}
                      className="group cursor-pointer bg-white rounded-2xl sm:rounded-3xl border border-[#E5E7E5] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        {/* Product Image Container */}
                        <div className="relative h-38 sm:h-48 md:h-52 bg-[#F8FAF8] overflow-hidden">
                          <img
                            src={prod.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'}
                            alt={prod.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
                            }}
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {idx === 0 && (
                              <span className="bg-gradient-to-r from-[#138A36] to-emerald-400 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                                JUST LISTED
                              </span>
                            )}
                            {discountPct >= 5 && (
                              <span className="bg-red-500 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                                -{discountPct}% OFF
                              </span>
                            )}
                          </div>

                          {/* Stock status pill */}
                          <div className="absolute bottom-2 right-2 z-10">
                            <span className={`text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-md backdrop-blur-md ${
                              prod.availability === 'In Stock' || (prod.stockCount && prod.stockCount > 0)
                                ? 'bg-white/95 text-[#138A36]'
                                : 'bg-amber-500/90 text-white'
                            }`}>
                              {prod.availability || (prod.stockCount > 0 ? 'In Stock' : 'Limited')}
                            </span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 sm:p-4 space-y-1.5">
                          {/* Shop badge */}
                          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-[#138A36] truncate">
                            <Store className="w-3 h-3 shrink-0" />
                            <span className="truncate">{prod.shopName || "Nagpur Store"}</span>
                          </div>

                          {/* Product title */}
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#111111] line-clamp-2 leading-snug group-hover:text-[#138A36] transition-colors">
                            {prod.name}
                          </h3>

                          {/* Size badges if available */}
                          {prod.sizes && prod.sizes.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              {prod.sizes.slice(0, 3).map((sz, sIdx) => (
                                <span key={sIdx} className="text-[8px] sm:text-[9px] font-bold bg-gray-100 text-[#555555] px-1 py-0.2 rounded">
                                  {sz}
                                </span>
                              ))}
                              {prod.sizes.length > 3 && (
                                <span className="text-[8px] sm:text-[9px] text-[#888888]">+{prod.sizes.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Price Row */}
                          <div className="flex items-baseline gap-1.5 pt-0.5">
                            <span className="text-sm sm:text-base md:text-lg font-black text-[#111111]">
                              ₹{prod.price?.toLocaleString()}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-[10px] sm:text-xs text-[#aaaaaa] line-through font-semibold">
                                ₹{prod.originalPrice?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button: Single High-Impact Reserve for Pickup */}
                      <div className="p-2.5 sm:p-3.5 pt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBuyNow) onBuyNow(prod);
                            else onSelectProduct(prod.id);
                          }}
                          className="w-full bg-[#138A36] hover:bg-[#0B6B2B] active:scale-[0.97] text-white text-[11px] sm:text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs shadow-[#138A36]/20 cursor-pointer"
                          title="Reserve this item for in-store pickup"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <span>Reserve for Pickup</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Products Button */}
              {filteredProducts.length > visibleProductCount && (
                <div className="text-center pt-2 sm:pt-4">
                  <button
                    onClick={() => setVisibleProductCount(prev => prev + 8)}
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#F8FAF8] border border-[#E5E7E5] hover:border-[#138A36] text-[#111111] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-all cursor-pointer hover:shadow-md active:scale-98"
                  >
                    <span>Load More Products</span>
                    <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Showing {displayedProducts.length} of {filteredProducts.length}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#138A36]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>


        {/* =======================================================
            4. VERIFIED SHOPS & INVENTORY SHOWCASE
        ======================================================= */}
        <section className="homepage-shops space-y-4 sm:space-y-6 pt-2 sm:pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl">🏪</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#111111] font-poppins">
                  Verified Local Shops & Inventories
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#666666] mt-0.5">
                {shops.length > 0
                  ? `Click any shop to view their full catalog and in-store product inventory`
                  : 'Verified neighborhood store profiles in Nagpur'}
              </p>
            </div>
            {shops.length > 0 && (
              <button
                onClick={() => onSearch("")}
                className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>View All ({shops.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {shops.length === 0 ? (
            <div className="homepage-shops-empty bg-white rounded-3xl border-2 border-dashed border-[#E5E7E5] p-6 sm:p-10 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#F8FAF8] flex items-center justify-center text-3xl mx-auto border border-[#E5E7E5]">
                🏪
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-extrabold text-base text-[#111111]">
                  Sorry, no local shops registered yet in this area.
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Are you a shop owner in Nagpur? Join GrowLocal free to list your shop, publish products, and get discovered by thousands of nearby customers!
                </p>
              </div>
              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal('merchant') : null}
                className="inline-flex items-center gap-2 bg-[#138A36] hover:bg-[#0B6B2B] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>List My Shop Free →</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedShops.map((shop) => {
                  const shopProducts = (products || []).filter(p => 
                    p.shopId === shop.id || 
                    (p.shopName && shop.name && p.shopName.trim().toLowerCase() === shop.name.trim().toLowerCase())
                  );
                  const shopProductsCount = shopProducts.length;

                  return (
                    <div
                      key={shop.id}
                      onClick={() => onSelectShop(shop.id)}
                      className="group cursor-pointer bg-white rounded-2xl sm:rounded-3xl border border-[#E5E7E5] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Cover Photo */}
                        <div className="relative h-32 sm:h-40 overflow-hidden bg-gray-100">
                          <img
                            src={shop.coverImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'}
                            alt={shop.name || 'Shop'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="bg-white/95 backdrop-blur-md text-[#138A36] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                              {shop.status || 'Open'}
                            </span>
                            {(shop.verified || shop.is_verified) && (
                              <span className="bg-[#138A36] text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>

                          {/* Shop Logo Avatar */}
                          <div className="absolute -bottom-4 left-4 sm:left-5 z-10">
                            <img
                              src={shop.logoImage || shop.coverImage || 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=200&auto=format&fit=crop&q=80'}
                              alt={shop.name || 'Logo'}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=200&auto=format&fit=crop&q=80';
                              }}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-white shadow-lg object-cover bg-white"
                            />
                          </div>
                        </div>

                        {/* Card Details */}
                        <div className="pt-6 sm:pt-8 px-4 sm:px-5 pb-3 sm:pb-4 space-y-2.5">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-extrabold text-sm sm:text-base text-[#111111] truncate group-hover:text-[#138A36] transition-colors">
                                {shop.name || 'Unnamed Shop'}
                              </h3>
                              <span className="text-[11px] sm:text-xs font-black text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded-md shrink-0">
                                ★ {shop.rating || '4.8'}
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-[#777777] font-medium mt-0.5">
                              {shop.category || 'Local Store'} • {shop.distance || '0.5 km away'}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-[#999999] truncate mt-1">
                              {shop.address || 'Nagpur, Maharashtra'}
                            </p>
                          </div>

                          {/* Inventory Count Indicator */}
                          <div className="flex items-center justify-between text-[11px] sm:text-xs py-1.5 sm:py-2 px-2.5 sm:px-3 bg-[#F8FAF8] rounded-xl border border-[#E5E7E5]">
                            <span className="font-bold text-[#555555] flex items-center gap-1.5">
                              <span>📦</span>
                              <span>In-Store Inventory:</span>
                            </span>
                            <span className={`font-black ${shopProductsCount > 0 ? 'text-[#138A36]' : 'text-[#888888]'}`}>
                              {shopProductsCount > 0 ? `${shopProductsCount} Products Listed` : 'Catalog Pending'}
                            </span>
                          </div>

                          {/* Top Products Preview From This Shop */}
                          {shopProductsCount > 0 && (
                            <div className="pt-2 border-t border-dashed border-gray-200">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                <span>Featured In Stock</span>
                                <span className="text-[#138A36] text-[10px] font-bold">Catalog Preview</span>
                              </p>
                              <div className="space-y-1.5">
                                {shopProducts.slice(0, 3).map((p) => (
                                  <div 
                                    key={p.id} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectProduct(p.id);
                                    }}
                                    className="flex items-center justify-between gap-2 p-1.5 bg-[#F8FAF8] hover:bg-[#EAF7EE] rounded-xl transition-colors border border-gray-100 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <img 
                                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100&auto=format&fit=crop&q=80'} 
                                        alt={p.name} 
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                          e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100&auto=format&fit=crop&q=80';
                                        }}
                                        className="w-7 h-7 rounded-lg object-cover border border-gray-200 shrink-0" 
                                      />
                                      <span className="text-[11px] font-bold text-gray-800 truncate">{p.name}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-[#138A36] shrink-0">₹{p.price?.toLocaleString()}</span>
                                  </div>
                                ))}
                                {shopProductsCount > 3 && (
                                  <p className="text-[10px] text-center font-bold text-[#138A36] pt-0.5 hover:underline">
                                    +{shopProductsCount - 3} more products in store →
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectShop(shop.id);
                          }}
                          className="w-full bg-[#EAF7EE] group-hover:bg-[#138A36] text-[#138A36] group-hover:text-white font-extrabold text-xs py-2.5 sm:py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <span>Browse Shop Inventory</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Shops Button */}
              {shops.length > visibleShopCount && (
                <div className="text-center pt-2 sm:pt-4">
                  <button
                    onClick={() => setVisibleShopCount(prev => prev + 6)}
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#F8FAF8] border border-[#E5E7E5] hover:border-[#138A36] text-[#111111] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs transition-all cursor-pointer hover:shadow-md active:scale-98"
                  >
                    <Store className="w-4 h-4 text-[#138A36]" />
                    <span>Load More Verified Shops</span>
                    <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Showing {displayedShops.length} of {shops.length}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#138A36]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>


        {/* =======================================================
            5. REVERSE MARKETPLACE SPOTLIGHT — Tell Shops What You Need
        ======================================================= */}
        <section className="bg-gradient-to-br from-[#111111] via-[#1a2e1d] to-[#111111] text-white rounded-3xl p-6 sm:p-9 md:p-11 shadow-2xl space-y-6 relative overflow-hidden border border-emerald-900/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#138A36]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 bg-[#138A36] text-white font-black text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Reverse Marketplace • GrowLocal Exclusive</span>
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-poppins leading-tight">
                Can't find what you need?<br />
                <span className="text-emerald-400">Let Nagpur shops find it for you.</span>
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                Instead of endlessly browsing or driving across Nagpur in traffic, post what you're looking for. Verified shopkeepers in Sitabuldi, Sadar, and Dharampeth respond live with real counter stock, exact sizes, and direct quotes.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenDemandRequest}
                  className="bg-[#138A36] hover:bg-[#0B6B2B] active:scale-95 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-[#138A36]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Post What You Need →</span>
                </button>

                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Average 3 verified responses in 15 mins
                </span>
              </div>
            </div>

            {/* LIVE SIMULATED REVERSE MARKETPLACE DEMO CARD */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 sm:p-5 w-full lg:w-96 space-y-3 shrink-0 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono text-emerald-300 uppercase font-black">
                    Live Shopper Enquiry
                  </span>
                </div>
                <span className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full font-bold">
                  Dharampeth • 2 km
                </span>
              </div>

              {/* Request Details */}
              <div className="bg-black/30 p-3 rounded-2xl border border-white/10 space-y-1">
                <p className="font-black text-xs sm:text-sm text-white">
                  "Pure cotton formal shirt (Sky blue, Size 42)"
                </p>
                <div className="flex items-center justify-between text-[11px] text-gray-300 font-mono">
                  <span>Budget: ₹1,500 – ₹1,800</span>
                  <span className="text-emerald-400 font-bold">Urgent (Today)</span>
                </div>
              </div>

              {/* Verified Shop Replies */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  Verified Local Merchant Offers (2)
                </p>

                <div className="bg-white/10 hover:bg-white/15 p-2.5 rounded-xl border border-white/10 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-white flex items-center gap-1">
                      <Store className="w-3 h-3 text-emerald-400" /> Rajdhani Garments (Sitabuldi)
                    </span>
                    <span className="font-black text-emerald-300">₹1,450</span>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-1">
                    "In stock! 2 cotton fits in Size 42 held for you. Ready for counter pickup."
                  </p>
                </div>

                <div className="bg-white/10 hover:bg-white/15 p-2.5 rounded-xl border border-white/10 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-white flex items-center gap-1">
                      <Store className="w-3 h-3 text-emerald-400" /> Cotton King (Dharampeth)
                    </span>
                    <span className="font-black text-emerald-300">₹1,600</span>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-1">
                    "3 pastel shades arrived this morning. Come inspect before buying."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =======================================================
            6. HOW GROWLOCAL WORKS (3-Step Reserve & Collect Flow)
        ======================================================= */}
        <section 
          id="how-it-works-section"
          className="bg-white border border-[#E5E7E5] rounded-3xl p-6 sm:p-8 md:p-10 space-y-6 shadow-xs scroll-mt-24"
        >
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#138A36] bg-[#EAF7EE] px-3 py-1 rounded-full">
              Reserve & Collect Model
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#111111] font-poppins">
              How GrowLocal Works
            </h2>
            <p className="text-xs sm:text-sm text-[#666666]">
              Zero couriers. Zero delivery wait. 100% physical confidence before paying.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#F8FAF8] p-5 sm:p-6 rounded-2xl border border-[#E5E7E5] space-y-2.5 hover:border-[#138A36] transition-colors">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold shadow-xs">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-[#111111]">1. Search or Request</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Browse real store stock in Sitabuldi, Sadar, or Dharampeth, or post your exact requirement and let shops reply to you.
              </p>
            </div>

            <div className="bg-[#F8FAF8] p-5 sm:p-6 rounded-2xl border border-[#E5E7E5] space-y-2.5 hover:border-[#138A36] transition-colors">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-[#111111]">2. Reserve Online</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Lock the item under your name with one tap. Zero prepayment, zero cards required, and zero financial risk.
              </p>
            </div>

            <div className="bg-[#F8FAF8] p-5 sm:p-6 rounded-2xl border border-[#E5E7E5] space-y-2.5 hover:border-[#138A36] transition-colors">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-[#111111]">3. Inspect & Pay In-Store</h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                Walk into the store, touch, try on, inspect the item in person, and pay directly at the shopkeeper's counter.
              </p>
            </div>
          </div>
        </section>


        {/* =======================================================
            7. CIVIC PRIDE & LOCAL ECONOMY BANNER (Nagpur Pride)
        ======================================================= */}
        <section 
          id="community-section"
          className="bg-gradient-to-br from-[#EAF7EE] via-white to-[#DDF3E3] rounded-3xl p-6 sm:p-8 md:p-10 border-2 border-[#DDF3E3] shadow-sm space-y-6 scroll-mt-24"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-[#138A36] text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-xs">
                <span>🧡</span>
                <span>Nagpur Civic & Economic Impact</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] font-poppins leading-tight">
                Every Rupee Spent Here<br />
                <span className="text-[#138A36]">Stays Inside Nagpur.</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed font-medium">
                When you buy from national platforms, up to 35% leaves Nagpur in commissions and corporate margins. When you reserve through GrowLocal, 100% of your money goes straight into the hands of local retailers, sustaining Nagpur families, local jobs, and our vibrant commercial hubs.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="bg-white border border-[#CDEED5] text-[#138A36] text-xs font-black px-3.5 py-2 rounded-xl shadow-2xs">
                  ✓ 0% Platform Commission
                </span>
                <span className="bg-white border border-[#CDEED5] text-[#138A36] text-xs font-black px-3.5 py-2 rounded-xl shadow-2xs">
                  ✓ 100% Retained in Nagpur
                </span>
                <span className="bg-white border border-[#CDEED5] text-[#138A36] text-xs font-black px-3.5 py-2 rounded-xl shadow-2xs">
                  ✓ Verified Local Shopkeepers
                </span>
              </div>
            </div>

            {/* Nagpur Hub Pin Display */}
            <div className="bg-white p-5 rounded-3xl border border-[#CDEED5] shadow-md space-y-3 w-full lg:w-80 shrink-0">
              <p className="text-xs font-black text-[#111111] uppercase tracking-wider">
                Nagpur Retail Hubs Live
              </p>

              <div className="space-y-2">
                {[
                  { name: 'Sitabuldi', tag: 'Central Commercial Hub', count: '18+ Shops' },
                  { name: 'Sadar', tag: 'Electronics & Lifestyle', count: '14+ Shops' },
                  { name: 'Dharampeth', tag: 'Fashion & Boutiques', count: '10+ Shops' },
                  { name: 'Ramdaspeth', tag: 'Specialty Retail & Goods', count: '8+ Shops' }
                ].map((hub) => (
                  <div key={hub.name} className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAF8] border border-gray-100 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#138A36]" />
                      <div>
                        <p className="font-extrabold text-[#111111]">{hub.name}</p>
                        <p className="text-[10px] text-gray-500">{hub.tag}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded-full">
                      {hub.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* =======================================================
            8. MERCHANT PROMO BANNER
        ======================================================= */}
        <section
          className="homepage-merchant relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0B3D1A 0%, #138A36 55%, #1aad44 100%)' }}
        >
          <div className="relative p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="flex-1 space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                <Store className="w-3.5 h-3.5" />
                For Local Businesses
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight font-poppins">
                Own a shop in Nagpur?<br />
                <span className="text-yellow-300">Grow it with GrowLocal.</span>
              </h2>
              <p className="text-green-100 text-xs sm:text-sm leading-relaxed max-w-md">
                Get discovered by thousands of nearby customers, showcase your in-store catalog, and receive instant enquiries for free.
              </p>
              <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1">
                <button
                  onClick={() => onOpenMerchantMarketing ? onOpenMerchantMarketing() : (onOpenAuthModal && onOpenAuthModal('merchant'))}
                  className="flex items-center gap-2 bg-white text-[#138A36] hover:bg-yellow-300 hover:text-[#0B6B2B] font-black text-xs md:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg cursor-pointer active:scale-95"
                >
                  <Store className="w-4 h-4" />
                  <span>Explore Merchant Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuthModal ? onOpenAuthModal('merchant') : null}
                  className="flex items-center gap-2 text-white border-2 border-white/40 hover:border-white hover:bg-white/10 font-bold text-xs md:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer"
                >
                  <span>List My Shop Free →</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto">
              {[
                { icon: TrendingUp, label: "Live Searches", value: '1,240+', color: 'text-yellow-300' },
                { icon: Users, label: 'Local Shoppers', value: '4,800+', color: 'text-blue-300' },
                { icon: MessageSquare, label: 'Product Enquiries', value: '320+', color: 'text-purple-300' },
                { icon: ShieldCheck, label: 'Verified Stores', value: '380+', color: 'text-green-300' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-3 sm:p-3.5 text-center">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color} mx-auto mb-1`} />
                  <p className="text-white font-black text-base sm:text-lg">{value}</p>
                  <p className="text-green-200 text-[9px] sm:text-[10px] font-semibold mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* =======================================================
            9. FINAL BOTTOM CTA
        ======================================================= */}
        <section className="homepage-final-cta bg-gradient-to-br from-[#138A36] to-[#0B6B2B] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-center space-y-5 sm:space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-poppins tracking-tight">
              Ready to shop from local stores?
            </h2>
            <p className="text-xs sm:text-sm text-[#DDF3E3] font-medium leading-relaxed">
              Find nearby businesses, discover in-stock items, and reserve with complete confidence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={scrollToTop}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#111111] font-extrabold text-xs md:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl transition-all shadow-md cursor-pointer active:scale-95"
            >
              Start Exploring Products ↑
            </button>

            <button
              onClick={onOpenDemandRequest}
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-extrabold text-xs md:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Tell Shops What You Need</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
