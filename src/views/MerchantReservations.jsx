import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, MapPin, User, QrCode } from 'lucide-react';

export default function MerchantReservations({ reservations, onShowToast }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const TABS = ["All", "Confirmed", "Visited", "Pending", "Cancelled"];

  const filtered = reservations.filter(r => activeFilter === "All" || r.status === activeFilter);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">Customer Store Reservations</h1>
        <p className="text-xs text-[#666666]">Products held in store for pickup & customer visits in Nagpur</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#E5E7E5]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveFilter(t)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeFilter === t
                ? "bg-[#138A36] text-white"
                : "bg-white text-[#666666] hover:text-[#111111] border border-[#E5E7E5]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((res) => (
          <div key={res.id} className="bg-white rounded-3xl border border-[#E5E7E5] p-5 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111111]">{res.customerName}</h3>
                  <span className="text-xs font-mono font-semibold text-[#138A36]">{res.id}</span>
                </div>
              </div>

              <span className="bg-[#138A36] text-white text-xs font-bold px-3 py-1 rounded-full">
                {res.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#666666] block">Reserved Item</span>
                <span className="font-bold text-[#111111]">{res.productName} ({res.size})</span>
              </div>
              <div>
                <span className="text-[#666666] block">Agreed Price</span>
                <span className="font-bold text-[#138A36]">₹{res.price}</span>
              </div>
              <div>
                <span className="text-[#666666] block">Pickup Time</span>
                <span className="font-bold text-[#111111]">{res.pickupTime}</span>
              </div>
              <div>
                <span className="text-[#666666] block">Customer Phone</span>
                <span className="font-bold text-[#111111]">{res.customerPhone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E5E7E5]">
              <span className="text-xs text-[#666666]">Cashier Verification Code: <strong className="font-mono text-[#111111]">{res.qrCode}</strong></span>
              <button
                onClick={() => onShowToast(`Marked ${res.customerName}'s visit as Visited & Purchased!`)}
                className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Mark Customer Visited & Paid
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
