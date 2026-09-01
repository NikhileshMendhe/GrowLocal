import React from 'react';
import {
  Search, Camera, Mic, ArrowRight, ShieldCheck, MessageSquare,
  MapPin, Heart, Sparkles, ChevronRight, Shirt, Footprints, Glasses,
  Watch, Smartphone, ShoppingBag, Home as HomeIcon, Dumbbell, Gem, Store,
  User, CheckCircle2, Lock, Clock, TrendingUp, Users, Compass, Eye, CornerDownRight
} from 'lucide-react';
import ShopCard from '../components/ShopCard';
import ProductCard from '../components/ProductCard';

export default function CustomerHome({
  shops = [],
  products = [],
  categories = [],
  onSelectShop,
  onSelectProduct,
  onSearch,
  onOpenPhotoSearch,
  onOpenDemandRequest,
  onOpenLocationModal,
  onOpenAuthModal,
  currentLocation,
  cmsContent
}) {
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

  const verifiedShopsCount = shops.length > 0 ? Math.max(230, shops.length * 15) : 230;
  const productsCount = products.length > 0 ? Math.max(10000, products.length * 250) : 10000;

  return (
    <div className="space-y-12 pb-20">

      {/* =========================================================
          1. HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-white border-b border-[#E5E7E5] rounded-b-[2.5rem] shadow-sm">

        {/* Soft decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[#EAF7EE] blur-3xl opacity-80" />

          <div className="absolute top-40 -left-32 h-72 w-72 rounded-full bg-emerald-50 blur-3xl opacity-70" />

          <div className="absolute right-[18%] top-24 h-2 w-2 rounded-full bg-[#138A36] opacity-50 animate-pulse" />

          <div className="absolute right-[8%] top-52 h-3 w-3 rounded-full bg-emerald-200 opacity-70 animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-8 md:pt-10 md:pb-10">

          {/* =====================================================
              TOP BAR
          ===================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#DDF3E3] bg-[#EAF7EE] px-3.5 py-1.5 text-[11px] font-black tracking-wide text-[#138A36]">

              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#138A36] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#138A36]" />
              </span>

              <Sparkles className="w-3.5 h-3.5" />

              <span>
                Demand-Driven Local Commerce
              </span>

            </div>


            {/* LOCATION SELECTOR */}
            <button
              onClick={onOpenLocationModal}
              className="group w-fit self-start sm:self-auto flex items-center gap-2.5 rounded-2xl border border-[#E5E7E5] bg-white/90 px-3.5 py-2.5 shadow-sm backdrop-blur hover:border-[#BDE7C9] hover:bg-[#F7FCF8] transition-all duration-300 cursor-pointer"
            >

              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#138A36] group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" />
              </span>

              <span className="text-left">

                <span className="block text-[9px] uppercase tracking-[0.16em] font-black text-[#888888]">
                  Shopping nearby
                </span>

                <span className="block text-xs font-extrabold text-[#111111]">
                  {currentLocation?.area || "Your Area"}

                  <span className="text-[#138A36]"> • </span>

                  {currentLocation?.radius || "3 km"}
                </span>

              </span>

              <ChevronRight className="w-4 h-4 text-[#999999] group-hover:text-[#138A36] group-hover:translate-x-0.5 transition-all" />

            </button>

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
              <h1 className="font-poppins text-4xl sm:text-5xl lg:text-[4.15rem] font-black leading-[0.98] tracking-[-0.045em] text-[#111111]">

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
              <p className="mt-5 max-w-xl text-sm sm:text-base leading-7 font-medium text-[#666666]">

                {cmsContent?.heroSubtitle ||
                  "Discover verified local shops, find products nearby, check availability and connect directly with shop owners — all before you leave home."
                }

              </p>


              {/* =================================================
                  SEARCH BAR
              ================================================= */}
              <div className="mt-7">

                <div className="group flex items-center rounded-[1.35rem] border-2 border-[#E5E7E5] bg-[#F8FAF8] p-1.5 shadow-[0_10px_35px_rgba(17,17,17,0.06)] transition-all duration-300 focus-within:border-[#138A36] focus-within:bg-white focus-within:shadow-[0_14px_40px_rgba(19,138,54,0.12)]">

                  {/* Search icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#777777] group-focus-within:text-[#138A36]">

                    <Search className="h-5 w-5" />

                  </div>


                  {/* Input */}
                  <input
                    type="text"
                    placeholder="Search products, brands or local shops..."
                    onKeyDown={(e) => {

                      if (e.key === 'Enter' && e.target.value) {
                        onSearch(e.target.value);
                      }

                    }}
                    className="min-w-0 w-full bg-transparent px-1 py-3 text-sm md:text-base font-medium text-[#111111] outline-none placeholder:text-[#999999]"
                  />


                  {/* Search actions */}
                  <div className="flex shrink-0 items-center gap-1.5 pr-0.5">

                    <button
                      onClick={onOpenPhotoSearch}
                      className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-[#138A36] hover:bg-[#EAF7EE] transition-colors cursor-pointer"
                      title="Search by Photo"
                    >

                      <Camera className="w-4 h-4" />

                      <span className="hidden md:inline">
                        Photo
                      </span>

                    </button>


                    <button
                      onClick={() => onSearch("")}
                      className="flex items-center gap-1.5 rounded-xl bg-[#138A36] px-4 sm:px-5 py-3 text-xs md:text-sm font-extrabold text-white shadow-md hover:bg-[#0B6B2B] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                    >

                      <span className="hidden xs:inline">
                        Find Nearby
                      </span>

                      <span className="xs:hidden">
                        Find
                      </span>

                      <ArrowRight className="w-4 h-4" />

                    </button>

                  </div>

                </div>


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

            </div>


            {/* ===================================================
                RIGHT VISUAL
            =================================================== */}
            <div className="relative min-h-[360px] sm:min-h-[430px] lg:min-h-[500px] flex items-center justify-center">


              {/* Main visual background */}
              <div className="absolute inset-4 sm:inset-8 rounded-[2.75rem] bg-gradient-to-br from-[#EAF7EE] via-white to-[#DDF3E3] border border-[#DDF3E3] shadow-[0_25px_70px_rgba(19,138,54,0.10)]" />


              {/* Large rotating ring */}
              <div className="absolute h-[270px] w-[270px] sm:h-[350px] sm:w-[350px] rounded-full border border-[#BDE7C9]/70 animate-[spin_24s_linear_infinite]" />


              {/* Dashed rotating ring */}
              <div className="absolute h-[205px] w-[205px] sm:h-[270px] sm:w-[270px] rounded-full border border-dashed border-[#138A36]/20 animate-[spin_18s_linear_infinite_reverse]" />


              {/* =================================================
                  FLOATING CARD 1
              ================================================= */}
              <div className="absolute left-2 sm:left-4 top-16 z-20 rounded-2xl border border-white bg-white/95 px-3.5 py-3 shadow-xl backdrop-blur animate-[bounce_4s_ease-in-out_infinite]">

                <div className="flex items-center gap-2.5">

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7EE] text-[#138A36]">

                    <Store className="w-4.5 h-4.5" />

                  </span>

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-wider text-[#999999]">
                      Nearby
                    </p>

                    <p className="text-xs font-extrabold text-[#111111]">
                      Verified Shops
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  FLOATING CARD 2
              ================================================= */}
              <div className="absolute right-1 sm:right-3 bottom-16 z-20 rounded-2xl border border-white bg-[#111111]/95 px-3.5 py-3 text-white shadow-xl backdrop-blur animate-[bounce_5s_ease-in-out_infinite]">

                <div className="flex items-center gap-2.5">

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#138A36]">

                    <ShoppingBag className="w-4 h-4" />

                  </span>

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                      Local first
                    </p>

                    <p className="text-xs font-extrabold">
                      Find. Ask. Reserve.
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  MAIN IMAGE
              ================================================= */}
              <div className="relative z-10 w-[78%] max-w-[470px] aspect-square flex items-center justify-center">

                {/* Circular white glow */}
                <div className="absolute inset-[8%] rounded-full bg-white/75 shadow-[0_25px_60px_rgba(17,17,17,0.12)]" />

                <img
                  src="/growlocal.png"
                  alt="GrowLocal"
                  className="relative w-full h-full object-contain drop-shadow-[0_28px_28px_rgba(17,17,17,0.18)] transition-transform duration-700 hover:scale-[1.035]"
                />

              </div>


              {/* Decorative dots */}
              <span className="absolute top-[18%] right-[18%] h-3 w-3 rounded-full bg-[#138A36] shadow-[0_0_0_8px_rgba(19,138,54,0.08)] animate-pulse" />

              <span className="absolute bottom-[20%] left-[19%] h-2.5 w-2.5 rounded-full bg-[#8BCB9D] shadow-[0_0_0_7px_rgba(139,203,157,0.12)] animate-pulse" />

            </div>

          </div>


          {/* =====================================================
              TRUST METRICS
          ===================================================== */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E5E7E5] bg-white/90 shadow-sm backdrop-blur">

            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#E5E7E5]">

              {/* Shops */}
              <div className="px-4 py-4 text-center">

                <span className="block font-poppins text-xl md:text-2xl font-black text-[#138A36]">
                  {verifiedShopsCount}+
                </span>

                <span className="text-[10px] md:text-xs font-bold text-[#777777]">
                  Verified Shops
                </span>

              </div>


              {/* Products */}
              <div className="px-4 py-4 text-center">

                <span className="block font-poppins text-xl md:text-2xl font-black text-[#138A36]">
                  10K+
                </span>

                <span className="text-[10px] md:text-xs font-bold text-[#777777]">
                  Local Products
                </span>

              </div>


              {/* Customers */}
              <div className="px-4 py-4 text-center">

                <span className="block font-poppins text-xl md:text-2xl font-black text-[#138A36]">
                  1.2K+
                </span>

                <span className="text-[10px] md:text-xs font-bold text-[#777777]">
                  Happy Customers
                </span>

              </div>


              {/* Enquiries */}
              <div className="px-4 py-4 text-center">

                <span className="block font-poppins text-xl md:text-2xl font-black text-[#138A36]">
                  5K+
                </span>

                <span className="text-[10px] md:text-xs font-bold text-[#777777]">
                  Enquiries Sent
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
          2. CUSTOMER AND MERCHANT SPLIT CARDS
      ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 space-y-12">

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CUSTOMER CARD */}
          <div className="bg-white border-2 border-[#E5E7E5] hover:border-[#138A36] rounded-3xl p-6 md:p-8 space-y-5 transition-all shadow-xs flex flex-col justify-between group">

            <div className="space-y-3">

              <div className="w-12 h-12 bg-[#EAF7EE] text-[#138A36] rounded-2xl flex items-center justify-center">

                <User className="w-6 h-6" />

              </div>

              <span className="text-xs font-extrabold uppercase tracking-widest text-[#138A36] font-mono">
                For Shoppers
              </span>

              <h3 className="text-2xl font-black text-[#111111] font-poppins">
                I am a Customer
              </h3>

              <p className="text-xs md:text-sm text-[#666666] leading-relaxed font-medium">
                Discover nearby shops, find products, enquire about availability, save favourites and reserve products for pickup.
              </p>

            </div>


            <div className="pt-2 space-y-2">

              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal("customer") : null}
                className="w-full bg-white hover:bg-gray-50 text-[#111111] hover:text-[#138A36] border-2 border-[#E5E7E5] hover:border-[#138A36] font-extrabold text-sm py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >

                <span>
                  User Login
                </span>

                <ArrowRight className="w-4 h-4 text-[#138A36]" />

              </button>

              <p className="text-[11px] text-center text-[#666666] font-semibold">
                New here? Explore GrowLocal to discover nearby retail.
              </p>

            </div>

          </div>


          {/* MERCHANT CARD */}
          <div className="bg-[#111111] text-white rounded-3xl p-6 md:p-8 space-y-5 transition-all shadow-md flex flex-col justify-between relative overflow-hidden group">

            <div className="space-y-3 z-10">

              <div className="w-12 h-12 bg-white/10 text-green-400 rounded-2xl flex items-center justify-center border border-white/10">

                <Store className="w-6 h-6" />

              </div>

              <span className="text-xs font-extrabold uppercase tracking-widest text-green-400 font-mono">
                For Retail Businesses
              </span>

              <h3 className="text-2xl font-black text-white font-poppins">
                I am a Merchant
              </h3>

              <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-medium">
                List your shop, showcase products, receive customer enquiries and turn local demand into real customers.
              </p>

            </div>


            <div className="pt-2 space-y-2 z-10">

              <button
                onClick={() => onOpenAuthModal ? onOpenAuthModal("merchant") : null}
                className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white font-extrabold text-sm py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-101"
              >

                <span>
                  Merchant Login
                </span>

                <ArrowRight className="w-4 h-4" />

              </button>

              <p className="text-[11px] text-center text-slate-400 font-semibold">
                Want to grow your local business? Join 230+ Nagpur shops.
              </p>

            </div>

          </div>

        </section>


        {/* =======================================================
            3. YOUR LOCAL MARKETPLACE
        ======================================================= */}
        <section className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-3xl p-6 md:p-10 space-y-8">

          <div className="max-w-3xl mx-auto text-center space-y-3">

            <span className="text-xs font-extrabold uppercase tracking-wider text-[#138A36] bg-[#EAF7EE] px-3 py-1 rounded-full border border-[#DDF3E3]">
              The Local Retail Friction Solved
            </span>

            <h2 className="text-2xl md:text-4xl font-black text-[#111111] font-poppins">
              Your Local Marketplace, Reimagined.
            </h2>

            <p className="text-xs md:text-sm text-[#666666] leading-relaxed font-medium">
              Finding something nearby shouldn't mean calling multiple shops or travelling from store to store. GrowLocal connects customer demand directly with verified local businesses.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-3 shadow-xs">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>

              <h3 className="font-extrabold text-base text-[#111111] font-poppins">
                1. DISCOVER LOCAL
              </h3>

              <p className="text-xs text-[#666666] leading-relaxed">
                Find nearby verified shops and products in your area without travelling store-to-store.
              </p>

            </div>


            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-3 shadow-xs">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>

              <h3 className="font-extrabold text-base text-[#111111] font-poppins">
                2. CONNECT DIRECTLY
              </h3>

              <p className="text-xs text-[#666666] leading-relaxed">
                Ask shops about availability, size, price, and alternatives in real-time chat.
              </p>

            </div>


            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-3 shadow-xs">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>

              <h3 className="font-extrabold text-base text-[#111111] font-poppins">
                3. BUY LOCAL
              </h3>

              <p className="text-xs text-[#666666] leading-relaxed">
                Reserve your product for pickup or home delivery with complete price transparency.
              </p>

            </div>

          </div>

        </section>


        {/* =======================================================
            4. HOW GROWLOCAL WORKS
        ======================================================= */}
        <section
          id="how-it-works-section"
          className="space-y-8 scroll-mt-24"
        >

          <div className="text-center max-w-2xl mx-auto space-y-2">

            <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111] font-poppins">
              How GrowLocal Works
            </h2>

            <p className="text-xs md:text-sm text-[#666666]">
              A simple 5-step journey from discovering nearby items to holding them in your hands.
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            {[
              {
                step: 1,
                title: "1. Search & Discover",
                desc: "Find verified local shops and products near you.",
                icon: Search
              },
              {
                step: 2,
                title: "2. Enquire or Ask",
                desc: "Ask a shop about availability, size, price or alternatives.",
                icon: MessageSquare
              },
              {
                step: 3,
                title: "3. Get Responses",
                desc: "Receive availability and price responses from nearby shops.",
                icon: CheckCircle2
              },
              {
                step: 4,
                title: "4. Reserve & Pick Up",
                desc: "Reserve your item and visit the shop for pickup.",
                icon: ShoppingBag
              },
              {
                step: 5,
                title: "5. Support Local",
                desc: "Your purchase helps local neighborhood businesses grow.",
                icon: Heart
              }
            ].map((item) => {

              const StepIcon = item.icon;

              return (

                <div
                  key={item.step}
                  className="bg-white p-5 rounded-2xl border border-[#E5E7E5] space-y-3 relative shadow-xs flex flex-col justify-between"
                >

                  <div className="space-y-3">

                    <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">

                      <StepIcon className="w-5 h-5" />

                    </div>

                    <h3 className="font-extrabold text-sm text-[#111111] font-poppins">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#666666] leading-relaxed">
                      {item.desc}
                    </p>

                  </div>

                  <span className="text-[10px] font-black text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded font-mono self-start">
                    Step 0{item.step}
                  </span>

                </div>

              );

            })}

          </div>

        </section>


        {/* =======================================================
            5. TELL SHOPS WHAT YOU NEED
        ======================================================= */}
        <section className="bg-gradient-to-br from-[#111111] to-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-xl space-y-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="space-y-3 max-w-xl">

              <span className="bg-green-500 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                Core Differentiating Feature
              </span>

              <h2 className="text-2xl md:text-4xl font-extrabold font-poppins">
                Can't find what you need?
              </h2>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                Instead of searching endlessly, tell nearby shops what you're looking for and let local businesses respond directly with availability & prices.
              </p>


              <div className="pt-2">

                <button
                  onClick={onOpenDemandRequest}
                  className="bg-[#138A36] hover:bg-[#0B6B2B] text-white font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >

                  <Sparkles className="w-4 h-4" />

                  <span>
                    Tell Shops What You Need →
                  </span>

                </button>

              </div>

            </div>


            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 w-full md:w-80 space-y-3 backdrop-blur-md shrink-0">

              <div className="flex items-center justify-between border-b border-white/10 pb-2">

                <span className="text-[10px] font-mono text-green-400 uppercase font-bold">
                  Live Demand Request
                </span>

                <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold">
                  Within 3 km
                </span>

              </div>


              <div>

                <p className="font-extrabold text-sm text-white">
                  Black Formal Shirt
                </p>

                <p className="text-xs text-slate-300 font-mono">
                  Size: M • Budget: ₹1,500
                </p>

              </div>


              <div className="p-2.5 bg-white/10 rounded-xl text-[11px] text-emerald-300 font-bold flex items-center gap-2">

                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />

                <span>
                  3 Nearby Shops Responded
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =======================================================
            6. POPULAR CATEGORIES
        ======================================================= */}
        <section className="space-y-4">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg md:text-xl font-extrabold text-[#111111] font-poppins">
                Popular Categories
              </h2>

              <p className="text-xs text-[#666666]">
                Browse products across top local retail sectors
              </p>

            </div>


            <button
              onClick={() => onSearch("")}
              className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1"
            >

              <span>
                View All
              </span>

              <ChevronRight className="w-4 h-4" />

            </button>

          </div>


          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">

            {categories.map((cat) => {

              const IconComponent = iconMap[cat.icon] || ShoppingBag;

              return (

                <button
                  key={cat.id}
                  onClick={() => onSearch(cat.name)}
                  className="flex flex-col items-center gap-2 min-w-[95px] p-3.5 bg-white rounded-2xl border border-[#E5E7E5] hover:border-[#138A36] hover:bg-[#EAF7EE] transition-all card-shadow-hover group shrink-0 cursor-pointer"
                >

                  <div className="w-12 h-12 bg-[#F7F8F7] group-hover:bg-[#138A36] text-[#138A36] group-hover:text-white rounded-xl flex items-center justify-center transition-colors">

                    <IconComponent className="w-6 h-6" />

                  </div>

                  <span className="text-xs font-semibold text-[#111111] group-hover:text-[#138A36] transition-colors">
                    {cat.name}
                  </span>

                </button>

              );

            })}

          </div>

        </section>


        {/* =======================================================
            7. NEARBY VERIFIED SHOPS
        ======================================================= */}
        <section className="space-y-4">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg md:text-xl font-extrabold text-[#111111] font-poppins">
                Top Verified Shops Near You
              </h2>

              <p className="text-xs text-[#666666]">
                Discover trusted local businesses within your area.
              </p>

            </div>


            <button
              onClick={() => onSearch("")}
              className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1"
            >

              <span>
                Explore All ({shops.length})
              </span>

              <ChevronRight className="w-4 h-4" />

            </button>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {shops.map((shop) => (

              <ShopCard
                key={shop.id}
                shop={shop}
                onClick={onSelectShop}
              />

            ))}

          </div>

        </section>


        {/* =======================================================
            8. TRENDING PRODUCTS
        ======================================================= */}
        <section className="space-y-4">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg md:text-xl font-extrabold text-[#111111] font-poppins">
                Trending Products Available Today
              </h2>

              <p className="text-xs text-[#666666]">
                Inspected and available in nearby store inventory
              </p>

            </div>


            <button
              onClick={() => onSearch("")}
              className="text-xs font-bold text-[#138A36] hover:underline"
            >
              See All
            </button>

          </div>


          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

            {products.map((prod) => (

              <ProductCard
                key={prod.id}
                product={prod}
                onClick={onSelectProduct}
                onAskAvailability={(p) => onSelectProduct(p.id)}
              />

            ))}

          </div>

        </section>


        {/* =======================================================
            9. WHY SHOP WITH GROWLOCAL
        ======================================================= */}
        <section className="space-y-6">

          <div className="text-center max-w-xl mx-auto space-y-1">

            <h2 className="text-2xl font-extrabold text-[#111111] font-poppins">
              Why Shop With GrowLocal?
            </h2>

            <p className="text-xs text-[#666666]">
              Built for transparency, speed, and neighborhood community trust.
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Verified */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">

                <ShieldCheck className="w-5 h-5" />

              </div>

              <h3 className="font-bold text-sm text-[#111111]">
                Verified Local Shops
              </h3>

              <p className="text-xs text-[#666666]">
                Discover trusted and background-verified businesses.
              </p>

            </div>


            {/* Communication */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">

                <MessageSquare className="w-5 h-5" />

              </div>

              <h3 className="font-bold text-sm text-[#111111]">
                Real-Time Communication
              </h3>

              <p className="text-xs text-[#666666]">
                Chat directly with shops about availability and pricing.
              </p>

            </div>


            {/* Nearby */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">

                <MapPin className="w-5 h-5" />

              </div>

              <h3 className="font-bold text-sm text-[#111111]">
                Nearby & Easy
              </h3>

              <p className="text-xs text-[#666666]">
                Find what you need within your preferred distance.
              </p>

            </div>


            {/* Reserve */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">

                <ShoppingBag className="w-5 h-5" />

              </div>

              <h3 className="font-bold text-sm text-[#111111]">
                Reserve & Pick Up
              </h3>

              <p className="text-xs text-[#666666]">
                Know it's available before you travel to the store.
              </p>

            </div>


            {/* Security */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">

                <Lock className="w-5 h-5" />

              </div>

              <h3 className="font-bold text-sm text-[#111111]">
                Safe & Secure
              </h3>

              <p className="text-xs text-[#666666]">
                Your communication and account data are protected.
              </p>

            </div>


            {/* Local */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">

              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">

                <Heart className="w-5 h-5" />

              </div>

              <h3 className="font-bold text-sm text-[#111111]">
                Support Local
              </h3>

              <p className="text-xs text-[#666666]">
                Every local purchase helps local businesses grow.
              </p>

            </div>

          </div>

        </section>


        {/* =======================================================
            10. MERCHANT VALUE PROPOSITION
        ======================================================= */}
        <section className="bg-[#EAF7EE] border border-[#DDF3E3] rounded-3xl p-6 md:p-10 space-y-6">

          <div className="max-w-2xl space-y-2">

            <span className="text-xs font-extrabold uppercase tracking-wider text-[#138A36] bg-white px-3 py-1 rounded-full border border-[#DDF3E3]">
              Merchant Acquisition Funnel
            </span>

            <h2 className="text-2xl md:text-3xl font-black text-[#111111] font-poppins">
              Turn Local Demand Into Customers.
            </h2>

            <p className="text-xs md:text-sm text-[#555555] leading-relaxed">
              GrowLocal helps local businesses discover what nearby customers want, respond to demand and convert enquiries into real visits.
            </p>

          </div>


          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold text-[#111111] py-2">

            <span className="bg-white px-3 py-2 rounded-xl border border-[#DDF3E3] shrink-0">
              Customer Demand
            </span>

            <span className="text-[#138A36]">→</span>

            <span className="bg-white px-3 py-2 rounded-xl border border-[#DDF3E3] shrink-0">
              Enquiry
            </span>

            <span className="text-[#138A36]">→</span>

            <span className="bg-white px-3 py-2 rounded-xl border border-[#DDF3E3] shrink-0">
              Business Response
            </span>

            <span className="text-[#138A36]">→</span>

            <span className="bg-white px-3 py-2 rounded-xl border border-[#DDF3E3] shrink-0">
              Reservation
            </span>

            <span className="text-[#138A36]">→</span>

            <span className="bg-white px-3 py-2 rounded-xl border border-[#DDF3E3] shrink-0">
              Store Visit
            </span>

            <span className="text-[#138A36]">→</span>

            <span className="bg-white px-3 py-2 rounded-xl border border-[#DDF3E3] shrink-0">
              Customer
            </span>

            <span className="text-[#138A36]">→</span>

            <span className="bg-white px-3 py-2 rounded-xl border border-[#DDF3E3] shrink-0 text-[#138A36] font-black">
              Business Growth
            </span>

          </div>


          <div>

            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal("merchant") : null}
              className="bg-[#138A36] hover:bg-[#0B6B2B] text-white font-extrabold text-xs md:text-sm px-6 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >

              <Store className="w-4 h-4" />

              <span>
                Become a GrowLocal Merchant →
              </span>

            </button>

          </div>

        </section>


        {/* =======================================================
            11. CREATOR / BUSINESS GROWTH
        ======================================================= */}
        <section
          id="community-section"
          className="bg-white border border-[#E5E7E5] rounded-3xl p-6 md:p-8 space-y-4 shadow-xs scroll-mt-24"
        >

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="space-y-1">

              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#138A36] bg-[#EAF7EE] px-2.5 py-1 rounded-md">
                Growth Ecosystem
              </span>

              <h2 className="text-xl md:text-2xl font-black text-[#111111] font-poppins">
                More Than Discovery.
              </h2>

              <p className="text-xs text-[#666666]">
                GrowLocal helps businesses grow through local creators, offers, referrals and measurable customer acquisition.
              </p>

            </div>


            <div className="bg-[#111111] text-white text-xs font-mono font-bold px-4 py-2 rounded-xl border border-[#138A36]/40 shrink-0">
              "Don't just measure views. Measure customers."
            </div>

          </div>


          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-bold pt-2">

            <div className="bg-[#F7F8F7] p-2.5 rounded-xl border border-[#E5E7E5]">
              Reach
            </div>

            <div className="bg-[#F7F8F7] p-2.5 rounded-xl border border-[#E5E7E5]">
              Click
            </div>

            <div className="bg-[#F7F8F7] p-2.5 rounded-xl border border-[#E5E7E5]">
              Enquiry
            </div>

            <div className="bg-[#F7F8F7] p-2.5 rounded-xl border border-[#E5E7E5]">
              Reservation
            </div>

            <div className="bg-[#F7F8F7] p-2.5 rounded-xl border border-[#E5E7E5]">
              Visit
            </div>

            <div className="bg-[#EAF7EE] text-[#138A36] p-2.5 rounded-xl border border-[#DDF3E3] font-[#138A36] font-black">
              Purchase
            </div>

          </div>

        </section>


        {/* =======================================================
            12. FINAL CTA
        ======================================================= */}
        <section className="bg-gradient-to-br from-[#138A36] to-[#0B6B2B] text-white rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">

          <div className="max-w-2xl mx-auto space-y-3">

            <h2 className="text-3xl md:text-4xl font-black font-poppins tracking-tight">
              Ready to shop local?
            </h2>

            <p className="text-xs md:text-sm text-[#DDF3E3] font-medium leading-relaxed">
              Find nearby businesses, discover products and connect directly with verified local shops.
            </p>

          </div>


          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            <button
              onClick={scrollToTop}
              className="w-full sm:w-auto bg-white hover:bg-gray-100 text-[#111111] font-extrabold text-xs md:text-sm px-7 py-3.5 rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Start Exploring
            </button>


            <button
              onClick={onOpenDemandRequest}
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-extrabold text-xs md:text-sm px-7 py-3.5 rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >

              <Sparkles className="w-4 h-4 text-emerald-400" />

              <span>
                Tell Shops What You Need
              </span>

            </button>

          </div>


          <div className="pt-4 border-t border-white/20 text-xs text-[#DDF3E3] space-y-1">

            <p className="font-semibold">
              Are you a business owner?
            </p>

            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal("merchant") : null}
              className="text-white underline font-extrabold hover:text-amber-300 cursor-pointer"
            >
              List Your Shop →
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}
