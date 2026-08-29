import React from 'react';
import { TrendingUp, Users, ArrowDown, Sparkles, DollarSign, CheckCircle2 } from 'lucide-react';

export default function AdminCampaigns({
  campaigns,
  onShowToast
}) {
  return (
    <div className="space-y-6">
      
      {/* CAMPAIGN FUNNEL HERO NOTICE */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>GrowLocal Creator Commerce Attribution Model</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black font-poppins">Creator Campaigns & Customers Generated</h2>
        <p className="text-xs text-purple-100 max-w-3xl leading-relaxed">
          GrowLocal measures creator campaigns by <strong>Customers Generated & Completed In-Store Purchases</strong> rather than vanity reel view counts. Track complete conversion funnels from social reach to verified shop visits.
        </p>
      </div>

      {/* CAMPAIGNS CARDS & FUNNEL METRICS */}
      <div className="space-y-6">
        {campaigns.map((camp) => (
          <div key={camp.id} className="bg-white border border-[#E5E7E5] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  Active Creator Campaign
                </span>
                <h3 className="font-extrabold text-lg text-[#111111] mt-1 font-poppins">{camp.campaignName}</h3>
                <p className="text-xs text-gray-500">Merchant: <strong>{camp.merchant}</strong> • Creator: <strong>{camp.creator}</strong></p>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div className="bg-[#EAF7EE] border border-[#DDF3E3] p-3 rounded-2xl">
                  <span className="text-[10px] font-bold text-[#0B6B2B] uppercase block">Customers Generated</span>
                  <span className="text-2xl font-black text-[#138A36] font-poppins">{camp.customersGenerated} Buyers</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Campaign ROI</span>
                  <span className="text-2xl font-black text-purple-900 font-poppins">{camp.roi}</span>
                </div>
              </div>
            </div>

            {/* FULL CAMPAIGN FUNNEL VISUALIZATION */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Full Campaign Funnel Attribution</h4>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl">
                  <span className="text-base font-black text-[#111111] block">{camp.reach}</span>
                  <span className="text-[10px] text-gray-500 font-bold">1. Social Reach</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl">
                  <span className="text-base font-black text-blue-900 block">{camp.clicks}</span>
                  <span className="text-[10px] text-blue-700 font-bold">2. Store Clicks</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl">
                  <span className="text-base font-black text-amber-900 block">{camp.enquiries}</span>
                  <span className="text-[10px] text-amber-700 font-bold">3. Product Enquiries</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl">
                  <span className="text-base font-black text-indigo-900 block">{camp.reservations}</span>
                  <span className="text-[10px] text-indigo-700 font-bold">4. Reservations</span>
                </div>
                <div className="bg-teal-50 border border-teal-200 p-3 rounded-2xl">
                  <span className="text-base font-black text-teal-900 block">{camp.visits}</span>
                  <span className="text-[10px] text-teal-700 font-bold">5. Shop Visits</span>
                </div>
                <div className="bg-[#EAF7EE] border border-[#DDF3E3] p-3 rounded-2xl">
                  <span className="text-base font-black text-[#138A36] block">{camp.purchases}</span>
                  <span className="text-[10px] text-[#0B6B2B] font-bold">6. Paid Purchases</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
