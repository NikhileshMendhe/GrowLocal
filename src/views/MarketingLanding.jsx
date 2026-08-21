import React from 'react';
import { Search, ArrowRight, Store, CheckCircle2, ShieldCheck, MapPin, MessageSquare, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';

export default function MarketingLanding({ onStartShopping, onOpenMerchantAuth }) {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative bg-white border-b border-[#E5E7E5] py-16 md:py-24 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-[#EAF7EE] text-[#138A36] text-xs font-extrabold px-4 py-1.5 rounded-full border border-[#DDF3E3]">
            🌱 Local Commerce & Business Growth Platform
          </span>

          <h1 className="text-4xl md:text-6xl font-black text-[#111111] font-poppins tracking-tight leading-tight">
            Find what you need. <span className="text-[#138A36]">Nearby.</span>
          </h1>

          <p className="text-base md:text-xl text-[#666666] max-w-2xl mx-auto leading-relaxed">
            Tell us what you're looking for and discover verified local shops in Nagpur that have it available in stock right now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartShopping}
              className="w-full sm:w-auto bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-sm md:text-base px-8 py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-102"
            >
              <Search className="w-5 h-5" />
              <span>Find Nearby Shops</span>
            </button>

            <button
              onClick={() => onOpenMerchantAuth("merchant")}
              className="w-full sm:w-auto bg-white border-2 border-[#138A36] text-[#138A36] hover:bg-[#EAF7EE] font-bold text-sm md:text-base px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              <span>List Your Shop Free</span>
            </button>
          </div>

          {/* Hero Visual Funnel Flow */}
          <div className="pt-12 max-w-4xl mx-auto">
            <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-3xl p-6 md:p-8 card-shadow grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center mx-auto font-bold">
                  1
                </div>
                <h4 className="font-bold text-xs md:text-sm text-[#111111]">Customer Demand</h4>
                <p className="text-[11px] text-[#666666]">Search product or photo</p>
              </div>

              <div className="space-y-1">
                <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center mx-auto font-bold">
                  2
                </div>
                <h4 className="font-bold text-xs md:text-sm text-[#111111]">Nearby Response</h4>
                <p className="text-[11px] text-[#666666]">Shop confirms stock</p>
              </div>

              <div className="space-y-1">
                <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center mx-auto font-bold">
                  3
                </div>
                <h4 className="font-bold text-xs md:text-sm text-[#111111]">Reservation</h4>
                <p className="text-[11px] text-[#666666]">Hold item at store</p>
              </div>

              <div className="space-y-1">
                <div className="w-10 h-10 bg-[#138A36] text-white rounded-xl flex items-center justify-center mx-auto font-bold">
                  4
                </div>
                <h4 className="font-bold text-xs md:text-sm text-[#111111]">Store Visit</h4>
                <p className="text-[11px] text-[#666666]">Walk in & buy local</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-20">
        {/* 2. Key Value Proposition for Customers */}
        <section className="bg-white rounded-3xl border border-[#E5E7E5] p-8 md:p-12 card-shadow space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#138A36] uppercase tracking-wider">Customer Experience</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#111111] font-poppins">
              What if you could know a nearby shop has what you need before you travel there?
            </h2>
            <p className="text-sm md:text-base text-[#666666]">
              No more wandering market streets in Nagpur hoping to find your size. GrowLocal delivers real live inventory answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F7F8F7] rounded-2xl space-y-2">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#111111]">Search & Photo Match</h3>
              <p className="text-xs text-[#666666]">Search products by text or snap a photo of any outfit or item.</p>
            </div>

            <div className="p-6 bg-[#F7F8F7] rounded-2xl space-y-2">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#111111]">Chat & Custom Quotes</h3>
              <p className="text-xs text-[#666666]">Chat directly with store cashiers and receive custom price offers.</p>
            </div>

            <div className="p-6 bg-[#F7F8F7] rounded-2xl space-y-2">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#111111]">Reserve & Visit</h3>
              <p className="text-xs text-[#666666]">Reserve the product in store so it's held for your evening visit.</p>
            </div>
          </div>
        </section>

        {/* 3. Business Value Proposition for Merchants */}
        <section className="bg-[#111111] text-white rounded-3xl p-8 md:p-12 shadow-2xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-[#138A36] uppercase tracking-wider bg-[#EAF7EE] px-3 py-1 rounded-full">
              For Local Merchants & Business Owners
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold font-poppins">
              Turn Local Demand Into Real Customers
            </h2>
            <p className="text-sm md:text-base text-gray-300">
              GrowLocal helps businesses understand what nearby customers want and convert that demand into real enquiries, reservations and visits.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            <div className="p-4 bg-white/10 rounded-2xl">
              <span className="text-xs text-gray-400">Step 1</span>
              <p className="font-bold text-sm text-white mt-1">Demand</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <span className="text-xs text-gray-400">Step 2</span>
              <p className="font-bold text-sm text-white mt-1">Enquiry</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <span className="text-xs text-gray-400">Step 3</span>
              <p className="font-bold text-sm text-white mt-1">Reservation</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <span className="text-xs text-gray-400">Step 4</span>
              <p className="font-bold text-sm text-white mt-1">Visit</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <span className="text-xs text-gray-400">Step 5</span>
              <p className="font-bold text-sm text-[#138A36] mt-1">Customer</p>
            </div>
            <div className="p-4 bg-[#138A36] rounded-2xl">
              <span className="text-xs text-white/80">Result</span>
              <p className="font-bold text-sm text-white mt-1">Growth</p>
            </div>
          </div>
        </section>

        {/* 4. Competition Positioning Matrix */}
        <section className="bg-white rounded-3xl border border-[#E5E7E5] p-8 card-shadow space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#111111] font-poppins">Strategic Positioning</h2>
            <p className="text-xs text-[#666666]">How GrowLocal brings unique value to local commerce ecosystem</p>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7E5] bg-[#F7F8F7] text-[#111111]">
                  <th className="p-3 font-bold">Platform</th>
                  <th className="p-3 font-bold">Primary Focus</th>
                  <th className="p-3 font-bold">GrowLocal Edge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E5]">
                <tr>
                  <td className="p-3 font-bold text-[#111111]">Google Maps</td>
                  <td className="p-3 text-[#666666]">Discovery / Search / Directions</td>
                  <td className="p-3 text-[#666666]">Real live SKU availability & direct chat quotes</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#111111]">Justdial</td>
                  <td className="p-3 text-[#666666]">Phone Directory & Business Discovery</td>
                  <td className="p-3 text-[#666666]">Product-first search, reservations & creator campaigns</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#111111]">Amazon / Ecommerce</td>
                  <td className="p-3 text-[#666666]">Delivery in 2-3 Days</td>
                  <td className="p-3 text-[#666666]">Instant same-day local store visit & trial</td>
                </tr>
                <tr className="bg-[#EAF7EE]">
                  <td className="p-3 font-extrabold text-[#138A36]">GrowLocal</td>
                  <td className="p-3 font-bold text-[#111111]">Demand → Local Response → Reservation → Customer</td>
                  <td className="p-3 font-bold text-[#138A36]">Complete offline store growth intelligence</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
