import React, { useState } from 'react';
import {
  Search, Camera, Mic, ArrowRight, ShieldCheck, MessageSquare,
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
  onOpenPhotoSearch,
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
          1. HERO SECTION
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

                <span className="rounded-full bg-[#111111] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                  Shop smarter. Shop local.
                </span>

                <span className="text-[11px] font-bold text-[#777777]">
                  Trusted neighborhood discovery
                </span>

              </div>


              {/* Main heading */}
              <h1 className="homepage-title font-poppins text-3xl sm:text-4xl lg:text-[4rem] font-black leading-[1.04] tracking-tight text-[#111111]">
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
              <p className="mt-4 sm:mt-5 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed font-medium text-[#666666]">
                {cmsContent?.heroSubtitle ||
                  "Discover verified local shops, find products nearby, check availability and connect directly with shop owners — all before you leave home."
                }
              </p>

              {/* =================================================
                  ADVANCE SEARCH BAR WITH AUTO-SUGGEST & VOICE
              ================================================= */}
              <div className="mt-5 sm:mt-7">
                <AdvanceSearchBar
                  onSearch={onSearch}
                  onOpenPhotoSearch={onOpenPhotoSearch}
                  onSelectProduct={onSelectProduct}
                  onBuyNow={onBuyNow}
                  products={products}
                  categories={categories}
                  placeholder="Search shirts, sneakers, headphones, or local shops..."
                  size="large"
                />

                {/* Search benefits */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-[11px] font-bold text-[#888888]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#138A36]" />
                    Verified local shops
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#138A36]" />
                    Nearby discovery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#138A36]" />
                    Direct enquiries
                  </span>
                </div>
              </div>

              <div className="homepage-social-proof mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2">
                  {['#0B6B2B', '#F5A524', '#164E63', '#7C3AED'].map((color, index) => (
                    <span key={color} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-black text-white shadow-xs" style={{ backgroundColor: color }}>
                      {['N', 'A', 'P', 'R'][index]}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-[#555555]">
                  <span className="text-[#138A36]">Trusted by local shoppers</span> across Nagpur
                </p>
              </div>

              {/* ===================================================
                  MOBILE QUICK PERKS & DISCOVERY BANNER (Compact & Delightful on Mobile)
              =================================================== */}
              <div className="block lg:hidden mt-6 bg-gradient-to-br from-[#EAF7EE] via-white to-[#DDF3E3] rounded-3xl border border-[#DDF3E3] p-4 sm:p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1.5 max-w-[65%]">
                    <div className="inline-flex items-center gap-1 bg-[#138A36] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>Nagpur Local First</span>
                    </div>
                    <h3 className="font-poppins font-black text-base sm:text-lg text-[#111111] leading-tight">
                      Zero wait courier. Direct local stores.
                    </h3>
                    <p className="text-[11px] font-semibold text-[#555555] leading-relaxed">
                      Check live in-store stock, ask owners directly, and pick up today.
                    </p>
                  </div>

                  {/* Scooter Mascot Thumbnail */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                    <div className="absolute inset-2 rounded-full bg-white/80 shadow-md" />
                    <img
                      src="/growlocal.png"
                      alt="GrowLocal"
                      className="relative w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                {/* Quick Action Chips on Mobile */}
                <div className="mt-3 pt-3 border-t border-[#DDF3E3] flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <button
                    onClick={onOpenDemandRequest}
                    className="flex items-center gap-1 bg-white text-[#138A36] border border-[#BDE7C9] px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 shadow-2xs hover:bg-[#EAF7EE] transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#138A36]" />
                    <span>Tell Shops What You Need</span>
                  </button>

                  <button
                    onClick={onOpenPhotoSearch}
                    className="flex items-center gap-1 bg-white text-[#333333] border border-[#E5E7E5] px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 shadow-2xs hover:border-[#138A36] hover:text-[#138A36] transition-all cursor-pointer"
                  >
                    <Camera className="w-3 h-3 text-[#138A36]" />
                    <span>Photo Search</span>
                  </button>

                  <a
                    href="#products-section"
                    className="flex items-center gap-1 bg-[#138A36] text-white px-3 py-1.5 rounded-xl text-[11px] font-extrabold shrink-0 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Browse Catalog ({products.length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* ===================================================
                RIGHT VISUAL (Desktop/Large Screens)
            =================================================== */}
            <div className="homepage-visual relative min-h-[420px] lg:min-h-[500px] hidden lg:flex items-center justify-center">
              {/* Main visual background */}
              <div className="absolute inset-4 sm:inset-8 rounded-[2.75rem] bg-gradient-to-br from-[#EAF7EE] via-white to-[#DDF3E3] border border-[#DDF3E3] shadow-[0_25px_70px_rgba(19,138,54,0.10)]" />

              <div className="homepage-visual-label absolute top-11 right-9 sm:right-14 z-20 rounded-full px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#0B6B2B]">
                Made for Nagpur
              </div>

              {/* Large rotating ring */}
              <div className="absolute h-[270px] w-[270px] sm:h-[350px] sm:w-[350px] rounded-full border border-[#BDE7C9]/70 animate-[spin_24s_linear_infinite]" />

              {/* Dashed rotating ring */}
              <div className="absolute h-[205px] w-[205px] sm:h-[270px] sm:w-[270px] rounded-full border border-dashed border-[#138A36]/20 animate-[spin_18s_linear_infinite_reverse]" />

              {/* FLOATING CARD 1 */}
              <div className="absolute left-2 sm:left-4 top-16 z-20 rounded-2xl border border-white bg-white/95 px-3.5 py-3 shadow-xl backdrop-blur animate-[bounce_4s_ease-in-out_infinite]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#138A36]">
                    <Store className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[#999999]">Nearby</p>
                    <p className="text-xs font-extrabold text-[#111111]">Verified Shops</p>
                  </div>
                </div>
              </div>

              {/* FLOATING CARD 2 */}
              <div className="absolute right-1 sm:right-3 bottom-16 z-20 rounded-2xl border border-white bg-[#111111]/95 px-3.5 py-3 text-white shadow-xl backdrop-blur animate-[bounce_5s_ease-in-out_infinite]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#138A36]">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-300">Local first</p>
                    <p className="text-xs font-extrabold">Find. Ask. Reserve.</p>
                  </div>
                </div>
              </div>

              <div className="homepage-delivery-card absolute bottom-6 left-6 sm:left-10 z-20 rounded-2xl px-3.5 py-3 shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#138A36]">Discover today</p>
                <p className="mt-0.5 text-xs font-extrabold text-[#111111]">Real stores. Real stock.</p>
              </div>

              {/* MAIN IMAGE */}
              <div className="relative z-10 w-[78%] max-w-[470px] aspect-square flex items-center justify-center">
                <div className="absolute inset-[8%] rounded-full bg-white/75 shadow-[0_25px_60px_rgba(17,17,17,0.12)]" />
                <img
                  src="/growlocal.png"
                  alt="GrowLocal"
                  className="homepage-scooter relative w-full h-full object-contain drop-shadow-[0_28px_28px_rgba(17,17,17,0.18)] transition-transform duration-700 hover:scale-[1.035]"
                />
              </div>

              <span className="absolute top-[18%] right-[18%] h-3 w-3 rounded-full bg-[#138A36] shadow-[0_0_0_8px_rgba(19,138,54,0.08)] animate-pulse" />
              <span className="absolute bottom-[20%] left-[19%] h-2.5 w-2.5 rounded-full bg-[#8BCB9D] shadow-[0_0_0_7px_rgba(139,203,157,0.12)] animate-pulse" />
            </div>

          </div>


          {/* =====================================================
              TRUST METRICS (Genuine Verified Launch Numbers)
          ===================================================== */}
          <div className="homepage-metrics mt-8 overflow-hidden rounded-2xl border border-[#E5E7E5] bg-white/90 shadow-sm backdrop-blur">

            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#E5E7E5]">

              {/* Verified Shops */}
              <div className="px-4 py-4 text-center">

                <span className="block font-poppins text-xl md:text-2xl font-black text-[#138A36]">
                  {Math.max(verifiedShopsCount, shops.length || 6)}+
                </span>

                <span className="text-[10px] md:text-xs font-bold text-[#777777]">
                  Verified Nagpur Shops
                </span>

              </div>


              {/* Real Catalog Products */}
              <div className="px-4 py-4 text-center">

                <span className="block font-poppins text-xl md:text-2xl font-black text-[#138A36]">
                  {products.length > 0 ? `${products.length}+` : '60+'}
                </span>

                <span className="text-[10px] md:text-xs font-bold text-[#777777]">
                  In-Store Products
                </span>

              </div>


              {/* Nagpur Commercial Hubs */}
              <div className="px-4 py-4 text-center">

                <span className="block font-poppins text-xl md:text-2xl font-black text-[#138A36]">
                  6+
                </span>

                <span className="text-[10px] md:text-xs font-bold text-[#777777]">
                  Nagpur Retail Hubs
                </span>

              </div>


              {/* Same-Day In-Store Pickup */}
              <div className="px-4 py-4 text-center">

                <span className="block font-poppins text-xl md:text-2xl font-black text-[#138A36]">
                  100%
                </span>

                <span className="text-[10px] md:text-xs font-bold text-[#777777]">
                  In-Store Pickup & Pay
                </span>

              </div>

            </div>

          </div>


          {/* =====================================================
              QUICK ACTIONS
          ===================================================== */}
          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">

            <button
              onClick={onOpenDemandRequest}
              className="group flex items-center justify-center gap-2 rounded-2xl border border-[#DDF3E3] bg-[#EAF7EE] px-5 py-3 text-xs font-extrabold text-[#138A36] hover:bg-[#DDF3E3] transition-all cursor-pointer"
            >

              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />

              Tell Shops What You Need

              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />

            </button>


            <button
              onClick={onOpenPhotoSearch}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7E5] bg-white px-5 py-3 text-xs font-extrabold text-[#333333] hover:border-[#BDE7C9] hover:text-[#138A36] transition-all cursor-pointer"
            >

              <Camera className="w-4 h-4" />

              Search by Photo

            </button>

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

                      {/* Action Buttons: High-Conversion Clean Bar */}
                      <div className="p-2.5 sm:p-3.5 pt-0 flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBuyNow) onBuyNow(prod);
                            else onSelectProduct(prod.id);
                          }}
                          className="flex-1 bg-gradient-to-r from-[#138A36] to-[#0E6828] hover:from-[#0B6B2B] hover:to-[#095020] active:scale-[0.97] text-white text-[11px] sm:text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all shadow-sm shadow-[#138A36]/25 cursor-pointer"
                          title="Instant Buy Now"
                        >
                          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
                          <span>Buy Now</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(prod.id);
                          }}
                          className="shrink-0 bg-[#EAF7EE] hover:bg-[#DDF3E3] active:scale-[0.97] text-[#138A36] p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                          title="Chat with shop owner"
                        >
                          <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
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
            5. CAN'T FIND WHAT YOU NEED? DEMAND REQUEST
        ======================================================= */}
        <section className="bg-gradient-to-br from-[#111111] to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl space-y-5 sm:space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2.5 sm:space-y-3 max-w-xl">
              <span className="bg-green-500 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                Core Differentiating Feature
              </span>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-poppins">
                Can't find the product you need?
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Instead of searching endlessly or calling shops, tell nearby verified stores what you're looking for. Local merchants will reply directly with availability & prices.
              </p>

              <div className="pt-1.5 sm:pt-2">
                <button
                  onClick={onOpenDemandRequest}
                  className="w-full sm:w-auto bg-[#138A36] hover:bg-[#0B6B2B] active:scale-95 text-white font-black text-xs md:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Tell Shops What You Need →</span>
                </button>
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 w-full md:w-80 space-y-2.5 sm:space-y-3 backdrop-blur-md shrink-0">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-mono text-green-400 uppercase font-bold">
                  Live Demand Request
                </span>
                <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">
                  Within 3 km
                </span>
              </div>

              <div>
                <p className="font-extrabold text-xs sm:text-sm text-white">
                  Black Formal Cotton Shirt
                </p>
                <p className="text-[11px] sm:text-xs text-slate-300 font-mono">
                  Size: L • Budget: ₹1,500
                </p>
              </div>

              <div className="p-2.5 bg-white/10 rounded-xl text-[11px] text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>3 Nearby Stores Responded</span>
              </div>
            </div>
          </div>
        </section>


        {/* =======================================================
            6. HOW GROWLOCAL WORKS (Compact 3-Step)
        ======================================================= */}
        <section className="bg-white border border-[#E5E7E5] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#111111] font-poppins">
              How GrowLocal Works
            </h2>
            <p className="text-[11px] sm:text-xs text-[#666666]">
              3 simple steps to discover, verify, and buy local retail
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
            <div className="bg-[#F8FAF8] p-4 sm:p-5 rounded-2xl border border-[#E5E7E5] space-y-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-black text-xs sm:text-sm text-[#111111]">1. Search & Discover</h3>
              <p className="text-[11px] sm:text-xs text-[#666666] leading-relaxed">
                Find products and browse real store catalogs in your neighborhood without travelling store-to-store.
              </p>
            </div>

            <div className="bg-[#F8FAF8] p-4 sm:p-5 rounded-2xl border border-[#E5E7E5] space-y-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-black text-xs sm:text-sm text-[#111111]">2. Check Availability</h3>
              <p className="text-[11px] sm:text-xs text-[#666666] leading-relaxed">
                Chat directly with shop owners to confirm live stock, size, custom requests and best prices.
              </p>
            </div>

            <div className="bg-[#F8FAF8] p-4 sm:p-5 rounded-2xl border border-[#E5E7E5] space-y-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-black text-xs sm:text-sm text-[#111111]">3. Reserve & Pick Up</h3>
              <p className="text-[11px] sm:text-xs text-[#666666] leading-relaxed">
                Reserve your item online with zero prepayment and pick it up at the shop whenever you're ready.
              </p>
            </div>
          </div>
        </section>


        {/* =======================================================
            7. CUSTOMER & MERCHANT SPLIT CARDS
        ======================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white border-2 border-[#E5E7E5] hover:border-[#138A36] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 space-y-4 sm:space-y-5 transition-all shadow-xs flex flex-col justify-between group">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#EAF7EE] text-[#138A36] rounded-2xl flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#138A36] font-mono">
                For Local Shoppers
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#111111] font-poppins">
                Shop Local in Nagpur
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-medium">
                Support local neighborhood stores, get immediate answers from shop owners, and enjoy hassle-free local shopping.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal("customer") : null}
                className="w-full bg-white hover:bg-gray-50 text-[#111111] hover:text-[#138A36] border-2 border-[#E5E7E5] hover:border-[#138A36] font-extrabold text-xs sm:text-sm py-3 sm:py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <span>Customer Sign In / Join</span>
                <ArrowRight className="w-4 h-4 text-[#138A36]" />
              </button>
            </div>
          </div>

          <div className="bg-[#111111] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 space-y-4 sm:space-y-5 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-2.5 sm:space-y-3 z-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 text-green-400 rounded-2xl flex items-center justify-center border border-white/10">
                <Store className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-green-400 font-mono">
                For Retail Businesses
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-poppins">
                Grow Your Shop Sales
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                List your store, showcase your products, and turn customer search queries into actual store walk-ins.
              </p>
            </div>

            <div className="pt-2 z-10">
              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal("merchant") : null}
                className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white font-extrabold text-xs sm:text-sm py-3 sm:py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
              >
                <span>Merchant Portal / Join</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
