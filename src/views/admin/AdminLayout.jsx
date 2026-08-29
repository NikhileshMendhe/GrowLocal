import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Store, ShieldCheck, ShoppingBag, Package, Grid, 
  MapPin, MessageSquare, MessagesSquare, BookmarkCheck, Tag, Star, Sparkles, 
  TrendingUp, Compass, Flame, CreditCard, DollarSign, PieChart, Layout, 
  FileText, Image, Megaphone, AlertTriangle, MessageCircle, Bell, UserCheck, 
  Lock, History, Activity, Settings, Search, HelpCircle, ChevronDown, Menu, X, LogOut, ExternalLink, HardDrive 
} from 'lucide-react';
import AdminGlobalSearchModal from './AdminGlobalSearchModal';

export default function AdminLayout({
  currentAdminTab,
  setCurrentAdminTab,
  onSwitchPlatform,
  adminUser,
  badgeCounts,
  customers,
  merchants,
  shops,
  products,
  enquiries,
  reservations,
  creators,
  campaigns,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Exact 55 Sidebar Navigation Hierarchy
  const sidebarNavGroups = [
    {
      title: "MAIN",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "PLATFORM",
      items: [
        { id: "customers", label: "Customers", icon: Users, count: badgeCounts?.customers },
        { id: "merchants", label: "Merchants", icon: Store, count: badgeCounts?.merchants },
        { id: "verification", label: "Verification Center", icon: ShieldCheck, badge: badgeCounts?.pendingVerifications, badgeColor: "bg-amber-500 text-white" },
        { id: "shops", label: "Shops", icon: ShoppingBag, count: badgeCounts?.shops },
        { id: "products", label: "Products", icon: Package, count: badgeCounts?.products },
        { id: "categories", label: "Categories", icon: Grid },
        { id: "locations", label: "Locations", icon: MapPin }
      ]
    },
    {
      title: "COMMERCE",
      items: [
        { id: "enquiries", label: "Enquiries", icon: MessageSquare, badge: badgeCounts?.pendingEnquiries, badgeColor: "bg-[#138A36] text-white" },
        { id: "chats", label: "Chats", icon: MessagesSquare, badge: badgeCounts?.reportedChats, badgeColor: "bg-red-500 text-white" },
        { id: "reservations", label: "Reservations", icon: BookmarkCheck, count: badgeCounts?.reservations },
        { id: "offers", label: "Offers", icon: Tag },
        { id: "reviews", label: "Reviews", icon: Star, badge: badgeCounts?.reportedReviews, badgeColor: "bg-purple-500 text-white" }
      ]
    },
    {
      title: "GROWTH",
      items: [
        { id: "creators", label: "Creators", icon: Sparkles },
        { id: "campaigns", label: "Campaigns", icon: TrendingUp },
        { id: "analytics", label: "Analytics", icon: Compass },
        { id: "demandIntelligence", label: "Demand Intelligence", icon: Flame }
      ]
    },
    {
      title: "FINANCE",
      items: [
        { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
        { id: "payments", label: "Payments", icon: DollarSign, badge: badgeCounts?.payments, badgeColor: "bg-blue-600 text-white" },
        { id: "revenue", label: "Revenue", icon: PieChart }
      ]
    },
    {
      title: "CONTENT",
      items: [
        { id: "homepageBuilder", label: "Homepage Builder", icon: Layout },
        { id: "content", label: "CMS Content", icon: FileText },
        { id: "banners", label: "Banners", icon: Image },
        { id: "announcements", label: "Announcements", icon: Megaphone }
      ]
    },
    {
      title: "SUPPORT",
      items: [
        { id: "reports", label: "Reports & Complaints", icon: AlertTriangle, badge: badgeCounts?.reports, badgeColor: "bg-red-600 text-white" },
        { id: "notifications", label: "Notifications", icon: Bell }
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { id: "administrators", label: "Administrators", icon: UserCheck },
        { id: "roles", label: "Roles & Permissions", icon: Lock },
        { id: "auditLogs", label: "Audit Logs", icon: History },
        { id: "systemHealth", label: "System Health", icon: Activity },
        { id: "storageOverview", label: "Storage Overview", icon: HardDrive },
        { id: "settings", label: "Settings", icon: Settings }
      ]
    }
  ];

  // Map tab ID to Title and Breadcrumbs
  const getPageMeta = (tabId) => {
    switch (tabId) {
      case "dashboard": return { title: "Dashboard", category: "MAIN", subtitle: "Monitor and manage the GrowLocal platform in real-time" };
      case "customers": return { title: "Customers Management", category: "PLATFORM", subtitle: "Manage user profiles, accounts, restrictions, and customer activity" };
      case "merchants": return { title: "Merchant Directory", category: "PLATFORM", subtitle: "Manage local business owners, plans, revenue, and store performance" };
      case "verification": return { title: "Verification Center", category: "PLATFORM", subtitle: "Review pending business applications, tax documents, and issue Verified Shop badges" };
      case "shops": return { title: "Shops & Featured Shops", category: "PLATFORM", subtitle: "Manage local store listings, opening hours, featured priorities, and shop status" };
      case "products": return { title: "Product Catalog", category: "PLATFORM", subtitle: "Manage local inventory, prices, stock availability, and catalog moderation" };
      case "categories": return { title: "Category Management", category: "PLATFORM", subtitle: "Configure global product categories, icons, display index, and section toggles" };
      case "locations": return { title: "Locations & Radius", category: "PLATFORM", subtitle: "Manage active cities, local areas, PIN codes, and geocoding boundaries" };
      case "enquiries": return { title: "Customer Enquiries", category: "COMMERCE", subtitle: "Track live customer product enquiries, custom merchant offers, and status funnel" };
      case "chats": return { title: "Chat Moderation", category: "COMMERCE", subtitle: "Permission-gated conversation monitoring, reported chat investigations, and audit logs" };
      case "reservations": return { title: "Reservations Master", category: "COMMERCE", subtitle: "Monitor in-store hold reservations, pickup verification QR codes, and visit statuses" };
      case "offers": return { title: "Offers & Promotions", category: "COMMERCE", subtitle: "Approve, extend, or feature merchant discount offers and promotional campaigns" };
      case "reviews": return { title: "Reviews & Moderation", category: "COMMERCE", subtitle: "Moderate customer ratings, automated spam filters, and review report inbox" };
      case "creators": return { title: "Local Creators", category: "GROWTH", subtitle: "Manage local influencer profiles, reach analytics, and creator verification" };
      case "campaigns": return { title: "Creator Campaigns", category: "GROWTH", subtitle: "Track marketing campaigns, budget ROI, click funnels, and Customers Generated" };
      case "analytics": return { title: "Platform Analytics", category: "GROWTH", subtitle: "Comprehensive platform growth, user retention, merchant adoption, and traffic metrics" };
      case "demandIntelligence": return { title: "Demand Intelligence & Heatmap", category: "GROWTH", subtitle: "Nagpur local demand clusters, unfulfilled product requests, and supply gap reports" };
      case "subscriptions": return { title: "Merchant Subscriptions", category: "FINANCE", subtitle: "Manage subscription plans (Free, Grow ₹299, Pro ₹799) and active merchant tiers" };
      case "payments": return { title: "Payments & Revenue Log", category: "FINANCE", subtitle: "Transaction ledger across subscriptions, campaign fees, lead charges, and refunds" };
      case "revenue": return { title: "Revenue Dashboard", category: "FINANCE", subtitle: "Gross revenue, net margins, subscription breakdown, and commercial monetization" };
      case "homepageBuilder": return { title: "Homepage Builder", category: "CONTENT", subtitle: "Customize customer home hero text, announcements, card order, and promotional banners" };
      case "content": return { title: "CMS Content Manager", category: "CONTENT", subtitle: "Control marketing content, FAQ entries, hero copy, and platform documentation" };
      case "banners": return { title: "Promotional Banners", category: "CONTENT", subtitle: "Manage homepage banners, category highlights, and merchant ad placements" };
      case "announcements": return { title: "Announcements & Broadcasts", category: "CONTENT", subtitle: "Manage global top bar announcements, maintenance banners, and platform alerts" };
      case "reports": return { title: "Reports & Complaints", category: "SUPPORT", subtitle: "Investigate user-submitted reports on shops, products, chats, reviews, and creators" };
      case "notifications": return { title: "Notification Broadcast Center", category: "SUPPORT", subtitle: "Send targeted Push notifications, emails, and in-app alerts to customers & merchants" };
      case "administrators": return { title: "Administrators Management", category: "SYSTEM", subtitle: "Manage admin team accounts, roles, access credentials, and emergency locks" };
      case "roles": return { title: "Roles & Permissions (RBAC)", category: "SYSTEM", subtitle: "Define fine-grained permission matrices across Super, Ops, Content, and Finance admins" };
      case "auditLogs": return { title: "Security Audit Logs", category: "SYSTEM", subtitle: "Immutable log of all sensitive admin actions, verification approvals, and chat views" };
      case "systemHealth": return { title: "System Health & APIs", category: "SYSTEM", subtitle: "Real-time status of database, auth, image processing, payments, search, and maps" };
      case "settings": return { title: "Platform Settings", category: "SYSTEM", subtitle: "Global GrowLocal brand settings, currency, commission rates, and maintenance toggles" };
      default: return { title: "Admin Center", category: "SUPER ADMIN", subtitle: "GrowLocal Platform Command Center" };
    }
  };

  const pageMeta = getPageMeta(currentAdminTab);

  return (
    <div className="min-h-screen bg-[#F7F8F7] text-[#111111] flex flex-col font-sans selection:bg-[#EAF7EE] selection:text-[#138A36]">
      
      {/* GLOBAL ADMIN TOP HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7E5] shadow-xs">
        <div className="flex items-center justify-between px-4 py-3 max-w-[1920px] mx-auto">
          
          {/* Left: Mobile Menu Toggle + Title & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#138A36] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xs">
                🌱
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                  <span>GrowLocal</span>
                  <span>/</span>
                  <span className="text-[#138A36] uppercase tracking-wider font-extrabold text-[10px] bg-[#EAF7EE] px-2 py-0.5 rounded-md border border-[#DDF3E3]">
                    {pageMeta.category}
                  </span>
                </div>
                <h1 className="text-base font-extrabold text-[#111111] leading-tight font-poppins">{pageMeta.title}</h1>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full bg-[#F7F8F7] hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] px-3.5 py-2 rounded-xl flex items-center justify-between text-xs text-gray-500 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400 group-hover:text-[#138A36]" />
                <span className="font-medium text-gray-600">Search customer, merchant, shop, product, enquiry...</span>
              </div>
              <span className="font-mono text-[10px] bg-white border border-[#E5E7E5] px-2 py-0.5 rounded-md font-bold text-gray-500">
                Ctrl + K
              </span>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Platform View Switcher */}
            <div className="hidden md:flex bg-[#F7F8F7] p-1 rounded-xl border border-[#E5E7E5] text-xs font-bold">
              <button
                onClick={() => onSwitchPlatform("customer")}
                className="px-2.5 py-1 text-gray-600 hover:text-[#138A36] rounded-lg transition-colors flex items-center gap-1"
                title="Open Customer Website View"
              >
                <span>Customer</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => onSwitchPlatform("merchant")}
                className="px-2.5 py-1 text-gray-600 hover:text-[#138A36] rounded-lg transition-colors flex items-center gap-1"
                title="Open Merchant Portal View"
              >
                <span>Merchant</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowNotificationsDropdown(!showNotificationsDropdown); setShowProfileDropdown(false); }}
                className="p-2 rounded-xl border border-[#E5E7E5] hover:bg-[#EAF7EE] text-gray-700 relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {badgeCounts?.totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                    {badgeCounts.totalAlerts}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E5E7E5] p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E7E5] mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-gray-600">Admin Alerts</span>
                    <span className="text-[10px] bg-[#EAF7EE] text-[#138A36] font-bold px-2 py-0.5 rounded-full">{badgeCounts?.totalAlerts || 0} New</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                    <div 
                      onClick={() => { setCurrentAdminTab("verification"); setShowNotificationsDropdown(false); }}
                      className="p-2 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100"
                    >
                      <p className="font-bold text-amber-900">{badgeCounts?.pendingVerifications || 3} Pending Merchant Approvals</p>
                      <p className="text-[11px] text-amber-700">Nagpur Saree Palace & others waiting for review</p>
                    </div>
                    <div 
                      onClick={() => { setCurrentAdminTab("reports"); setShowNotificationsDropdown(false); }}
                      className="p-2 rounded-xl bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100"
                    >
                      <p className="font-bold text-red-900">{badgeCounts?.reports || 2} Unresolved Reports</p>
                      <p className="text-[11px] text-red-700">User complaint on store hours & spam review</p>
                    </div>
                    <div 
                      onClick={() => { setCurrentAdminTab("enquiries"); setShowNotificationsDropdown(false); }}
                      className="p-2 rounded-xl bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100"
                    >
                      <p className="font-bold text-green-900">{badgeCounts?.pendingEnquiries || 24} Enquiries Today</p>
                      <p className="text-[11px] text-green-700">High activity in Butibori & Sitabuldi</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Modal Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl border border-[#E5E7E5] hover:bg-[#EAF7EE] text-gray-700 transition-colors hidden sm:block"
              title="Admin Guide & Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotificationsDropdown(false); }}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-[#E5E7E5] hover:bg-[#EAF7EE] transition-colors cursor-pointer"
              >
                <img
                  src={adminUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                  alt={adminUser?.name}
                  className="w-7 h-7 rounded-lg object-cover ring-2 ring-[#138A36]/20"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-none text-[#111111]">{adminUser?.name || "Siddhant Shinde"}</p>
                  <p className="text-[10px] font-semibold text-[#138A36] leading-none mt-0.5">{adminUser?.role || "Super Admin"}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E5E7E5] p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="p-2 border-b border-[#E5E7E5] mb-1">
                    <p className="font-bold text-[#111111]">{adminUser?.name}</p>
                    <p className="text-gray-500">{adminUser?.email}</p>
                    <span className="inline-block mt-1 bg-[#EAF7EE] text-[#138A36] text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      Full Access Mode
                    </span>
                  </div>
                  <button
                    onClick={() => { setCurrentAdminTab("administrators"); setShowProfileDropdown(false); }}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-xl flex items-center gap-2 font-medium text-gray-700"
                  >
                    <UserCheck className="w-4 h-4 text-[#138A36]" />
                    <span>Admin Profile & Team</span>
                  </button>
                  <button
                    onClick={() => { setCurrentAdminTab("settings"); setShowProfileDropdown(false); }}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-xl flex items-center gap-2 font-medium text-gray-700"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>Platform Settings</span>
                  </button>
                  <button
                    onClick={() => { onSwitchPlatform("customer"); setShowProfileDropdown(false); }}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-xl flex items-center gap-2 font-medium text-gray-700"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Customer Website View</span>
                  </button>
                  <div className="pt-1 mt-1 border-t border-[#E5E7E5]">
                    <button
                      onClick={() => { alert("Admin session locked safely."); setShowProfileDropdown(false); }}
                      className="w-full text-left p-2 hover:bg-red-50 text-red-600 rounded-xl flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Lock Admin Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY CONTENT CONTAINER */}
      <div className="flex-1 flex max-w-[1920px] mx-auto w-full min-w-0">
        
        {/* DESKTOP & MOBILE SIDEBAR */}
        <aside className={`
          fixed lg:sticky top-14 left-0 z-20 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-[#E5E7E5] flex flex-col shrink-0 transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          
          {/* Sidebar Navigation Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
            {sidebarNavGroups.map((group, idx) => (
              <div key={idx}>
                <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1 font-mono">
                  {group.title}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComp = item.icon;
                    const isActive = currentAdminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentAdminTab(item.id);
                          if (typeof window !== 'undefined') {
                            window.history.pushState({}, '', `/admin/${item.id}`);
                          }
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-bold transition-all group cursor-pointer
                          ${isActive 
                            ? "bg-[#138A36] text-white shadow-xs" 
                            : "text-[#111111] hover:bg-[#EAF7EE] hover:text-[#138A36]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 truncate">
                          <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-[#138A36]"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {/* Badge or Count */}
                        {item.badge ? (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badgeColor || "bg-gray-200 text-gray-800"}`}>
                            {item.badge}
                          </span>
                        ) : item.count !== undefined ? (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                            {item.count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#E5E7E5] bg-[#F7F8F7] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span className="font-semibold">Platform Version</span>
              <span className="font-mono font-bold text-[#138A36]">v2.6.4 Live</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#138A36] animate-pulse"></span>
              <span>Nagpur Central Cluster Operational</span>
            </div>
          </div>
        </aside>

        {/* Backdrop overlay for mobile drawer */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            className="fixed inset-0 z-10 bg-black/40 lg:hidden"
          />
        )}

        {/* MAIN PANEL CONTENT VIEW */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          
          {/* Top Page Subtitle Banner */}
          <div className="mb-6 pb-4 border-b border-[#E5E7E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-500">{pageMeta.subtitle}</p>
            </div>

            {/* Quick Action Trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="bg-white hover:bg-[#EAF7EE] border border-[#E5E7E5] hover:border-[#DDF3E3] text-[#111111] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#138A36]" />
                <span>Global Search</span>
              </button>
              <button
                onClick={() => setCurrentAdminTab("verification")}
                className="bg-[#138A36] hover:bg-[#0B6B2B] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approvals ({badgeCounts?.pendingVerifications || 0})</span>
              </button>
            </div>
          </div>

          {/* Children View Component */}
          {children}
        </main>
      </div>

      {/* Global Search Overlay Modal */}
      {showSearchModal && (
        <AdminGlobalSearchModal
          onClose={() => setShowSearchModal(false)}
          customers={customers}
          merchants={merchants}
          shops={shops}
          products={products}
          enquiries={enquiries}
          reservations={reservations}
          creators={creators}
          campaigns={campaigns}
          onNavigate={(tab) => setCurrentAdminTab(tab)}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-[#111111] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#138A36]" /> GrowLocal Admin Guide
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p><strong>Central Command Center:</strong> Every action taken in this admin panel directly mutates the shared database. Changes to merchant verification, product prices, stock, categories, or offers reflect immediately on the customer site.</p>
              <p><strong>Permission Access:</strong> Private customer-merchant chats are permission-restricted. Accessing chat content generates an entry in the Audit Logs.</p>
              <p><strong>Hotkeys:</strong> Press <code>Ctrl + K</code> anywhere to open Global Search.</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-[#138A36] text-white font-bold rounded-xl text-xs"
            >
              Got it, close guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
