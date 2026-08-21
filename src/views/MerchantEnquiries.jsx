import React, { useState } from 'react';
import { Search, Filter, Calendar, MessageSquare, Clock, ChevronRight } from 'lucide-react';

export default function MerchantEnquiries({ enquiries, onOpenChat, onShowToast }) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const TABS = [
    { label: "All", count: enquiries.length },
    { label: "Pending", count: 6 },
    { label: "Offer Sent", count: 8 },
    { label: "Interested", count: 5 },
    { label: "Completed", count: 5 }
  ];

  const filteredEnquiries = enquiries.filter(enq => {
    if (activeTab !== "All" && enq.status !== activeTab) return false;
    if (searchQuery && !enq.customerName.toLowerCase().includes(searchQuery.toLowerCase()) && !enq.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">Customer Enquiries</h1>
        <p className="text-xs text-[#666666]">Real-time demand requests from nearby Nagpur customers</p>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#E5E7E5]">
        {TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveTab(t.label)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === t.label
                ? "bg-[#138A36] text-white"
                : "bg-white text-[#666666] hover:text-[#111111] border border-[#E5E7E5]"
            }`}
          >
            <span>{t.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === t.label ? "bg-white text-[#138A36]" : "bg-gray-100"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search enquiries by customer name or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
          />
        </div>
      </div>

      {/* Enquiries Cards List */}
      <div className="space-y-4">
        {filteredEnquiries.map((enq) => (
          <div 
            key={enq.id}
            onClick={() => onOpenChat(enq)}
            className="bg-white rounded-2xl border border-[#E5E7E5] p-5 card-shadow-hover cursor-pointer space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-3">
              <div className="flex items-center gap-3">
                <img src={enq.customerAvatar} alt={enq.customerName} className="w-10 h-10 rounded-full object-cover border border-[#E5E7E5]" />
                <div>
                  <h3 className="font-bold text-sm text-[#111111]">{enq.customerName}</h3>
                  <span className="text-xs font-mono font-semibold text-[#666666]">{enq.id}</span>
                </div>
              </div>

              <span className="text-xs font-bold bg-[#EAF7EE] text-[#138A36] px-3 py-1 rounded-full">
                {enq.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#666666] block">Requested Product</span>
                <span className="font-bold text-[#111111]">{enq.productName}</span>
              </div>
              <div>
                <span className="text-[#666666] block">Size / Option</span>
                <span className="font-bold text-[#111111]">{enq.size}</span>
              </div>
              <div>
                <span className="text-[#666666] block">Customer Budget</span>
                <span className="font-bold text-[#138A36]">{enq.budget}</span>
              </div>
              <div>
                <span className="text-[#666666] block">Last Activity</span>
                <span className="font-bold text-[#111111]">{enq.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E5E7E5]">
              <p className="text-xs text-[#666666] italic truncate max-w-md">"{enq.lastMessage}"</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(enq);
                }}
                className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                Reply with Price Offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
