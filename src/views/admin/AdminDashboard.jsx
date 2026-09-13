import React, { useState } from 'react';
import { 
  Users, Store, ShieldCheck, Package, MessageSquare, ShoppingBag, 
  Tag, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, 
  CheckCircle2, AlertCircle, Plus, Eye, Sparkles, Filter, ChevronRight,
  Trash2, Search, AlertTriangle, Star, MapPin, X
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
  onOpenQuickActionModal,
  onDeleteShop,
  onDeleteProduct
}) {
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("30 Days");
  const [catalogTab, setCatalogTab] = useState("shops"); // 'shops' | 'products'
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedShopPreview, setSelectedShopPreview] = useState(null);
  const [selectedProductPreview, setSelectedProductPreview] = useState(null);
  const [deleteShopModal, setDeleteShopModal] = useState(null); // { shop }
  const [deleteProductModal, setDeleteProductModal] = useState(null); // { product }
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered live shops & products for catalog showcase
  const filteredCatalogShops = (Array.isArray(shops) ? shops : []).filter(s => {
    if (!catalogSearch.trim()) return true;
    const q = catalogSearch.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) ||
           (s.category || '').toLowerCase().includes(q) ||
           (s.address || '').toLowerCase().includes(q) ||
           (s.city || '').toLowerCase().includes(q);
  });

  const filteredCatalogProducts = (Array.isArray(products) ? products : []).filter(p => {
    if (!catalogSearch.trim()) return true;
    const q = catalogSearch.toLowerCase();
    return (p.name || '').toLowerCase().includes(q) ||
           (p.shopName || '').toLowerCase().includes(q) ||
           (p.category || '').toLowerCase().includes(q);
  });

  const handleConfirmDeleteShop = async () => {
    if (!deleteShopModal?.shop) return;
    setIsDeleting(true);
    try {
      if (onDeleteShop) {
        await onDeleteShop(deleteShopModal.shop.id);
      }
      setDeleteShopModal(null);
    } catch (err) {
      console.error("Failed to delete shop:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deleteProductModal?.product) return;
    setIsDeleting(true);
    try {
      if (onDeleteProduct) {
        await onDeleteProduct(deleteProductModal.product.id);
      }
      setDeleteProductModal(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setIsDeleting(false);
    }
  };

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
      {/* PLATFORM LIVE CATALOG: SHOPS & PRODUCTS SHOWCASE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-[#138A36]">
                <Store className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-[#111111] font-poppins flex items-center gap-2">
                  Live Catalog: Shops & Products
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0B6B2B]">
                    Active Marketplace
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Direct management, inspection, and deletion controls for live verified shops and catalog inventory
                </p>
              </div>
            </div>
          </div>

          {/* Search & Tabs Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={catalogTab === 'shops' ? "Search shops..." : "Search products..."}
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl focus:outline-none focus:border-[#138A36] w-full sm:w-52 font-medium"
              />
              {catalogSearch && (
                <button
                  onClick={() => setCatalogSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Tab switch buttons */}
            <div className="flex items-center bg-[#F7F8F7] p-1 rounded-xl border border-[#E5E7E5]">
              <button
                onClick={() => { setCatalogTab("shops"); setCatalogSearch(""); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  catalogTab === "shops"
                    ? "bg-[#138A36] text-white shadow-xs"
                    : "text-gray-600 hover:text-[#111111]"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                Shops ({filteredCatalogShops.length})
              </button>
              <button
                onClick={() => { setCatalogTab("products"); setCatalogSearch(""); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  catalogTab === "products"
                    ? "bg-[#138A36] text-white shadow-xs"
                    : "text-gray-600 hover:text-[#111111]"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Products ({filteredCatalogProducts.length})
              </button>
            </div>

            <button
              onClick={() => onNavigate(catalogTab)}
              className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1 px-1 cursor-pointer whitespace-nowrap"
            >
              Open Full {catalogTab === 'shops' ? 'Shops' : 'Products'} View <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SHOPS TAB CONTENT */}
        {catalogTab === "shops" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                  <th className="py-3 px-4 rounded-l-xl">Shop Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Rating & Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E5]">
                {filteredCatalogShops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                      No shops found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCatalogShops.slice(0, 8).map((shop) => {
                    const shopProductCount = products.filter(p => p.shopId === shop.id).length;
                    return (
                      <tr key={shop.id} className="hover:bg-[#F7F8F7] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={shop.logoImage || shop.coverImage || "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=100&auto=format&fit=crop&q=80"}
                              alt={shop.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#E5E7E5] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-[#111111] truncate">{shop.name}</span>
                                {(shop.verified || shop.is_verified) && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#138A36] shrink-0" title="Verified Shop" />
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 block font-mono truncate">{shop.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {shop.category || "Retail"}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[130px]">{shop.address || shop.city || "Nagpur"}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {shop.rating || "4.5"}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {shopProductCount} {shopProductCount === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            shop.status === "Open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                          }`}>
                            {shop.status || "Open"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedShopPreview(shop)}
                              className="p-1.5 text-gray-500 hover:text-[#138A36] hover:bg-white rounded-lg transition-colors cursor-pointer"
                              title="Preview Shop"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteShopModal({ shop })}
                              className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete Shop"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PRODUCTS TAB CONTENT */}
        {catalogTab === "products" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                  <th className="py-3 px-4 rounded-l-xl">Product Item</th>
                  <th className="py-3 px-4">Storefront</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E5]">
                {filteredCatalogProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                      No products found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCatalogProducts.slice(0, 8).map((product) => {
                    const isOutOfStock = product.stockCount === 0 || product.inStock === false;
                    return (
                      <tr key={product.id} className="hover:bg-[#F7F8F7] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80"}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#E5E7E5] shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-extrabold text-[#111111] truncate block">{product.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono truncate">{product.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {product.shopName || "Local Store"}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {product.category || "General"}
                        </td>
                        <td className="py-3 px-4 font-black text-[#111111]">
                          {product.price || "₹0"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            isOutOfStock
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isOutOfStock ? "Out of Stock" : `In Stock (${product.stockCount ?? 10})`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedProductPreview(product)}
                              className="p-1.5 text-gray-500 hover:text-[#138A36] hover:bg-white rounded-lg transition-colors cursor-pointer"
                              title="Preview Product"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteProductModal({ product })}
                              className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SHOP PREVIEW MODAL */}
      {selectedShopPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7E5] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedShopPreview(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F8F7] hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <img
                src={selectedShopPreview.logoImage || selectedShopPreview.coverImage || "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=200&auto=format&fit=crop&q=80"}
                alt={selectedShopPreview.name}
                className="w-16 h-16 rounded-2xl object-cover border border-[#E5E7E5]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-lg text-[#111111]">{selectedShopPreview.name}</h4>
                  {(selectedShopPreview.verified || selectedShopPreview.is_verified) && (
                    <ShieldCheck className="w-4 h-4 text-[#138A36]" />
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium">{selectedShopPreview.category} • {selectedShopPreview.city || 'Nagpur'}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedShopPreview.address}</p>
              </div>
            </div>

            <div className="bg-[#F7F8F7] rounded-2xl p-3 mb-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] font-bold">RATING</span>
                <span className="font-extrabold text-[#111111]">{selectedShopPreview.rating || '4.8'} ★</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] font-bold">HOURS</span>
                <span className="font-extrabold text-[#111111]">{selectedShopPreview.openHours || '10AM - 9PM'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] font-bold">STATUS</span>
                <span className="font-extrabold text-emerald-700">{selectedShopPreview.status || 'Open'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const shopToDelete = selectedShopPreview;
                  setSelectedShopPreview(null);
                  setDeleteShopModal({ shop: shopToDelete });
                }}
                className="flex-1 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Shop
              </button>
              <button
                onClick={() => {
                  setSelectedShopPreview(null);
                  onNavigate("shops");
                }}
                className="flex-1 py-2.5 bg-[#138A36] text-white hover:bg-[#0B6B2B] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Manage in Shops View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT PREVIEW MODAL */}
      {selectedProductPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7E5] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedProductPreview(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F8F7] hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={selectedProductPreview.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80"}
              alt={selectedProductPreview.name}
              className="w-full h-44 rounded-2xl object-cover border border-[#E5E7E5] mb-4"
            />

            <div className="mb-4">
              <span className="text-[10px] font-extrabold uppercase text-[#138A36] bg-emerald-50 px-2 py-0.5 rounded-md">
                {selectedProductPreview.category || "General"}
              </span>
              <h4 className="font-extrabold text-base text-[#111111] mt-1">{selectedProductPreview.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5">Sold by: <span className="font-bold text-gray-700">{selectedProductPreview.shopName || "Local Store"}</span></p>
              <p className="text-lg font-black text-[#111111] mt-2">{selectedProductPreview.price || "₹0"}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const prodToDelete = selectedProductPreview;
                  setSelectedProductPreview(null);
                  setDeleteProductModal({ product: prodToDelete });
                }}
                className="flex-1 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Product
              </button>
              <button
                onClick={() => {
                  setSelectedProductPreview(null);
                  onNavigate("products");
                }}
                className="flex-1 py-2.5 bg-[#138A36] text-white hover:bg-[#0B6B2B] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Manage in Products View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE SHOP MODAL */}
      {deleteShopModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-center text-[#111111] mb-2 font-poppins">
              Permanently Delete Shop?
            </h3>
            <p className="text-xs text-center text-gray-500 mb-4 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#111111]">{deleteShopModal.shop.name}</strong>?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-5 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Immediate Consequences:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600 text-[10px]">
                <li>Shop profile will be removed from customer discovery feeds.</li>
                <li>All products, offers, and enquiries linked to this shop will be deleted.</li>
                <li>Action cannot be reversed.</li>
              </ul>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteShopModal(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#F7F8F7] hover:bg-gray-200 text-[#111111] font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteShop}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-200 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE PRODUCT MODAL */}
      {deleteProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-center text-[#111111] mb-2 font-poppins">
              Permanently Delete Product?
            </h3>
            <p className="text-xs text-center text-gray-500 mb-4 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#111111]">{deleteProductModal.product.name}</strong> from <span className="text-gray-700 font-medium">{deleteProductModal.product.shopName || "catalog"}</span>?
            </p>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-3 mb-5 text-[11px] text-red-700">
              This product item will be removed immediately from the live customer catalogue and database.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteProductModal(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#F7F8F7] hover:bg-gray-200 text-[#111111] font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-200 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
