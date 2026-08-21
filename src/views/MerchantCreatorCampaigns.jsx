import React, { useState } from 'react';
import { Sparkles, Users, Video, DollarSign, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';

export default function MerchantCreatorCampaigns({ creators, onShowToast }) {
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [budget, setBudget] = useState("5000");

  const handleLaunchCampaign = (e) => {
    e.preventDefault();
    onShowToast(`Campaign launched with ${selectedCreator.name}! Tracked reservations enabled.`);
    setSelectedCreator(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#138A36] to-[#0B6B2B] text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            🌱 GrowLocal Creators
          </span>
          <h1 className="text-2xl font-extrabold font-poppins">Local Creator Marketing Campaigns</h1>
          <p className="text-xs text-[#DDF3E3] max-w-md">
            Partner with top Nagpur local creators. Track campaign ROI from video reach down to actual store reservations & visits.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs space-y-1 text-center shrink-0">
          <span className="text-[#DDF3E3]">Average Campaign Conversion</span>
          <p className="text-xl font-black text-white">5.4% Visit Rate</p>
        </div>
      </div>

      {/* Campaign Funnel Flow */}
      <div className="bg-white p-5 rounded-3xl border border-[#E5E7E5] shadow-xs">
        <p className="text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-3 text-center">Tracked Customer Funnel</p>
        <div className="flex items-center justify-around gap-2 text-center text-xs font-bold">
          <div className="p-2 bg-[#F7F8F7] rounded-xl flex-1">Reach</div>
          <ArrowRight className="w-4 h-4 text-[#138A36] shrink-0" />
          <div className="p-2 bg-[#F7F8F7] rounded-xl flex-1">Click</div>
          <ArrowRight className="w-4 h-4 text-[#138A36] shrink-0" />
          <div className="p-2 bg-[#F7F8F7] rounded-xl flex-1">Enquiry</div>
          <ArrowRight className="w-4 h-4 text-[#138A36] shrink-0" />
          <div className="p-2 bg-[#F7F8F7] rounded-xl flex-1">Reservation</div>
          <ArrowRight className="w-4 h-4 text-[#138A36] shrink-0" />
          <div className="p-2 bg-[#EAF7EE] text-[#138A36] rounded-xl flex-1">Store Visit</div>
        </div>
      </div>

      {/* Local Creators Grid */}
      <div>
        <h3 className="text-lg font-bold text-[#111111] mb-4">Available Nagpur Creators</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creators.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-[#E5E7E5] overflow-hidden card-shadow-hover p-5 space-y-4">
              <div className="flex items-center gap-3">
                <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#138A36]" />
                <div>
                  <h4 className="font-bold text-sm text-[#111111]">{c.name}</h4>
                  <span className="text-xs text-[#138A36] font-semibold">{c.handle}</span>
                  <p className="text-[11px] text-[#666666]">{c.niche} · {c.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#F7F8F7] p-2.5 rounded-xl">
                <div>
                  <span className="text-[10px] text-[#666666]">Followers</span>
                  <p className="font-bold text-[#111111]">{c.followers}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666]">Avg Views</span>
                  <p className="font-bold text-[#111111]">{c.avgViews}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666]">Conv. Rate</span>
                  <p className="font-bold text-[#138A36]">{c.conversionRate}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-[#111111]">{c.pricing}</span>
                <button
                  onClick={() => setSelectedCreator(c)}
                  className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Collaborate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Launch Modal */}
      {selectedCreator && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E5E7E5]">
            <h3 className="text-lg font-bold text-[#111111]">Launch Campaign with {selectedCreator.name}</h3>

            <form onSubmit={handleLaunchCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111111] mb-1">Target Product / Offer</label>
                <input type="text" defaultValue="Black Oversized T-Shirt @ ₹699 Offer" className="w-full p-2.5 bg-[#F7F8F7] border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-[#111111] mb-1">Campaign Budget (₹)</label>
                <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full p-2.5 bg-[#F7F8F7] border border-[#138A36] font-bold text-[#138A36] rounded-xl" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedCreator(null)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#138A36] text-white font-bold rounded-xl hover:bg-[#0F752C]">Confirm & Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
