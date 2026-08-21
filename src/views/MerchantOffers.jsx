import React, { useState } from 'react';
import { Tag, Plus, Clock, CheckCircle2, Sparkles } from 'lucide-react';

export default function MerchantOffers({ onShowToast }) {
  const [offers, setOffers] = useState([
    {
      id: "off-1",
      title: "Black Oversized T-Shirt Deal",
      discount: "₹899 → ₹699",
      validity: "Valid Today Only",
      claims: 18,
      status: "Active"
    },
    {
      id: "off-2",
      title: "Weekend Store Visit Bonus",
      discount: "10% OFF on ₹2000+",
      validity: "Sat - Sun",
      claims: 32,
      status: "Active"
    }
  ]);

  const [title, setTitle] = useState("");
  const [discountText, setDiscountText] = useState("");

  const handleAddOffer = (e) => {
    e.preventDefault();
    if (title) {
      setOffers([
        ...offers,
        {
          id: `off-${Date.now()}`,
          title,
          discount: discountText || "Special Discount",
          validity: "Active Now",
          claims: 0,
          status: "Active"
        }
      ]);
      onShowToast(`New offer "${title}" published to nearby Nagpur customers!`);
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

        {/* Existing Active Offers */}
        {offers.map((off) => (
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
        ))}
      </div>
    </div>
  );
}
