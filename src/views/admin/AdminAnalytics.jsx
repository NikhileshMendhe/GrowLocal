import React, { useState } from 'react';
import { Compass, Flame, MapPin, TrendingUp, Users, Store, ShoppingBag, DollarSign } from 'lucide-react';

export default function AdminAnalytics({
  demandHeatmap,
  searchDemandGaps,
  popularSearches,
  onShowToast
}) {
  const [activeSubTab, setActiveSubTab] = useState("demandHeatmap"); // 'demandHeatmap', 'intelligence', 'platformAnalytics'

  return (
    <div className="space-y-6">
      
      {/* SUB NAVIGATION */}
      <div className="flex items-center gap-2 bg-white border border-[#E5E7E5] rounded-3xl p-2 shadow-xs">
        <button
          onClick={() => setActiveSubTab("demandHeatmap")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === "demandHeatmap" ? "bg-[#138A36] text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Nagpur Demand Heatmap</span>
        </button>
        <button
          onClick={() => setActiveSubTab("intelligence")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === "intelligence" ? "bg-[#138A36] text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Demand Intelligence & Supply Gaps</span>
        </button>
      </div>

      {/* DEMAND HEATMAP VIEW */}
      {activeSubTab === "demandHeatmap" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
            <h2 className="text-base font-extrabold text-[#111111] mb-2 font-poppins flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#138A36]" /> Local Demand Heatmap — Nagpur Commercial Clusters
            </h2>
            <p className="text-xs text-gray-500 mb-6">Geographic concentration of customer enquiries and product searches across Nagpur localities</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demandHeatmap.map((cluster, idx) => (
                <div key={idx} className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-3xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#138A36] bg-[#EAF7EE] px-2.5 py-1 rounded-md border border-[#DDF3E3]">
                      Demand Score: {cluster.demandScore}/100
                    </span>
                    <span className="text-xs font-bold text-gray-400 font-mono">
                      {cluster.enquiriesToday} Enquiries Today
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#111111] font-poppins">{cluster.locality}</h3>
                  <p className="text-xs text-gray-600">Top Category: <strong>{cluster.topCategory}</strong></p>

                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cluster.demandScore}%` }}
                      className="bg-[#138A36] h-full rounded-full"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEMAND INTELLIGENCE VIEW */}
      {activeSubTab === "intelligence" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase">Most Requested Product</span>
              <p className="text-xl font-black text-[#138A36] font-poppins mt-1">Black Formal Shirt</p>
              <span className="text-xs text-gray-400 font-medium">84 requests in Butibori</span>
            </div>
            <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase">Highest Demand Area</span>
              <p className="text-xl font-black text-amber-700 font-poppins mt-1">Butibori Zone</p>
              <span className="text-xs text-gray-400 font-medium">142 enquiries today</span>
            </div>
            <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-500 uppercase">Most Searched Category</span>
              <p className="text-xl font-black text-purple-700 font-poppins mt-1">Men's Apparel</p>
              <span className="text-xs text-gray-400 font-medium">42% total search volume</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
            <h3 className="font-extrabold text-base text-[#111111] mb-4 font-poppins">Unfulfilled Customer Demand Summary</h3>
            <div className="space-y-3">
              {searchDemandGaps.map((gap, i) => (
                <div key={i} className="p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#111111]">{gap.query}</span>
                    <span className="text-gray-500 ml-2 font-medium">({gap.searchCount} searches in {gap.location})</span>
                  </div>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {gap.actionSuggested}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
