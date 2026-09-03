import React, { useState } from 'react';
import { 
  Users, Store, ShieldCheck, Package, MessageSquare, ShoppingBag, 
  Tag, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, 
  CheckCircle2, AlertCircle, Plus, Eye, Sparkles, Filter, ChevronRight 
} from 'lucide-react';

export default function AdminDashboard({
  stats,
  kpiMetrics,
  customers = [],
  merchants = [],
  shops = [],
  products = [],
  pendingVerifications = [],
  enquiries = [],
  reservations = [],
  offers = [],
  auditLogs = [],
  onNavigate,
  onOpenQuickActionModal
}) {
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("30 Days");

  // Real-Time Activity Feed Data from live audit logs or recent events
  const recentActivities = auditLogs.length > 0 ? auditLogs.slice(0, 6).map((log, index) => ({
    id: log.id || index,
    text: `${log.action} — ${log.entity || 'Platform Event'}`,
    time: log.timestamp || log.created_at ? new Date(log.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
    type: "audit",
    target: "auditLogs"
  })) : [
    { id: 1, text: "Trendy Wear verified successfully", time: "2 minutes ago", type: "verification", target: "merchants" },
    { id: 2, text: "Aman Verma submitted an enquiry for Black Oversized T-Shirt", time: "5 minutes ago", type: "enquiry", target: "enquiries" },
    { id: 3, text: "New merchant 'Nagpur Saree Palace' registered", time: "8 minutes ago", type: "merchant", target: "verification" },
    { id: 4, text: "Creator campaign 'Nagpur Street Wear Fest' approved", time: "12 minutes ago", type: "campaign", target: "campaigns" },
    { id: 5, text: "In-store pickup reservation #RES-8901 completed", time: "18 minutes ago", type: "reservation", target: "reservations" },
    { id: 6, text: "New discount offer created by Shoe Point", time: "25 minutes ago", type: "offer", target: "offers" }
  ];

  // 8 Required KPI Cards calculated dynamically from live database
  const kpiCards = [
    { 
      title: "Total Customers", 
      value: kpiMetrics?.totalCustomers?.value || String(customers.length || 0), 
      change: kpiMetrics?.totalCustomers?.change || "No previous-period data", 
      isPositive: true, 
      subtext: "vs previous period", 
      icon: Users, 
      color: "bg-blue-500", 
      tab: "customers" 
    },
    { 
      title: "Active Merchants", 
      value: kpiMetrics?.activeMerchants?.value || String(merchants.length || 0), 
      change: kpiMetrics?.activeMerchants?.change || "No previous-period data", 
      isPositive: true, 
      subtext: "vs previous period", 
      icon: Store, 
      color: "bg-[#138A36]", 
      tab: "merchants" 
    },
    { 
      title: "Verified Shops", 
      value: kpiMetrics?.verifiedShops?.value || String(shops.filter(s => s.verified || s.is_verified).length || 0), 
      change: kpiMetrics?.verifiedShops?.change || "No previous-period data", 
      isPositive: true, 
      subtext: "vs previous period", 
      icon: ShieldCheck, 
      color: "bg-emerald-600", 
      tab: "verification" 
    },
    { 
      title: "Products", 
      value: kpiMetrics?.productsCount?.value || String(products.length || 0), 
      change: kpiMetrics?.productsCount?.change || "No previous-period data", 
      isPositive: true, 
      subtext: "vs previous period", 
      icon: Package, 
      color: "bg-purple-600", 
      tab: "products" 
    },
    { 
      title: "Enquiries Today", 
      value: kpiMetrics?.enquiriesToday?.value || String(enquiries.length || 0), 
      change: kpiMetrics?.enquiriesToday?.change || "No previous-period data", 
      isPositive: true, 
      subtext: "vs yesterday", 
      icon: MessageSquare, 
      color: "bg-amber-500", 
      tab: "enquiries" 
    },
    { 
      title: "Reservations", 
      value: kpiMetrics?.reservationsCount?.value || String(reservations.length || 0), 
      change: kpiMetrics?.reservationsCount?.change || "No previous-period data", 
      isPositive: true, 
      subtext: "vs yesterday", 
      icon: ShoppingBag, 
      color: "bg-indigo-600", 
      tab: "reservations" 
    },
    { 
      title: "Active Offers", 
      value: kpiMetrics?.activeOffers?.value || String(offers.length || 0), 
      change: kpiMetrics?.activeOffers?.change || "No previous-period data", 
      isPositive: true, 
      subtext: "vs previous week", 
      icon: Tag, 
      color: "bg-rose-500", 
      tab: "offers" 
    },
    { 
      title: "Platform Revenue", 
      value: kpiMetrics?.platformRevenue?.value || "₹0", 
      change: kpiMetrics?.platformRevenue?.change || "No previous-period data", 
      isPositive: true, 
      subtext: "vs previous period", 
      icon: DollarSign, 
      color: "bg-[#0B6B2B]", 
      tab: "revenue" 
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* QUICK ACTIONS BAR */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider font-mono">
            Dashboard Quick Actions
          </span>
          <span className="text-[11px] text-[#138A36] font-bold">Fast Operational Triggers</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <button onClick={() => onOpenQuickActionModal("addMerchant")} className="p-2.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center group transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#111111]">Add Merchant</span>
          </button>

          <button onClick={() => onOpenQuickActionModal("addShop")} className="p-2.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center group transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#111111]">Add Shop</span>
          </button>

          <button onClick={() => onOpenQuickActionModal("addCategory")} className="p-2.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center group transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#111111]">Add Category</span>
          </button>

          <button onClick={() => onOpenQuickActionModal("addProduct")} className="p-2.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center group transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#111111]">Add Product</span>
          </button>

          <button onClick={() => onOpenQuickActionModal("createOffer")} className="p-2.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center group transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Tag className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#111111]">Create Offer</span>
          </button>

          <button onClick={() => onOpenQuickActionModal("createNotification")} className="p-2.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center group transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#111111]">Broadcast</span>
          </button>

          <button onClick={() => onOpenQuickActionModal("addCreator")} className="p-2.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center group transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#111111]">Add Creator</span>
          </button>

          <button onClick={() => onOpenQuickActionModal("createCampaign")} className="p-2.5 bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center group transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#111111]">New Campaign</span>
          </button>
        </div>
      </div>

      {/* 8 PLATFORM KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(kpi.tab)}
              className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-[#DDF3E3] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`w-9 h-9 rounded-2xl ${kpi.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl font-black text-[#111111] font-poppins tracking-tight">{kpi.value}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-full ${
                  kpi.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{kpi.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* CHARTS & ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Platform Growth Analytics Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-extrabold text-base text-[#111111] font-poppins flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#138A36]" /> Platform Growth Analytics
              </h3>
              <p className="text-xs text-gray-500">Track demand, enquiries, merchant onboarding, and revenue trends</p>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#F7F8F7] p-1 rounded-xl border border-[#E5E7E5] overflow-x-auto no-scrollbar">
              {["Today", "7 Days", "30 Days", "90 Days", "6 Months", "1 Year"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setAnalyticsTimeframe(tf)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    analyticsTimeframe === tf ? "bg-[#138A36] text-white" : "text-gray-600 hover:text-[#111111]"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart Visual Representation */}
          <div className="h-64 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[#E5E7E5]">
            {[
              { label: "Mon", enq: 60, res: 40, rev: 35 },
              { label: "Tue", enq: 75, res: 55, rev: 50 },
              { label: "Wed", enq: 90, res: 70, rev: 68 },
              { label: "Thu", enq: 80, res: 60, rev: 55 },
              { label: "Fri", enq: 110, res: 85, rev: 82 },
              { label: "Sat", enq: 145, res: 120, rev: 115 },
              { label: "Sun", enq: 130, res: 105, rev: 98 }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div style={{ height: `${bar.enq}%` }} className="w-1/3 bg-[#138A36] rounded-t-md group-hover:opacity-90 transition-all" title={`Enquiries: ${bar.enq * 3}`}></div>
                  <div style={{ height: `${bar.res}%` }} className="w-1/3 bg-blue-500 rounded-t-md group-hover:opacity-90 transition-all" title={`Reservations: ${bar.res * 2}`}></div>
                  <div style={{ height: `${bar.rev}%` }} className="w-1/3 bg-amber-500 rounded-t-md group-hover:opacity-90 transition-all" title={`Revenue: ₹${bar.rev * 4000}`}></div>
                </div>
                <span className="text-[11px] font-bold text-gray-500">{bar.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 text-xs font-semibold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-3 h-3 rounded-full bg-[#138A36]"></span> Customer Enquiries
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Store Reservations
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span> Monetization Revenue
              </span>
            </div>
            <button onClick={() => onNavigate("analytics")} className="text-[#138A36] hover:underline font-bold flex items-center gap-1 cursor-pointer">
              View Full Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Col: Real-Time Platform Activity Feed */}
        <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#111111] font-poppins flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Platform Activity Feed
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => onNavigate(act.target)}
                  className="p-3 rounded-2xl bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-transparent hover:border-[#DDF3E3] transition-all cursor-pointer flex items-start gap-3 group"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#E5E7E5] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#138A36]">
                    <CheckCircle2 className="w-4 h-4 text-[#138A36]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#111111] group-hover:text-[#138A36] truncate">{act.text}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate("auditLogs")}
            className="w-full mt-4 py-2.5 bg-[#F7F8F7] hover:bg-gray-200 text-[#111111] text-xs font-bold rounded-xl transition-colors text-center block cursor-pointer"
          >
            View Complete Security Audit Log
          </button>
        </div>
      </div>

      {/* PENDING APPROVALS QUICK MODERATION TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-[#111111] font-poppins flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" /> Pending Verification Applications ({pendingVerifications.length})
            </h3>
            <p className="text-xs text-gray-500">Merchants waiting for business document review & Verified Shop badge issuance</p>
          </div>
          <button
            onClick={() => onNavigate("verification")}
            className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Verification Center <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3 px-4 rounded-l-xl">Business Name</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {pendingVerifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400 font-medium">
                    No pending verification applications at the moment.
                  </td>
                </tr>
              ) : (
                pendingVerifications.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F8F7]">
                    <td className="py-3 px-4 font-bold text-[#111111]">{item.businessName}</td>
                    <td className="py-3 px-4 text-gray-600">{item.ownerName} ({item.phone})</td>
                    <td className="py-3 px-4 text-gray-600">{item.businessCategory || item.category || "Retail"}</td>
                    <td className="py-3 px-4 text-gray-500">{item.submittedDate}</td>
                    <td className="py-3 px-4">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate("verification")}
                        className="bg-[#138A36] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#0B6B2B] transition-colors cursor-pointer"
                      >
                        Review App
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
