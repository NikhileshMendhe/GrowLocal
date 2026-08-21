import React from 'react';
import { TrendingUp, Users, ShoppingBag, Eye, DollarSign, Sparkles, MapPin } from 'lucide-react';

export default function MerchantAnalytics({ stats }) {
  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#111111] to-[#138A36] text-white p-6 rounded-3xl shadow-lg space-y-2">
        <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Demand Intelligence Engine
        </span>
        <h1 className="text-2xl font-extrabold font-poppins">Don't just measure views. Measure customers.</h1>
        <p className="text-xs text-[#DDF3E3] max-w-lg">
          GrowLocal connects real local customer search demand in Nagpur directly to your store inventory and verified foot traffic.
        </p>
      </div>

      {/* Conversion Funnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] space-y-1">
          <p className="text-[11px] font-bold text-[#666666] uppercase">1. Customer Searches</p>
          <p className="text-xl font-black text-[#111111]">1,420</p>
          <span className="text-[10px] text-[#138A36]">In Butibori Radius</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] space-y-1">
          <p className="text-[11px] font-bold text-[#666666] uppercase">2. Direct Enquiries</p>
          <p className="text-xl font-black text-blue-600">124</p>
          <span className="text-[10px] text-blue-700">Stock Availability</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] space-y-1">
          <p className="text-[11px] font-bold text-[#666666] uppercase">3. Offers Sent</p>
          <p className="text-xl font-black text-[#138A36]">98</p>
          <span className="text-[10px] text-[#138A36]">Custom Price Quotes</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] space-y-1">
          <p className="text-[11px] font-bold text-[#666666] uppercase">4. Reservations</p>
          <p className="text-xl font-black text-amber-600">42</p>
          <span className="text-[10px] text-amber-700">Held at Store</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] space-y-1 bg-[#EAF7EE]">
          <p className="text-[11px] font-bold text-[#138A36] uppercase">5. Store Visits</p>
          <p className="text-xl font-black text-[#138A36]">34</p>
          <span className="text-[10px] font-bold text-[#138A36]">Completed Sales</span>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7E5] card-shadow space-y-4">
          <h3 className="text-base font-bold text-[#111111]">Peak Demand Times in Nagpur</h3>
          <p className="text-xs text-[#666666]">When nearby customers search for fashion & clothing</p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111111]">5:00 PM – 8:30 PM (Evening Peak)</span>
              <span className="font-bold text-[#138A36]">48% of total daily searches</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#138A36] w-[48%]"></div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="font-semibold text-[#111111]">12:00 PM – 3:00 PM (Lunch Break)</span>
              <span className="font-bold text-blue-600">32% of total daily searches</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[32%]"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5E7E5] card-shadow space-y-4">
          <h3 className="text-base font-bold text-[#111111]">Top Requested Sizes & Colors</h3>
          <p className="text-xs text-[#666666]">Stock recommendation for your store inventory</p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-[#F7F8F7] rounded-xl font-semibold">
              <span>Size L (Oversized Tees)</span>
              <span className="text-[#138A36]">42% Demand</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#F7F8F7] rounded-xl font-semibold">
              <span>Size M (Slim Fit Shirts)</span>
              <span className="text-[#138A36]">31% Demand</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#F7F8F7] rounded-xl font-semibold">
              <span>Black & Navy Blue Colors</span>
              <span className="text-[#138A36]">58% Demand</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
