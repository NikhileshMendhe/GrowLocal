import React, { useState } from 'react';
import { Tag, Plus, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export default function MerchantOffers({ currentUser, onShowToast }) {
  const userKey = currentUser?.email?.toLowerCase().trim() || currentUser?.id || 'guest';
  const storageKey = `growlocal_merchant_offers_${userKey}`;

  const [offers, setOffers] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return [];
  });

  const [title, setTitle] = useState("");
  const [discountText, setDiscountText] = useState("");

  const handleAddOffer = (e) => {
    e.preventDefault();
    if (title) {
      const newOffer = {
        id: `off-${Date.now()}`,
        title,
        discount: discountText || "Special Discount",
        validity: "Active Now",
        claims: 0,
        status: "Active"
      };
      const updated = [newOffer, ...offers];
      setOffers(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (_) {}
      if (onShowToast) onShowToast(`New offer "${title}" published to nearby Nagpur customers!`);
      setTitle("");
      setDiscountText("");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">Promotions & Offers</h1>
          <p className="text-xs text-[#666666]">Create limited-time deals visible to nearby Nagpur shoppers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Offer Card */}
        <form onSubmit={handleAddOffer} className="bg-white rounded-3xl border border-[#138A36] p-5 card-shadow space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[#138A36] font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Create New Local Offer</span>
          </div>

          <div>
            <label className="block font-bold text-[#111111] mb-1">Offer Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Festival Special Discount"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl focus:outline-none focus:border-[#138A36]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#111111] mb-1">Discount Details</label>
            <input
              type="text"
              placeholder="e.g. ₹899 → ₹699"
              value={discountText}
              onChange={(e) => setDiscountText(e.target.value)}
              className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl focus:outline-none focus:border-[#138A36]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-bold py-2.5 rounded-xl transition-colors shadow-xs"
          >
            Publish Offer to Local Customers
          </button>
        </form>

        {/* Existing Active Offers or Empty State */}
        {offers.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 bg-[#EAF7EE] text-[#138A36] rounded-2xl flex items-center justify-center text-2xl shadow-xs">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#111111]">No Active Offers Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Create your first promotional discount or weekend deal using the form on the left. Offers are highlighted to nearby shoppers in Nagpur.
            </p>
          </div>
        ) : (
          offers.map((off) => (
            <div key={off.id} className="bg-white rounded-3xl border border-[#E5E7E5] p-5 card-shadow space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="bg-[#EAF7EE] text-[#138A36] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {off.status}
                  </span>
                  <span className="text-[11px] text-[#666666] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#138A36]" />
                    <span>{off.validity}</span>
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#111111] mt-2">{off.title}</h3>
                <p className="text-lg font-black text-[#138A36] mt-1">{off.discount}</p>
              </div>

              <div className="pt-3 border-t border-[#E5E7E5] flex items-center justify-between text-xs text-[#666666]">
                <span>{off.claims} Claims by Nagpur Users</span>
                <button 
                  onClick={() => onShowToast(`Offer ${off.title} paused`)}
                  className="text-red-600 font-bold hover:underline"
                >
                  Pause
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
