import React from 'react';
import { Sparkles, Eye, Plus, CheckCircle2, Star, MapPin, TrendingUp } from 'lucide-react';

export default function AdminCreators({
  creators,
  onShowToast
}) {
  return (
    <div className="space-y-6">
      
      {/* HERO BANNER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#138A36]" /> GrowLocal Local Creators Directory ({creators.length})
          </h2>
          <p className="text-xs text-gray-500">Local Nagpur influencers driving footfall and verified purchases to local retail stores</p>
        </div>
      </div>

      {/* CREATORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((c) => (
          <div key={c.id} className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-[#138A36]" />
                <div>
                  <h3 className="font-extrabold text-base text-[#111111] leading-tight font-poppins">{c.name}</h3>
                  <p className="text-xs text-[#138A36] font-bold">{c.handle} • {c.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5]">
                <div>
                  <span className="font-black text-[#111111] block">{c.followers}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Followers</span>
                </div>
                <div>
                  <span className="font-black text-blue-700 block">{c.avgViews}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Avg Reel Views</span>
                </div>
                <div>
                  <span className="font-black text-[#138A36] block">{c.conversionRate}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Conversion</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7E5] flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">{c.pricing}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                ✓ Verified Creator
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
