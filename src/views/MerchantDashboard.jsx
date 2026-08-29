import React from 'react';
import { 
  MessageSquare, Clock, CheckCircle2, TrendingUp, Users, ShoppingBag, 
  Sparkles, ArrowUpRight, DollarSign, Search, Calendar, ChevronRight 
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';

export default function MerchantDashboard({ 
  stats, 
  enquiries, 
  onNavigateMerchant,
  currentUser,
  merchantProfile 
}) {
  const shopName = merchantProfile?.businessName || currentUser?.shopName || currentUser?.name || "Trendy Wear";
  const ownerName = merchantProfile?.ownerName || currentUser?.name || "Store Manager";
  const verifStatus = merchantProfile?.verificationStatus || "✓ Registered Merchant";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">{shopName}</h1>
            <VerifiedBadge text={verifStatus} />
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Owner: <span className="font-bold text-[#111111]">{ownerName}</span> ({currentUser?.email || merchantProfile?.email || "merchant@growlocal.in"}) · Sitabuldi, Nagpur · ★ 4.8
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateMerchant("products")}
            className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <span>+ Add Product</span>
          </button>
          <button
            onClick={() => onNavigateMerchant("chats")}
            className="bg-[#EAF7EE] text-[#138A36] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#DDF3E3] transition-colors"
          >
            Open Live Chats
          </button>
        </div>
      </div>

      {/* 5 Main Metric Cards (Matching reference) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => onNavigateMerchant("enquiries")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] cursor-pointer hover:border-[#138A36] transition-all card-shadow-hover"
        >
          <p className="text-xs font-semibold text-[#666666]">Today's Enquiries</p>
          <p className="text-2xl font-black text-[#111111] mt-1">{stats.todayEnquiries}</p>
          <span className="text-[10px] font-bold text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded mt-2 inline-block">
            +18% from yesterday
          </span>
        </div>

        <div 
          onClick={() => onNavigateMerchant("enquiries")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] cursor-pointer hover:border-[#138A36] transition-all card-shadow-hover"
        >
          <p className="text-xs font-semibold text-[#666666]">Pending</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingEnquiries}</p>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">
            Needs response
          </span>
        </div>

        <div 
          onClick={() => onNavigateMerchant("enquiries")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] cursor-pointer hover:border-[#138A36] transition-all card-shadow-hover"
        >
          <p className="text-xs font-semibold text-[#666666]">Offers Sent</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.offersSent}</p>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-2 inline-block">
            Active quotes
          </span>
        </div>

        <div 
          onClick={() => onNavigateMerchant("enquiries")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] cursor-pointer hover:border-[#138A36] transition-all card-shadow-hover"
        >
          <p className="text-xs font-semibold text-[#666666]">Customer Interested</p>
          <p className="text-2xl font-black text-[#138A36] mt-1">{stats.customerInterested}</p>
          <span className="text-[10px] font-bold text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded mt-2 inline-block">
            High intent
          </span>
        </div>

        <div 
          onClick={() => onNavigateMerchant("enquiries")}
          className="bg-white p-4 rounded-2xl border border-[#E5E7E5] cursor-pointer hover:border-[#138A36] transition-all card-shadow-hover"
        >
          <p className="text-xs font-semibold text-[#666666]">Completed</p>
          <p className="text-2xl font-black text-gray-800 mt-1">{stats.completedEnquiries}</p>
          <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded mt-2 inline-block">
            Converted visits
          </span>
        </div>
      </div>

      {/* Business Performance Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7E5]">
          <p className="text-xs font-semibold text-[#666666]">Response Rate</p>
          <p className="text-xl font-bold text-[#138A36] mt-1">{stats.responseRate}</p>
          <p className="text-[11px] text-[#666666] mt-1">Avg response time: 4 mins</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7E5]">
          <p className="text-xs font-semibold text-[#666666]">Reservations</p>
          <p className="text-xl font-bold text-[#111111] mt-1">{stats.reservations}</p>
          <p className="text-[11px] text-[#666666] mt-1">Held at store for pickup</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7E5]">
          <p className="text-xs font-semibold text-[#666666]">Actual Store Visits</p>
          <p className="text-xl font-bold text-[#111111] mt-1">{stats.visits}</p>
          <p className="text-[11px] text-[#666666] mt-1">Foot traffic generated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E7E5]">
          <p className="text-xs font-semibold text-[#666666]">Revenue Generated</p>
          <p className="text-xl font-bold text-[#138A36] mt-1">{stats.revenueGenerated}</p>
          <p className="text-[11px] text-[#666666] mt-1">Direct from local demand</p>
        </div>
      </div>

      {/* Demand & Search Analytics Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searched Products in Nagpur */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7E5] card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Top Searched Products in Nagpur</h3>
              <p className="text-xs text-[#666666]">Real customer search demand within 3 km</p>
            </div>
            <button 
              onClick={() => onNavigateMerchant("analytics")}
              className="text-xs font-bold text-[#138A36] hover:underline"
            >
              Full Analytics →
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.topSearchedProducts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F7F8F7] rounded-xl border border-[#E5E7E5]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#EAF7EE] text-[#138A36] font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#111111]">{item.query}</span>
                </div>
                <span className="text-xs font-bold text-[#138A36]">{item.count} searches today</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Demand Trends Graph Simulation */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7E5] card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Weekly Customer Demand & Reservations</h3>
              <p className="text-xs text-[#666666]">Enquiries converted to store visits</p>
            </div>
            <span className="bg-[#EAF7EE] text-[#138A36] text-xs font-bold px-2.5 py-1 rounded-full">
              78% Conversion
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-[#E5E7E5]">
            {stats.demandTrends.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center items-end gap-1 h-32">
                  <div 
                    className="w-3 bg-[#EAF7EE] border border-[#138A36]/30 rounded-t-sm" 
                    style={{ height: `${(d.enquiries / 40) * 100}%` }}
                    title={`Enquiries: ${d.enquiries}`}
                  ></div>
                  <div 
                    className="w-3 bg-[#138A36] rounded-t-sm" 
                    style={{ height: `${(d.reservations / 40) * 100}%` }}
                    title={`Reservations: ${d.reservations}`}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-[#666666]">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-1">
            <span className="flex items-center gap-1.5 text-[#666666]">
              <span className="w-3 h-3 bg-[#EAF7EE] border border-[#138A36]/30 rounded-xs"></span>
              <span>Enquiries</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#111111]">
              <span className="w-3 h-3 bg-[#138A36] rounded-xs"></span>
              <span>Store Reservations</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
