import React, { useState } from 'react';
import { Tag, Sparkles, Plus, CheckCircle2, PauseCircle, Trash2, Calendar, Store } from 'lucide-react';

export default function AdminOffers({
  offers,
  onToggleFeatureOffer,
  onToggleOfferStatus,
  onShowToast
}) {
  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#138A36]" /> Offers & Promotions Management ({offers.length})
          </h2>
          <p className="text-xs text-gray-500">Approve, pause, feature, or extend merchant promotional deals across Nagpur customer apps</p>
        </div>
      </div>

      {/* OFFERS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((off) => (
          <div key={off.id} className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {off.discount}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  off.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                }`}>
                  {off.status}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-[#111111] font-poppins leading-tight">{off.title}</h3>
              <p className="text-xs text-gray-500">Merchant: <strong>{off.merchant}</strong> • Item: {off.product}</p>

              <div className="bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Offer Price</span>
                  <span className="text-lg font-black text-[#138A36] font-mono">₹{off.offerPrice}</span>
                  <span className="text-xs text-gray-400 line-through ml-1">₹{off.originalPrice}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Redemptions</span>
                  <span className="font-bold text-gray-800">{off.redemptions} picked up</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7E5] flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium text-[11px]">{off.startDate} to {off.endDate}</span>
              <button
                onClick={() => {
                  onToggleOfferStatus(off.id);
                  onShowToast(`Offer '${off.title}' status updated`);
                }}
                className="font-bold text-[#138A36] hover:underline"
              >
                {off.status === "Active" ? "Pause Offer" : "Activate Offer"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
