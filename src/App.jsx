import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import BottomNavigation from './components/BottomNavigation';
import LocationSelector from './components/LocationSelector';
import PhotoSearchModal from './components/PhotoSearchModal';
import DemandRequestModal from './components/DemandRequestModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

// Mock Datasets
import { 
  INITIAL_LOCATION, 
  CATEGORIES, 
  INITIAL_SHOPS, 
  INITIAL_PRODUCTS, 
  INITIAL_ENQUIRIES, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_RESERVATIONS, 
  MERCHANT_STATS, 
  LOCAL_CREATORS 
} from './data/mockData';

// Admin Master Mock Dataset
import {
  INITIAL_ADMIN_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_MERCHANTS,
  INITIAL_PENDING_VERIFICATIONS,
  INITIAL_FEATURED_SHOPS,
  INITIAL_LOCATIONS,
  SEARCH_DEMAND_GAPS,
  POPULAR_SEARCHES,
  INITIAL_OFFERS,
  INITIAL_REVIEWS,
  CAMPAIGNS_LIST,
  SUBSCRIPTION_PLANS,
  PAYMENTS_LOG,
  REVENUE_STATS,
  USER_REPORTS,
  REPORTED_CHATS,
  NOTIFICATION_CAMPAIGNS,
  INITIAL_CMS_CONTENT,
  DEMAND_HEATMAP_CLUSTERS,
  SYSTEM_HEALTH_SERVICES,
  INITIAL_AUDIT_LOGS
} from './data/adminMockData';

// Customer Views
import CustomerHome from './views/CustomerHome';
import CustomerSearch from './views/CustomerSearch';
import CustomerCategories from './views/CustomerCategories';
import CustomerSearchResults from './views/CustomerSearchResults';
import CustomerShopProfile from './views/CustomerShopProfile';
import CustomerProductDetails from './views/CustomerProductDetails';
import CustomerChat from './views/CustomerChat';
import CustomerEnquiries from './views/CustomerEnquiries';
import CustomerSavedShops from './views/CustomerSavedShops';
import CustomerReservations from './views/CustomerReservations';
import CustomerProfile from './views/CustomerProfile';

// Merchant Views
import MerchantDashboard from './views/MerchantDashboard';
import MerchantChats from './views/MerchantChats';
import MerchantEnquiries from './views/MerchantEnquiries';
import MerchantProducts from './views/MerchantProducts';
import MerchantShopProfile from './views/MerchantShopProfile';
import MerchantReservations from './views/MerchantReservations';
import MerchantAnalytics from './views/MerchantAnalytics';
import MerchantCreatorCampaigns from './views/MerchantCreatorCampaigns';
import MerchantOffers from './views/MerchantOffers';
import MerchantSubscription from './views/MerchantSubscription';

// Admin Views & Layout
import AdminLayout from './views/admin/AdminLayout';
import AdminDashboard from './views/admin/AdminDashboard';
import AdminCustomers from './views/admin/AdminCustomers';
import AdminMerchants from './views/admin/AdminMerchants';
import AdminVerificationCenter from './views/admin/AdminVerificationCenter';
import AdminShops from './views/admin/AdminShops';
import AdminProducts from './views/admin/AdminProducts';
import AdminCategories from './views/admin/AdminCategories';
import AdminLocations from './views/admin/AdminLocations';
import AdminSearchManagement from './views/admin/AdminSearchManagement';
import AdminEnquiries from './views/admin/AdminEnquiries';
import AdminChats from './views/admin/AdminChats';
import AdminReservations from './views/admin/AdminReservations';
import AdminOffers from './views/admin/AdminOffers';
import AdminReviews from './views/admin/AdminReviews';
import AdminCreators from './views/admin/AdminCreators';
import AdminCampaigns from './views/admin/AdminCampaigns';
import AdminSubscriptions from './views/admin/AdminSubscriptions';
import AdminPayments from './views/admin/AdminPayments';
import AdminReports from './views/admin/AdminReports';
import AdminNotifications from './views/admin/AdminNotifications';
import AdminContent from './views/admin/AdminContent';
import AdminAnalytics from './views/admin/AdminAnalytics';
import AdminSystemHealth from './views/admin/AdminSystemHealth';
import AdminAdministrators from './views/admin/AdminAdministrators';
import AdminSettings from './views/admin/AdminSettings';
import AdminStorageOverview from './views/admin/AdminStorageOverview';

// Landing Page
import MarketingLanding from './views/MarketingLanding';
import { 
  authService, 
  userService, 
  merchantService, 
  shopService, 
  productService, 
  categoryService, 
  searchService, 
  enquiryService, 
  chatService, 
  offerService,
  reservationService, 
  adminService 
} from './services';
import { 
  LayoutDashboard, Package, MessageSquare, Inbox, ShoppingBag, 
  TrendingUp, Sparkles, Tag, Store 
} from 'lucide-react';

