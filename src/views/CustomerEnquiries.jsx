import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle2, ChevronRight, Filter } from 'lucide-react';

export default function CustomerEnquiries({ enquiries, onOpenChat }) {
  const [activeTab, setActiveTab] = useState("All");

  const TABS = ["All", "Pending", "Offer Received", "Interested", "Completed"];

  const filteredEnquiries = enquiries.filter(e => {
    if (activeTab === "All") return true;
    return e.status === activeTab;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Offer Received":
        return "bg-[#138A36] text-white";
      case "Pending":
        return "bg-amber-500 text-white";
      case "Interested":
        return "bg-blue-600 text-white";
      case "Completed":
        return "bg-gray-200 text-[#111111]";
      default:
        return "bg-[#EAF7EE] text-[#138A36]";
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">My Enquiries</h1>
        <p className="text-xs text-[#666666]">Track your product availability requests & price offers from Nagpur shops</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#E5E7E5]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === t
                ? "bg-[#138A36] text-white"
                : "bg-white text-[#666666] hover:text-[#111111] border border-[#E5E7E5]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredEnquiries.map((enq) => (
          <div
            key={enq.id}
            onClick={() => onOpenChat({ id: enq.shopId, name: enq.shopName })}
            className="bg-white rounded-2xl border border-[#E5E7E5] p-4 card-shadow-hover cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#666666]">{enq.id}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(enq.status)}`}>
                  {enq.status}
                </span>
              </div>
              <span className="text-[11px] text-[#666666] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#138A36]" />
                <span>{enq.timestamp}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img src={enq.productImage} alt={enq.productName} className="w-14 h-14 rounded-xl object-cover border border-[#E5E7E5]" />
              <div className="flex-1">
                <h3 className="font-bold text-sm text-[#111111]">{enq.productName}</h3>
                <p className="text-xs text-[#666666]">Shop: <span className="font-semibold text-[#111111]">{enq.shopName}</span></p>
                <div className="flex items-center gap-3 text-xs font-medium text-[#138A36] mt-0.5">
                  <span>{enq.size}</span>
                  <span>Budget: {enq.budget}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#666666]" />
            </div>

            <div className="bg-[#F7F8F7] p-2.5 rounded-xl border border-[#E5E7E5] text-xs text-[#666666] flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#138A36] shrink-0" />
              <span className="truncate italic">"{enq.lastMessage}"</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
