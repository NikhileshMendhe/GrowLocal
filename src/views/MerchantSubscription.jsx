import React from 'react';
import { Check, Sparkles, Store, ShieldCheck, Zap } from 'lucide-react';

export default function MerchantSubscription({ onShowToast }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1 bg-[#EAF7EE] text-[#138A36] text-xs font-bold px-3 py-1 rounded-full border border-[#DDF3E3]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Merchant Growth Membership</span>
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] font-poppins">
          Simple, Demand-Based Pricing Plans
        </h1>
        <p className="text-xs md:text-sm text-[#666666] max-w-md mx-auto">
          Turn Nagpur local customer search demand into verified store foot traffic and real sales.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-[#111111]">Starter Free</h3>
              <p className="text-xs text-[#666666]">Essential listing for new local shops</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#111111]">₹0</span>
              <span className="text-xs text-[#666666]">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-[#111111]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Basic Shop Profile & Listing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Up to 10 Product Inventory Items</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>In-App Customer Chat</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Standard Location Radius (3 km)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onShowToast("Starter plan active!")}
            className="w-full bg-[#F7F8F7] hover:bg-gray-200 text-[#111111] font-bold text-xs py-3 rounded-xl transition-colors"
          >
            Current Plan
          </button>
        </div>

        {/* Grow Plan (Popular) */}
        <div className="bg-white rounded-3xl border-2 border-[#138A36] p-6 shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#138A36] text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-[#138A36]">Grow Business</h3>
              <p className="text-xs text-[#666666]">For growing stores wanting high conversion</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#138A36]">₹299</span>
              <span className="text-xs text-[#666666]">/ month proposed</span>
            </div>

            <ul className="space-y-2.5 text-xs text-[#111111]">
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Verified Merchant Badge (✓ Verified)</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Unlimited Product Catalog</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Custom Price Offer Generator in Chat</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Store Visit Reservation Engine</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Nagpur Customer Demand Analytics</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onShowToast("Subscribed to Grow Business plan!")}
            className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-md"
          >
            Upgrade to Grow Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-[#111111]">Pro Enterprise</h3>
              <p className="text-xs text-[#666666]">Full growth suite + Creator campaigns</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#111111]">₹799</span>
              <span className="text-xs text-[#666666]">/ month proposed</span>
            </div>

            <ul className="space-y-2.5 text-xs text-[#111111]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Everything in Grow Plan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>GrowLocal Creators Campaign Access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Priority Search Placement (10 km Radius)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Dedicated Local Account Manager</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onShowToast("Subscribed to Pro Enterprise plan!")}
            className="w-full bg-[#111111] hover:bg-black text-white font-bold text-xs py-3 rounded-xl transition-colors"
          >
            Choose Pro Plan
          </button>
        </div>
      </div>

      {/* Additional Monetization Model Notes */}
      <div className="bg-[#F7F8F7] border border-[#E5E7E5] p-6 rounded-3xl space-y-2 text-xs text-[#666666]">
        <h4 className="font-bold text-[#111111]">Proposed Flexible Commercial Model:</h4>
        <p>• Zero commission on normal walk-in customers.</p>
        <p>• Nominal commission only on creator campaign tracked sales & qualified store reservations.</p>
        <p>• Sponsored local store offers for peak shopping festivals in Nagpur.</p>
      </div>
    </div>
  );
}
