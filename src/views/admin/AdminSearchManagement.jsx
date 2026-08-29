import React from 'react';
import { Search, Flame, AlertCircle, TrendingUp, Sparkles, Filter, ArrowRight } from 'lucide-react';

export default function AdminSearchManagement({
  popularSearches,
  searchDemandGaps,
  onNavigate,
  onShowToast
}) {
  return (
    <div className="space-y-6">
      
      {/* DEMAND GAPS HIGHLIGHT BANNER */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-6 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
          <AlertCircle className="w-4 h-4 text-amber-200" />
          <span>Strategic Merchant Onboarding Intelligence</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black font-poppins">Customers Couldn't Find (Local Supply Gaps)</h2>
        <p className="text-xs text-amber-100 max-w-3xl leading-relaxed">
          These items represent active customer search volume in Nagpur where local inventory or verified merchant supply was unavailable. Admin can use this report to onboard missing retail stores or broadcast demand alerts to nearby shops.
        </p>
      </div>

      {/* "CUSTOMERS COULDN'T FIND" TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
        <h3 className="font-extrabold text-base text-[#111111] mb-4 font-poppins flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" /> Unfulfilled Local Searches in Nagpur
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4 rounded-l-xl">Searched Product / Keyword</th>
                <th className="py-3.5 px-4">Search Volume</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Nagpur Locality</th>
                <th className="py-3.5 px-4">Supply Status</th>
                <th className="py-3.5 px-4">Recommended Action</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {searchDemandGaps.map((gap, idx) => (
                <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-black text-[#111111]">{gap.query}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-700">{gap.searchCount} searches</td>
                  <td className="py-3.5 px-4 text-gray-600">{gap.category}</td>
                  <td className="py-3.5 px-4 text-gray-600">{gap.location}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                      {gap.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">{gap.actionSuggested}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        onShowToast(`Broadcasting demand alert for '${gap.query}' to ${gap.location} merchants`);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                    >
                      Broadcast Alert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPULAR SEARCH TRENDS TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
        <h3 className="font-extrabold text-base text-[#111111] mb-4 font-poppins flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#138A36]" /> Top Trending Searches
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularSearches.map((ps, idx) => (
            <div key={idx} className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-[#138A36] uppercase tracking-wider bg-[#EAF7EE] px-2 py-0.5 rounded-md">
                  {ps.category}
                </span>
                <h4 className="font-extrabold text-sm text-[#111111] mt-1">{ps.keyword}</h4>
                <p className="text-xs text-gray-500 font-medium">{ps.volume} searches</p>
              </div>
              <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-1 rounded-full">
                {ps.growth}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