const parseUrlRoute = () => {
  if (typeof window === 'undefined') return { platform: 'customer', tab: 'home', adminTab: 'dashboard' };
  const path = window.location.pathname.toLowerCase();

  if (path.startsWith('/admin')) {
    const sub = path.replace('/admin', '').replace(/^\//, '');
    const tabMap = {
      '': 'dashboard',
      'dashboard': 'dashboard',
      'customers': 'customers',
      'merchants': 'merchants',
      'verification': 'verification',
      'shops': 'shops',
      'products': 'products',
      'categories': 'categories',
      'locations': 'locations',
      'search': 'search',
      'enquiries': 'enquiries',
      'chats': 'chats',
      'reservations': 'reservations',
      'offers': 'offers',
      'reviews': 'reviews',
      'creators': 'creators',
      'campaigns': 'campaigns',
      'subscriptions': 'subscriptions',
      'payments': 'payments',
      'revenue': 'payments',
      'reports': 'reports',
      'notifications': 'notifications',
      'content': 'content',
      'banners': 'content',
      'announcements': 'content',
      'analytics': 'analytics',
      'demandintelligence': 'analytics',
      'systemhealth': 'systemHealth',
      'system-health': 'systemHealth',
      'administrators': 'administrators',
      'roles': 'administrators',
      'auditlogs': 'auditLogs',
      'audit-logs': 'auditLogs',
      'settings': 'settings'
    };
    const adminTab = tabMap[sub] || 'dashboard';
    return { platform: 'admin', tab: adminTab, adminTab: adminTab };
  }

  if (path.startsWith('/merchant')) {
    const sub = path.replace('/merchant', '').replace(/^\//, '');
    const tabMap = {
      '': 'merchantDashboard',
      'dashboard': 'merchantDashboard',
      'products': 'merchantProducts',
      'chats': 'merchantChats',
      'enquiries': 'merchantEnquiries',
      'reservations': 'merchantReservations',
      'analytics': 'merchantAnalytics',
      'creators': 'merchantCreators',
      'offers': 'merchantOffers',
      'profile': 'merchantShopProfile',
      'plans': 'merchantSubscription'
    };
    const merchantTab = tabMap[sub] || 'merchantDashboard';
    return { platform: 'merchant', tab: merchantTab, adminTab: 'dashboard' };
  }

  if (path === '/discover' || path === '/search') return { platform: 'customer', tab: 'search', adminTab: 'dashboard' };
  if (path === '/categories') return { platform: 'customer', tab: 'categories', adminTab: 'dashboard' };
  if (path === '/shops' || path === '/nearby-shops') return { platform: 'customer', tab: 'searchResults', adminTab: 'dashboard' };
  if (path === '/enquiries') return { platform: 'customer', tab: 'enquiries', adminTab: 'dashboard' };
  if (path === '/saved') return { platform: 'customer', tab: 'saved', adminTab: 'dashboard' };
  if (path === '/reservations') return { platform: 'customer', tab: 'reservations', adminTab: 'dashboard' };
  if (path === '/profile') return { platform: 'customer', tab: 'profile', adminTab: 'dashboard' };
  if (path === '/overview' || path === '/landing') return { platform: 'landing', tab: 'home', adminTab: 'dashboard' };

  return { platform: 'customer', tab: 'home', adminTab: 'dashboard' };
};

export default function App() {
  const initialRoute = parseUrlRoute();

  // Modals & Toast State (Declared first to avoid TDZ ReferenceErrors)
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPhotoSearchModal, setShowPhotoSearchModal] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState("customer");
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
  };

  // Main Navigation State initialized from URL location
  const [activePlatform, setActivePlatform] = useState(initialRoute.platform); 
  const [activeTab, setActiveTab] = useState(initialRoute.tab); 
  const [currentAdminTab, setCurrentAdminTab] = useState(initialRoute.adminTab);

  // Central URL Navigation Function with Protected Authentication Gate
  const navigateToPath = (path, platform, tab, adminTabName) => {
    // Check if user is attempting to access Merchant Portal
    if (platform === 'merchant' || (path && path.startsWith('/merchant'))) {
      const isMerchantAuth = currentUser && (currentUser.role === 'merchant' || currentUser.role === 'admin');
      if (!isMerchantAuth) {
        setAuthRole("merchant");
        setPendingRedirect({ path: path || '/merchant', platform: 'merchant', tab: tab || 'merchantDashboard', adminTabName });
        setShowAuthModal(true);
        triggerToast("🔐 Merchant Authentication Required: Please sign in or create a merchant account first.");
        return;
      }
    }

    // Check if user is attempting to access Super Admin Panel
    if (platform === 'admin' || (path && path.startsWith('/admin'))) {
      const isAdminAuth = currentUser && currentUser.role === 'admin';
      if (!isAdminAuth) {
        setAuthRole("admin");
        setPendingRedirect({ path: path || '/admin', platform: 'admin', tab: 'dashboard', adminTabName: adminTabName || 'dashboard' });
        setShowAuthModal(true);
        triggerToast("🔐 Admin Credentials Required: Please log in with Super Admin access.");
        return;
      }
    }

    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    if (platform) setActivePlatform(platform);
    if (tab) setActiveTab(tab);
    if (adminTabName) setCurrentAdminTab(adminTabName);
  };

  // Synchronize state with browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseUrlRoute();
      if (route.platform === 'merchant') {
        const isMerchantAuth = currentUser && (currentUser.role === 'merchant' || currentUser.role === 'admin');
        if (!isMerchantAuth) {
          setAuthRole("merchant");
          setShowAuthModal(true);
          setActivePlatform("customer");
          setActiveTab("home");
          return;
        }
      } else if (route.platform === 'admin') {
        const isAdminAuth = currentUser && currentUser.role === 'admin';
        if (!isAdminAuth) {
          setAuthRole("admin");
          setShowAuthModal(true);
          setActivePlatform("customer");
          setActiveTab("home");
          return;
        }
      }
      setActivePlatform(route.platform);
      setActiveTab(route.tab);
      if (route.adminTab) setCurrentAdminTab(route.adminTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Shared Master Platform Data State
  const [currentLocation, setCurrentLocation] = useState(INITIAL_LOCATION);
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [enquiries, setEnquiries] = useState(() => enquiryService.getStoredEnquiries());
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [reservations, setReservations] = useState(() => reservationService.getStoredReservations());
  const [savedShopIds, setSavedShopIds] = useState(() => {
    try {
      const saved = localStorage.getItem('growlocal_saved_shops');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Admin Master State
  const [adminUsers, setAdminUsers] = useState(INITIAL_ADMIN_USERS);
  const [customers, setCustomers] = useState(() => userService.getStoredRegisteredCustomers());
  const [merchants, setMerchants] = useState(() => merchantService.getStoredMerchants());
  const [pendingVerifications, setPendingVerifications] = useState(() => merchantService.getStoredPendingVerifications());
  const [featuredShops, setFeaturedShops] = useState(INITIAL_FEATURED_SHOPS);
  const [categories, setCategories] = useState(CATEGORIES);
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [searchDemandGaps, setSearchDemandGaps] = useState(SEARCH_DEMAND_GAPS);
  const [popularSearches, setPopularSearches] = useState(POPULAR_SEARCHES);
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [creators, setCreators] = useState(LOCAL_CREATORS);
  const [campaigns, setCampaigns] = useState(CAMPAIGNS_LIST);
  const [subscriptionPlans, setSubscriptionPlans] = useState(SUBSCRIPTION_PLANS);
  const [paymentsLog, setPaymentsLog] = useState(PAYMENTS_LOG);
  const [revenueStats, setRevenueStats] = useState(REVENUE_STATS);
  const [reports, setReports] = useState(USER_REPORTS);
  const [reportedChats, setReportedChats] = useState(REPORTED_CHATS);
  const [notificationCampaigns, setNotificationCampaigns] = useState(NOTIFICATION_CAMPAIGNS);
  const [cmsContent, setCmsContent] = useState(INITIAL_CMS_CONTENT);
  const [demandHeatmap, setDemandHeatmap] = useState(DEMAND_HEATMAP_CLUSTERS);
  const [systemHealth, setSystemHealth] = useState(SYSTEM_HEALTH_SERVICES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Selections & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState("shop-1");
  const [selectedProductId, setSelectedProductId] = useState("prod-1");

  // Fetch initial data & initialize Supabase Realtime listeners
  useEffect(() => {
    async function loadBackendData() {
      try {
        // Restore saved user session across page reloads
        const restoredUser = await authService.getCurrentUser();
        if (restoredUser) {
          setCurrentUser(restoredUser);
        } else {
          // If unauthenticated and on merchant or admin URL path, prompt for credentials
          const initial = parseUrlRoute();
          if (initial.platform === 'merchant') {
            setAuthRole("merchant");
            setPendingRedirect({ path: '/merchant', platform: 'merchant', tab: 'merchantDashboard' });
            setShowAuthModal(true);
            setActivePlatform("customer");
            setActiveTab("home");
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
            triggerToast("🔐 Merchant Authentication Required: Please sign in to access Merchant Portal.");
          } else if (initial.platform === 'admin') {
            setAuthRole("admin");
            setPendingRedirect({ path: '/admin', platform: 'admin', tab: 'dashboard', adminTabName: 'dashboard' });
            setShowAuthModal(true);
            setActivePlatform("customer");
            setActiveTab("home");
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
            triggerToast("🔐 Admin Credentials Required: Please sign in with Super Admin access.");
          }
        }

        const { data: fetchedCust } = await userService.getAllCustomers();
        if (fetchedCust && fetchedCust.length > 0) setCustomers(fetchedCust);

        const { data: fetchedMerchants } = await merchantService.getAllMerchants();
        if (fetchedMerchants && fetchedMerchants.length > 0) setMerchants(fetchedMerchants);

        const { data: fetchedVerifs } = await merchantService.getPendingVerifications();
        if (fetchedVerifs && fetchedVerifs.length > 0) setPendingVerifications(fetchedVerifs);

        const { data: fetchedShops } = await shopService.getAllShops();
        if (fetchedShops && fetchedShops.length > 0) setShops(fetchedShops);

        const { data: fetchedProducts } = await productService.getAllProducts();
        if (fetchedProducts && fetchedProducts.length > 0) setProducts(fetchedProducts);

        const { data: fetchedCats } = await categoryService.getCategories();
        if (fetchedCats && fetchedCats.length > 0) setCategories(fetchedCats);

        const { data: fetchedEnq } = await enquiryService.getEnquiries();
        if (fetchedEnq && fetchedEnq.length > 0) setEnquiries(fetchedEnq);
      } catch (err) {
        console.error("Backend loading notice:", err);
      }
    }
    loadBackendData();

    // Enable Supabase Realtime channels for live cross-platform updates
    const unSubCustomers = userService?.subscribeToCustomers ? userService.subscribeToCustomers(() => {
      userService.getAllCustomers().then(({ data }) => data && setCustomers(data));
    }) : null;

    const unSubShops = shopService?.subscribeToShops ? shopService.subscribeToShops(() => {
      shopService.getAllShops().then(({ data }) => data && setShops(data));
    }) : null;

    const unSubProducts = productService?.subscribeToProducts ? productService.subscribeToProducts(() => {
      productService.getAllProducts().then(({ data }) => data && setProducts(data));
    }) : null;

    const unSubEnquiries = enquiryService?.subscribeToEnquiries ? enquiryService.subscribeToEnquiries(() => {
      enquiryService.getEnquiries().then(({ data }) => data && setEnquiries(data));
    }) : null;

    const unSubOffers = offerService?.subscribeToOffers ? offerService.subscribeToOffers(() => {
      offerService.getOffers().then(({ data }) => data && setOffers(data));
    }) : null;

    const unSubReservations = reservationService?.subscribeToReservations ? reservationService.subscribeToReservations(() => {
      reservationService.getReservations().then(({ data }) => data && setReservations(data));
    }) : null;

    return () => {
      if (typeof unSubCustomers === 'function') unSubCustomers();
      if (typeof unSubShops === 'function') unSubShops();
      if (typeof unSubProducts === 'function') unSubProducts();
      if (typeof unSubEnquiries === 'function') unSubEnquiries();
      if (typeof unSubOffers === 'function') unSubOffers();
      if (typeof unSubReservations === 'function') unSubReservations();
    };
  }, []);

  const activeShop = shops.find(s => s.id === selectedShopId) || shops[0];
  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];



  const handleExecuteSearch = (query) => {
    setSearchQuery(query);
    setActivePlatform("customer");
    setActiveTab("searchResults");
  };

  const handleSelectShop = (shopId) => {
    setSelectedShopId(shopId);
    setActivePlatform("customer");
    setActiveTab("shopProfile");
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setActivePlatform("customer");
    setActiveTab("productDetails");
  };

  const handleToggleSave = (shopId) => {
    setSavedShopIds(prev => {
      const updated = prev.includes(shopId) ? prev.filter(id => id !== shopId) : [...prev, shopId];
      localStorage.setItem('growlocal_saved_shops', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: activePlatform === "merchant" ? "shop" : "customer",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
  };

  const handleSendCustomOffer = (offerObj) => {
    const newOfferMsg = {
      id: `msg-${Date.now()}`,
      sender: "shop",
      text: `We can offer ${offerObj.productName} (Size ${offerObj.size}) for ₹${offerObj.price}!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offer: offerObj
    };
    setMessages([...messages, newOfferMsg]);
  };

  const handleReserveProduct = (productToReserve, size) => {
    const userName = currentUser?.name || currentUser?.email?.split('@')[0] || "Customer";
    const userPhone = currentUser?.phone || "+91 98765 43210";
    const code = `GL-R-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRes = {
      id: code,
      reservationCode: code,
      customerName: userName,
      customerPhone: userPhone,
      shopId: productToReserve.shopId || "shop-1",
      shopName: productToReserve.shopName || "Trendy Wear",
      shopAddress: "Shop #14, Main Market, Model Town, Butibori, Nagpur",
      productName: productToReserve.name || productToReserve.productName,
      productImage: productToReserve.images ? productToReserve.images[0] : productToReserve.productImage,
      size: size || "L",
      price: typeof productToReserve.price === 'number' ? `₹${productToReserve.price}` : productToReserve.price || "₹1,299",
      reservedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      pickupTime: "Today by 7:00 PM",
      status: "Confirmed",
      qrCode: `${code}-NGP`
    };

    reservationService.saveReservationLocally(newRes);
    setReservations(reservationService.getStoredReservations());
    triggerToast(`✓ Product reserved! Show QR code at ${newRes.shopName}`);
    if (typeof window !== 'undefined') window.history.pushState({}, '', '/reservations');
    setActivePlatform("customer");
    setActiveTab("reservations");
  };

  const handleAddProduct = (newProd) => {
    setProducts([newProd, ...products]);
  };

  const handleSubmitDemand = (demandObj) => {
    const userName = currentUser?.name || currentUser?.email?.split('@')[0] || "Customer";
    const userPhone = currentUser?.phone || "+91 98765 43210";
    const code = `#GL${Math.floor(1000 + Math.random() * 9000)}`;

    const newEnq = {
      id: code,
      customerName: userName,
      customerPhone: userPhone,
      productRequested: demandObj.productName || demandObj.description,
      category: demandObj.category || "General Local Retail",
      targetArea: demandObj.targetArea || demandObj.area || "Sitabuldi, Nagpur",
      budget: demandObj.maxBudget ? `₹${demandObj.maxBudget}` : demandObj.budget || "₹1,500",
      submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: "Pending Quotes",
      merchantResponsesCount: 0,
      bestQuote: "Awaiting Shop Responses"
    };

    enquiryService.saveEnquiryLocally(newEnq);
    setEnquiries(enquiryService.getStoredEnquiries());
    setShowDemandModal(false);
  };

  // Connected Admin Mutation Handlers
  const handleApproveVerification = (verifId, businessName) => {
    setPendingVerifications(pendingVerifications.filter(v => v.id !== verifId));
    
    // Auto-update or add verified shop in master state!
    const updatedShops = shops.map(s => {
      if (s.name.toLowerCase() === businessName.toLowerCase()) {
        return { ...s, verified: true };
      }
      return s;
    });

    if (!updatedShops.some(s => s.name.toLowerCase() === businessName.toLowerCase())) {
      const newVerifiedShop = {
        id: `shop-${Date.now()}`,
        name: businessName,
        category: "Verified Local Merchant",
        verified: true,
        rating: 4.8,
        reviewsCount: 1,
        distance: "1.0 km away",
        address: "Nagpur Main Market",
        status: "Open",
        closingTime: "Closes 9 PM",
        openHours: "10:00 AM – 9:00 PM",
        openDays: "Mon – Sun",
        priceRange: "₹299 – ₹9,999",
        coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        logoImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80",
        about: "Verified local merchant on GrowLocal Nagpur.",
        photos: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"]
      };
      setShops([newVerifiedShop, ...shops]);
    } else {
      setShops(updatedShops);
    }

    // Append to Audit Logs
    const log = {
      id: `LOG-${Math.floor(500 + Math.random() * 500)}`,
      admin: "Siddhant Shinde",
      role: "Super Admin",
      action: "Approved Merchant Verification",
      entity: businessName,
      timestamp: new Date().toLocaleString(),
      ip: "103.44.112.5"
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleUpdateProductPrice = (productId, newPrice) => {
    setProducts(products.map(p => p.id === productId ? { ...p, price: newPrice } : p));
  };

  const handleAddCategory = (newCat) => {
    setCategories([...categories, newCat]);
  };

  const handleUpdateCMSContent = (newCMS) => {
    setCmsContent(newCMS);
  };

  const handleToggleFeatureShop = (shopId) => {
    if (featuredShops.some(fs => fs.shopId === shopId)) {
      setFeaturedShops(featuredShops.filter(fs => fs.shopId !== shopId));
      triggerToast("Shop removed from Featured section");
    } else {
      const newFS = { shopId, priority: featuredShops.length + 1, startDate: "2026-08-24", endDate: "2026-09-24", placement: "Homepage Banner & Search Top" };
      setFeaturedShops([...featuredShops, newFS]);
      triggerToast("✓ Shop featured on Customer Home & Search!");
    }
  };

  const handleLogAuditAction = (logEntry) => {
    setAuditLogs([
      { id: `LOG-${Math.floor(500 + Math.random() * 500)}`, ...logEntry },
      ...auditLogs
    ]);
  };

  // Badge counters for sidebar & header
  const badgeCounts = {
    customers: customers.length,
    merchants: merchants.length,
    pendingVerifications: pendingVerifications.length,
    shops: shops.length,
    products: products.length,
    pendingEnquiries: enquiries.filter(e => e.status === "Pending").length,
    reportedChats: reportedChats.length,
    reservations: reservations.length,
    reportedReviews: reviews.filter(r => r.flagged).length,
    payments: paymentsLog.length,
    reports: reports.length,
    totalAlerts: pendingVerifications.length + reports.length
  };

  return (
    <div className="min-h-screen bg-[#F7F8F7] flex flex-col font-sans selection:bg-[#EAF7EE] selection:text-[#138A36] overflow-x-hidden">
      
      {/* 1. SUPER ADMIN PLATFORM VIEW */}
      {activePlatform === "admin" ? (
        <AdminLayout
          currentAdminTab={currentAdminTab}
          setCurrentAdminTab={setCurrentAdminTab}
          onSwitchPlatform={(platform) => {
            if (platform !== "admin") window.history.pushState({}, '', '/');
            setActivePlatform(platform);
          }}
          adminUser={adminUsers[0]}
          badgeCounts={badgeCounts}
          customers={customers}
          merchants={merchants}
          shops={shops}
          products={products}
          enquiries={enquiries}
          reservations={reservations}
          creators={creators}
          campaigns={campaigns}
        >
          {currentAdminTab === "dashboard" && (
            <AdminDashboard
              stats={MERCHANT_STATS}
              customers={customers}
              merchants={merchants}
              pendingVerifications={pendingVerifications}
              enquiries={enquiries}
              reservations={reservations}
              onNavigate={setCurrentAdminTab}
              onOpenQuickActionModal={(action) => {
                triggerToast(`Executing admin action: ${action}`);
              }}
            />
          )}

          {currentAdminTab === "customers" && (
            <AdminCustomers
              customers={customers}
              onUpdateCustomerStatus={(id, status) => {
                setCustomers(customers.map(c => c.id === id ? { ...c, status } : c));
              }}
              onSaveInternalNote={(id, note) => {
                setCustomers(customers.map(c => c.id === id ? { ...c, internalNotes: note } : c));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "merchants" && (
            <AdminMerchants
              merchants={merchants}
              shops={shops}
              products={products}
              enquiries={enquiries}
              onNavigate={setCurrentAdminTab}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "verification" && (
            <AdminVerificationCenter
              pendingVerifications={pendingVerifications}
              onApproveVerification={handleApproveVerification}
              onRejectVerification={(id, reason) => {
                setPendingVerifications(pendingVerifications.filter(v => v.id !== id));
              }}
              onRequestMoreInfo={(id, notes) => {
                triggerToast(`Requested info for verification ${id}`);
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "shops" && (
            <AdminShops
              shops={shops}
              featuredShops={featuredShops}
              onToggleFeatureShop={handleToggleFeatureShop}
              onToggleShopStatus={(id) => {
                setShops(shops.map(s => s.id === id ? { ...s, status: s.status === "Open" ? "Closed" : "Open" } : s));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "products" && (
            <AdminProducts
              products={products}
              shops={shops}
              onUpdateProductPrice={handleUpdateProductPrice}
              onUpdateProductStock={(id, stock) => {
                setProducts(products.map(p => p.id === id ? { ...p, stockCount: stock } : p));
              }}
              onToggleHideProduct={(id) => {
                triggerToast(`Toggled hide status for product ${id}`);
              }}
              onDeleteProduct={(id) => {
                setProducts(products.filter(p => p.id !== id));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "categories" && (
            <AdminCategories
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={(id, updated) => {
                setCategories(categories.map(c => c.id === id ? { ...c, ...updated } : c));
              }}
              onDeleteCategory={(id) => {
                setCategories(categories.filter(c => c.id !== id));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "locations" && (
            <AdminLocations
              locations={locations}
              onAddLocation={(newLoc) => setLocations([...locations, newLoc])}
              onToggleLocationActive={(city) => {
                setLocations(locations.map(l => l.city === city ? { ...l, active: !l.active } : l));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "search" && (
            <AdminSearchManagement
              popularSearches={popularSearches}
              searchDemandGaps={searchDemandGaps}
              onNavigate={setCurrentAdminTab}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "enquiries" && (
            <AdminEnquiries
              enquiries={enquiries}
              onUpdateEnquiryStatus={(id, status) => {
                setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "chats" && (
            <AdminChats
              reportedChats={reportedChats}
              messages={messages}
              onLogAuditAction={handleLogAuditAction}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "reservations" && (
            <AdminReservations
              reservations={reservations}
              onUpdateReservationStatus={(id, status) => {
                setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "offers" && (
            <AdminOffers
              offers={offers}
              onToggleFeatureOffer={(id) => {
                setOffers(offers.map(o => o.id === id ? { ...o, featured: !o.featured } : o));
              }}
              onToggleOfferStatus={(id) => {
                setOffers(offers.map(o => o.id === id ? { ...o, status: o.status === "Active" ? "Expired" : "Active" } : o));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "reviews" && (
            <AdminReviews
              reviews={reviews}
              onUpdateReviewStatus={(id, status, flagged) => {
                setReviews(reviews.map(r => r.id === id ? { ...r, status, flagged } : r));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "creators" && (
            <AdminCreators
              creators={creators}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "campaigns" && (
            <AdminCampaigns
              campaigns={campaigns}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "subscriptions" && (
            <AdminSubscriptions
              subscriptionPlans={subscriptionPlans}
              merchants={merchants}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "payments" || currentAdminTab === "revenue" ? (
            <AdminPayments
              paymentsLog={paymentsLog}
              revenueStats={revenueStats}
              onShowToast={triggerToast}
            />
          ) : null}

          {currentAdminTab === "reports" && (
            <AdminReports
              reports={reports}
              onResolveReport={(id) => {
                setReports(reports.map(r => r.id === id ? { ...r, status: "Resolved" } : r));
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "notifications" && (
            <AdminNotifications
              notificationCampaigns={notificationCampaigns}
              onSendNotification={(notif) => {
                setNotificationCampaigns([notif, ...notificationCampaigns]);
              }}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "homepageBuilder" || currentAdminTab === "content" || currentAdminTab === "banners" || currentAdminTab === "announcements" ? (
            <AdminContent
              cmsContent={cmsContent}
              onUpdateCMSContent={handleUpdateCMSContent}
              onShowToast={triggerToast}
            />
          ) : null}

          {currentAdminTab === "analytics" || currentAdminTab === "demandIntelligence" ? (
            <AdminAnalytics
              demandHeatmap={demandHeatmap}
              searchDemandGaps={searchDemandGaps}
              popularSearches={popularSearches}
              onShowToast={triggerToast}
            />
          ) : null}

          {currentAdminTab === "systemHealth" && (
            <AdminSystemHealth
              systemHealthServices={systemHealth}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "storageOverview" && (
            <AdminStorageOverview
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "administrators" || currentAdminTab === "roles" ? (
            <AdminAdministrators
              adminUsers={adminUsers}
              onAddAdminUser={(newAdmin) => setAdminUsers([...adminUsers, newAdmin])}
              onShowToast={triggerToast}
            />
          ) : null}

          {currentAdminTab === "auditLogs" && (
            <AdminAuditLogs
              auditLogs={auditLogs}
              onShowToast={triggerToast}
            />
          )}

          {currentAdminTab === "settings" && (
            <AdminSettings
              onShowToast={triggerToast}
            />
          )}
        </AdminLayout>
      ) : (
        <>
          {/* Global Desktop Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentLocation={currentLocation}
            onOpenLocationModal={() => setShowLocationModal(true)}
            onOpenDemandModal={() => setShowDemandModal(true)}
            onOpenAuthModal={(role) => { setAuthRole(role); setShowAuthModal(true); }}
            activePlatform={activePlatform}
            setActivePlatform={setActivePlatform}
            savedCount={savedShopIds.length}
            enquiriesCount={enquiries.length}
            onNavigatePath={navigateToPath}
          />

          {/* Global Mobile Header */}
          <MobileHeader
            currentLocation={currentLocation}
            onOpenLocationModal={() => setShowLocationModal(true)}
            onOpenSearch={() => { setActivePlatform("customer"); setActiveTab("search"); }}
            onOpenAuthModal={(role) => { setAuthRole(role); setShowAuthModal(true); }}
            activePlatform={activePlatform}
            setActivePlatform={setActivePlatform}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenDemandModal={() => setShowDemandModal(true)}
          />

          {/* Main Content View Switcher */}
          <main className="flex-1 pb-16 md:pb-6">
            {/* MARKETING LANDING PAGE VIEW */}
            {activePlatform === "landing" && (
              <MarketingLanding
                onStartShopping={() => { setActivePlatform("customer"); setActiveTab("home"); }}
                onOpenMerchantAuth={(role) => { setAuthRole(role); setShowAuthModal(true); }}
              />
            )}

            {/* CUSTOMER PLATFORM VIEWS */}
            {activePlatform === "customer" && (
              <>
                {activeTab === "home" && (
                  <CustomerHome
                    shops={shops}
                    products={products}
                    categories={categories}
                    onSelectShop={handleSelectShop}
                    onSelectProduct={handleSelectProduct}
                    onSearch={handleExecuteSearch}
                    onOpenPhotoSearch={() => setShowPhotoSearchModal(true)}
                    onOpenDemandRequest={() => setShowDemandModal(true)}
                    onOpenLocationModal={() => setShowLocationModal(true)}
                    currentLocation={currentLocation}
                    cmsContent={cmsContent}
                  />
                )}

                {activeTab === "search" && (
                  <CustomerSearch
                    onSearch={handleExecuteSearch}
                    onOpenPhotoSearch={() => setShowPhotoSearchModal(true)}
                    onOpenLocationModal={() => setShowLocationModal(true)}
                    currentLocation={currentLocation}
                  />
                )}

                {activeTab === "categories" && (
                  <CustomerCategories
                    categories={categories}
                    shops={shops}
                    products={products}
                    onSelectCategory={(catName) => handleExecuteSearch(catName)}
                    onOpenDemandRequest={() => setShowDemandModal(true)}
                    onOpenLocationModal={() => setShowLocationModal(true)}
                    currentLocation={currentLocation}
                  />
                )}

                {activeTab === "searchResults" && (
                  <CustomerSearchResults
                    searchQuery={searchQuery}
                    shops={shops}
                    products={products}
                    onBack={() => setActiveTab("home")}
                    onSelectShop={handleSelectShop}
                    onSelectProduct={handleSelectProduct}
                    onOpenChat={(shop) => {
                      setSelectedShopId(shop.id);
                      setActiveTab("chat");
                    }}
                  />
                )}

                {activeTab === "shopProfile" && (
                  <CustomerShopProfile
                    shop={activeShop}
                    products={products}
                    isSaved={savedShopIds.includes(activeShop.id)}
                    onToggleSave={handleToggleSave}
                    onBack={() => setActiveTab("home")}
                    onSelectProduct={handleSelectProduct}
                    onOpenChat={() => setActiveTab("chat")}
                    onShowToast={triggerToast}
                  />
                )}

                {activeTab === "productDetails" && (
                  <CustomerProductDetails
                    product={activeProduct}
                    onBack={() => setActiveTab("home")}
                    onOpenChat={() => setActiveTab("chat")}
                    onReserveProduct={handleReserveProduct}
                    onShowToast={triggerToast}
                  />
                )}

                {activeTab === "chat" && (
                  <CustomerChat
                    shop={activeShop}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onBack={() => setActiveTab("shopProfile")}
                    onReserveFromOffer={(offer) => handleReserveProduct(offer, offer.size)}
                    onShowToast={triggerToast}
                  />
                )}

                {activeTab === "enquiries" && (
                  <CustomerEnquiries
                    enquiries={enquiries}
                    onOpenChat={(shop) => {
                      if (shop.id) setSelectedShopId(shop.id);
                      setActiveTab("chat");
                    }}
                  />
                )}

                {activeTab === "saved" && (
                  <CustomerSavedShops
                    shops={shops}
                    savedShopIds={savedShopIds}
                    onSelectShop={handleSelectShop}
                    onRemoveSaved={handleToggleSave}
                    onOpenSearch={() => setActiveTab("search")}
                  />
                )}

                {activeTab === "reservations" && (
                  <CustomerReservations
                    reservations={reservations}
                    onShowToast={triggerToast}
                  />
                )}

                {activeTab === "profile" && (
                  <CustomerProfile
                    onNavigate={setActiveTab}
                    onOpenAuthModal={(role) => { setAuthRole(role); setShowAuthModal(true); }}
                    onSwitchPlatform={setActivePlatform}
                    savedCount={savedShopIds.length}
                    enquiriesCount={enquiries.length}
                    reservationsCount={reservations.length}
                    currentUser={currentUser}
                    onLogOut={() => {
                      setCurrentUser(null);
                      authService.logout();
                      triggerToast("Logged out successfully");
                    }}
                  />
                )}
              </>
            )}

            {/* MERCHANT / BUSINESS PLATFORM VIEWS */}
            {activePlatform === "merchant" && (
              <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row gap-4 md:gap-6">
                <aside className="w-full md:w-64 bg-white border border-[#E5E7E5] rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-xs space-y-3 md:space-y-4 shrink-0 h-fit">
                  <div className="p-3 bg-[#EAF7EE] rounded-2xl border border-[#DDF3E3] flex items-center justify-between md:block">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#138A36] uppercase tracking-wider block">Logged In Shop</span>
                      <p className="font-bold text-sm text-[#111111] truncate">{shops[0].name}</p>
                      <p className="text-[11px] text-[#666666]">Model Town, Nagpur</p>
                    </div>
                    <button
                      onClick={() => setActivePlatform("customer")}
                      className="md:hidden bg-white text-[#138A36] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#DDF3E3]"
                    >
                      Customer View
                    </button>
                  </div>

                  <nav className="flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 text-xs font-bold text-[#111111]">
                    <button
                      onClick={() => setActiveTab("merchantDashboard")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantDashboard" || activeTab === "home" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantProducts")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantProducts" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <Package className="w-4 h-4 shrink-0" />
                      <span>Products ({products.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantChats")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantChats" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>Chats</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantEnquiries")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantEnquiries" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <Inbox className="w-4 h-4 shrink-0" />
                      <span>Enquiries ({enquiries.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantReservations")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantReservations" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span>Reservations ({reservations.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantAnalytics")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantAnalytics" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 shrink-0" />
                      <span>Analytics</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantCreators")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantCreators" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Creators</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantOffers")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantOffers" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <Tag className="w-4 h-4 shrink-0" />
                      <span>Offers</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantShopProfile")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantShopProfile" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <Store className="w-4 h-4 shrink-0" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("merchantSubscription")}
                      className={`px-3 py-2 md:p-3 rounded-xl flex items-center gap-2 md:gap-3 transition-colors shrink-0 ${
                        activeTab === "merchantSubscription" ? "bg-[#138A36] text-white" : "bg-gray-50 md:bg-transparent hover:bg-gray-100"
                      }`}
                    >
                      <Tag className="w-4 h-4 shrink-0" />
                      <span>Plans</span>
                    </button>
                  </nav>

                  <div className="hidden md:block pt-2 border-t border-[#E5E7E5]">
                    <button
                      onClick={() => setActivePlatform("customer")}
                      className="w-full p-2.5 bg-[#F7F8F7] hover:bg-gray-200 text-[#111111] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Customer App View</span>
                    </button>
                  </div>
                </aside>

                <div className="flex-1 min-w-0">
                  {(activeTab === "merchantDashboard" || activeTab === "home") && (
                    <MerchantDashboard
                      stats={MERCHANT_STATS}
                      enquiries={enquiries}
                      onNavigateMerchant={setActiveTab}
                      currentUser={currentUser}
                      merchantProfile={merchants.find(m => m.email?.toLowerCase() === currentUser?.email?.toLowerCase())}
                    />
                  )}

                  {activeTab === "merchantChats" && (
                    <MerchantChats
                      enquiries={enquiries}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      onSendCustomOffer={handleSendCustomOffer}
                      onShowToast={triggerToast}
                    />
                  )}

                  {activeTab === "merchantEnquiries" && (
                    <MerchantEnquiries
                      enquiries={enquiries}
                      onOpenChat={() => setActiveTab("merchantChats")}
                      onShowToast={triggerToast}
                    />
                  )}

                  {activeTab === "merchantProducts" && (
                    <MerchantProducts
                      products={products}
                      onAddProduct={handleAddProduct}
                      onShowToast={triggerToast}
                    />
                  )}

                  {activeTab === "merchantShopProfile" && (
                    <MerchantShopProfile
                      shop={shops[0]}
                      onPreviewPublic={() => {
                        setSelectedShopId(shops[0].id);
                        setActivePlatform("customer");
                        setActiveTab("shopProfile");
                      }}
                      onShowToast={triggerToast}
                    />
                  )}

                  {activeTab === "merchantReservations" && (
                    <MerchantReservations
                      reservations={reservations}
                      onShowToast={triggerToast}
                    />
                  )}

                  {activeTab === "merchantAnalytics" && (
                    <MerchantAnalytics
                      stats={MERCHANT_STATS}
                    />
                  )}

                  {activeTab === "merchantCreators" && (
                    <MerchantCreatorCampaigns
                      creators={creators}
                      onShowToast={triggerToast}
                    />
                  )}

                  {activeTab === "merchantOffers" && (
                    <MerchantOffers
                      onShowToast={triggerToast}
                    />
                  )}

                  {activeTab === "merchantSubscription" && (
                    <MerchantSubscription
                      onShowToast={triggerToast}
                    />
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Global Footer */}
          <footer className="bg-white border-t border-[#E5E7E5] py-8 md:py-12 px-4 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#138A36] rounded-lg flex items-center justify-center text-white text-base font-black">
                    🌱
                  </div>
                  <span className="text-lg font-black tracking-tight text-[#111111] font-poppins">GrowLocal</span>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Find Local. Buy Local. Grow Local. Connecting Nagpur customers directly with nearby verified merchants.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider mb-3">Discover</h4>
                <ul className="space-y-2 text-xs text-[#666666]">
                  <li><button onClick={() => { setActivePlatform("customer"); setActiveTab("searchResults"); }} className="hover:text-[#138A36]">Nearby Shops</button></li>
                  <li><button onClick={() => { setActivePlatform("customer"); setActiveTab("search"); }} className="hover:text-[#138A36]">Popular Categories</button></li>
                  <li><button onClick={() => { setActivePlatform("customer"); setActiveTab("search"); }} className="hover:text-[#138A36]">Product Search</button></li>
                  <li><button onClick={() => setShowDemandModal(true)} className="hover:text-[#138A36]">Tell Shops What You Need</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider mb-3">Businesses</h4>
                <ul className="space-y-2 text-xs text-[#666666]">
                  <li><button onClick={() => { setAuthRole("merchant"); setShowAuthModal(true); }} className="hover:text-[#138A36]">List Your Shop Free</button></li>
                  <li><button onClick={() => setActivePlatform("merchant")} className="hover:text-[#138A36]">Merchant Dashboard</button></li>
                  <li><button onClick={() => { setActivePlatform("merchant"); setActiveTab("merchantCreators"); }} className="hover:text-[#138A36]">GrowLocal Creators</button></li>
                  <li><button onClick={() => { setActivePlatform("merchant"); setActiveTab("merchantSubscription"); }} className="hover:text-[#138A36]">Membership Plans</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider mb-3">Company</h4>
                <ul className="space-y-2 text-xs text-[#666666]">
                  <li><button onClick={() => setActivePlatform("landing")} className="hover:text-[#138A36]">About GrowLocal</button></li>
                  <li><button onClick={() => { window.history.pushState({}, '', '/admin'); setActivePlatform("admin"); }} className="hover:text-[#138A36] font-bold text-[#138A36]">Super Admin Panel</button></li>
                  <li><a href="#" className="hover:text-[#138A36]">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-[#138A36]">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-[#E5E7E5] flex flex-col md:flex-row items-center justify-between text-xs text-[#666666] gap-3 text-center md:text-left">
              <p>© 2026 GrowLocal. All rights reserved. Designed for Nagpur & Local Retail Growth.</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#138A36]"></span>
                <span>Nagpur Commercial Platform Operational</span>
              </div>
            </div>
          </footer>

          {/* Global Bottom Navigation for Mobile */}
          <BottomNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activePlatform={activePlatform}
            setActivePlatform={setActivePlatform}
            savedCount={savedShopIds.length}
            enquiriesCount={enquiries.length}
          />
        </>
      )}

      {/* Modals & Toast Overlays */}
      {showLocationModal && (
        <LocationSelector
          currentLocation={currentLocation}
          onSelectLocation={setCurrentLocation}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {showPhotoSearchModal && (
        <PhotoSearchModal
          onClose={() => setShowPhotoSearchModal(false)}
          onFindShops={(detectedItem) => handleExecuteSearch(detectedItem)}
        />
      )}

      {showDemandModal && (
        <DemandRequestModal
          onClose={() => setShowDemandModal(false)}
          onSubmitDemand={handleSubmitDemand}
        />
      )}

      {showAuthModal && (
        <AuthModal
          initialMode={authRole}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(userData) => {
            setCurrentUser(userData);
            triggerToast(`✓ Authenticated as ${userData.name || userData.email}!`);

            // Save & sync newly registered customer or merchant to Admin management
            if (userData.email && userData.role !== 'merchant' && userData.role !== 'admin') {
              userService.registerCustomerLocally(userData);
              setCustomers(userService.getStoredRegisteredCustomers());
            } else if (userData.role === 'merchant') {
              merchantService.registerMerchantLocally(userData);
              setMerchants(merchantService.getStoredMerchants());
              setPendingVerifications(merchantService.getStoredPendingVerifications());
            }

            const target = pendingRedirect || {};
            setPendingRedirect(null);

            if (userData.role === "admin" || target.platform === "admin") {
              if (typeof window !== 'undefined') window.history.pushState({}, '', target.path || '/admin');
              setActivePlatform("admin");
              setCurrentAdminTab(target.adminTabName || "dashboard");
              setActiveTab("dashboard");
            } else if (userData.role === "merchant" || target.platform === "merchant") {
              if (typeof window !== 'undefined') window.history.pushState({}, '', target.path || '/merchant');
              setActivePlatform("merchant");
              setActiveTab(target.tab || "merchantDashboard");
            } else {
              if (typeof window !== 'undefined') window.history.pushState({}, '', target.path || '/profile');
              setActivePlatform("customer");
              setActiveTab("profile");
            }
          }}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
