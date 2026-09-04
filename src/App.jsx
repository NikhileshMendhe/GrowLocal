import React, { useState, useEffect } from 'react';
import { X, LogOut, ShieldCheck } from 'lucide-react';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import BottomNavigation from './components/BottomNavigation';
import LocationSelector from './components/LocationSelector';
import PhotoSearchModal from './components/PhotoSearchModal';
import DemandRequestModal from './components/DemandRequestModal';
import AuthModal from './components/AuthModal';
import MerchantAuthPage from './components/MerchantAuthPage';
import AdminAuthPage from './components/AdminAuthPage';
import MerchantShopSetupModal from './components/MerchantShopSetupModal';
import MerchantOnboardingWizard from './components/MerchantOnboardingWizard';
import BuyNowModal from './components/BuyNowModal';
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
import VendorTerms from './views/VendorTerms';

// Merchant Views
import MerchantLayout from './views/MerchantLayout';
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
import MerchantMarketingPage from './views/MerchantMarketingPage';
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

const extractShopFromUrl = () => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const search = new URLSearchParams(window.location.search);
  const hash = window.location.hash;

  // 1. Query param: ?shop=xyz or ?shopId=xyz or ?id=xyz or ?store=xyz
  const queryParam = search.get('shop') || search.get('shopId') || search.get('id') || search.get('store');
  if (queryParam) return decodeURIComponent(queryParam).trim();

  // 2. Path: /shop/xyz or /shops/xyz or /store/xyz
  const pathMatch = path.match(/^\/(?:shop|shops|store|stores)\/([^\/?#]+)/i);
  if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1]).trim();

  // 3. Hash: #/shop/xyz or #shop=xyz
  if (hash) {
    const hashMatch = hash.match(/(?:shop|shops|store)\/([^\/?#&]+)/i);
    if (hashMatch && hashMatch[1]) return decodeURIComponent(hashMatch[1]).trim();
    const hashParams = new URLSearchParams(hash.replace(/^#\/?/, '?'));
    const hashParam = hashParams.get('shop') || hashParams.get('shopId') || hashParams.get('id');
    if (hashParam) return decodeURIComponent(hashParam).trim();
  }

  return null;
};

const parseUrlRoute = () => {
  if (typeof window === 'undefined') return { platform: 'customer', tab: 'home', adminTab: 'dashboard' };
  const path = window.location.pathname.toLowerCase();

  // Check if a direct shop link was scanned or shared (e.g. /shop/yasnick or /shops?id=...)
  const targetShop = extractShopFromUrl();
  if (targetShop && targetShop !== 'all') {
    return { platform: 'customer', tab: 'shopProfile', adminTab: 'dashboard', shopId: targetShop };
  }

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
  if (path === '/shops' || path === '/nearby-shops' || path === '/stores') return { platform: 'customer', tab: 'searchResults', adminTab: 'dashboard' };
  if (path === '/enquiries') return { platform: 'customer', tab: 'enquiries', adminTab: 'dashboard' };
  if (path === '/saved') return { platform: 'customer', tab: 'saved', adminTab: 'dashboard' };
  if (path === '/reservations') return { platform: 'customer', tab: 'reservations', adminTab: 'dashboard' };
  if (path === '/profile') return { platform: 'customer', tab: 'profile', adminTab: 'dashboard' };
  if (path === '/overview' || path === '/landing') return { platform: 'landing', tab: 'home', adminTab: 'dashboard' };
  if (path === '/for-merchants' || path === '/grow' || path === '/merchant-info') return { platform: 'merchantMarketing', tab: 'home', adminTab: 'dashboard' };

  return { platform: 'customer', tab: 'home', adminTab: 'dashboard' };
};

export default function App() {
  const initialRoute = parseUrlRoute();

  // Modals & Toast State (Declared first to avoid TDZ ReferenceErrors)
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPhotoSearchModal, setShowPhotoSearchModal] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShopSetupModal, setShowShopSetupModal] = useState(false);
  const [showExitMerchantModal, setShowExitMerchantModal] = useState(false);
  const [showExitAdminModal, setShowExitAdminModal] = useState(false);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [buyNowInitialSize, setBuyNowInitialSize] = useState(null);
  const [authRole, setAuthRole] = useState("customer");
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [pendingUserAction, setPendingUserAction] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
  };

  // Central User Logout Handler: clears session and restores header auth buttons
  const handleUserLogout = () => {
    authService.logout();
    setCurrentUser(null);
    triggerToast("👋 You have been logged out successfully.");
    if (activeTab === 'profile') {
      setActiveTab('home');
    }
  };

  const handleOpenBuyNow = (product, initialSize = null) => {
    requireUserAuth('buyNow', { product, initialSize }, () => {
      setBuyNowProduct(product);
      setBuyNowInitialSize(initialSize || product?.sizes?.[0] || 'Standard');
      setShowBuyNowModal(true);
    });
  };

  const handleCompleteBuyNowOrder = (order) => {
    reservationService.saveReservationLocally(order);
    setReservations(reservationService.getStoredReservations());
    triggerToast(`🎉 Order Placed! Order ID: ${order.id}`);
  };

  // Secure exit from Merchant Portal: logs out session and returns to Customer Home
  const handleConfirmExitMerchantLogout = () => {
    setShowExitMerchantModal(false);
    handleUserLogout();
    setActivePlatform('customer');
    setActiveTab('home');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  // Secure exit from Super Admin Panel: logs out session and returns to Customer Home
  const handleConfirmExitAdminLogout = () => {
    setShowExitAdminModal(false);
    handleUserLogout();
    setActivePlatform('customer');
    setActiveTab('home');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    triggerToast("🔒 Super Admin session terminated safely.");
  };

  // Helper to intercept unauthenticated user actions and resume after login
  const requireUserAuth = (actionType, payload, onProceed) => {
    if (currentUser) {
      onProceed();
    } else {
      setPendingUserAction({ type: actionType, payload, onProceed });
      setAuthRole("customer");
      setShowAuthModal(true);
      if (actionType === 'buyNow') {
        triggerToast("🔐 Account Required: Please log in or create an account first to buy this product.");
      } else {
        triggerToast("🔐 Account Required: Please log in or create a free account to continue.");
      }
    }
  };

  // handleAddShop: save to Supabase + local storage and update shared state
  const handleAddShop = async (newShop) => {
    try {
      const { data: savedShop } = await shopService.createShop(newShop);
      const shopToUse = savedShop || newShop;
      setShops(prev => [shopToUse, ...prev.filter(s => s.id !== shopToUse.id)]);
      triggerToast(`✓ "${shopToUse.name}" is now live on GrowLocal!`);
      return shopToUse;
    } catch (e) {
      console.warn('handleAddShop fallback notice:', e);
      shopService.saveShopLocally(newShop);
      setShops(prev => [newShop, ...prev.filter(s => s.id !== newShop.id)]);
      triggerToast(`✓ "${newShop.name}" is live!`);
      return newShop;
    }
  };

  // Central Auth Opener: "merchant" role opens dedicated MerchantAuthPage, "customer" opens shared modal
  const handleOpenAuthModal = (role = "customer") => {
    if (role === "merchant") {
      setPendingRedirect({ path: '/merchant', platform: 'merchant', tab: 'merchantDashboard' });
      setActivePlatform('merchantAuth');
      if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant');
    } else {
      setAuthRole(role || "customer");
      setShowAuthModal(true);
    }
  };

  // Main Navigation State initialized from URL location
  const [activePlatform, setActivePlatform] = useState(initialRoute.platform); 
  const [activeTab, setActiveTab] = useState(initialRoute.tab); 
  const [currentAdminTab, setCurrentAdminTab] = useState(initialRoute.adminTab);

  // Browser Back Button & Exit Guard for Merchant Portal
  useEffect(() => {
    if (activePlatform !== 'merchant') return;

    if (typeof window !== 'undefined') {
      // Push guard entry so laptop/browser back button hits popstate
      window.history.pushState({ merchantGuard: true }, '', window.location.pathname);

      const handlePopState = () => {
        // Intercept browser back button on laptop / computer
        window.history.pushState({ merchantGuard: true }, '', window.location.pathname);
        setShowExitMerchantModal(true);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [activePlatform]);

  // Browser Back Button & Exit Guard for Super Admin Panel
  useEffect(() => {
    if (activePlatform !== 'admin') return;
    const isSuperAdmin = currentUser && 
      currentUser.email?.toLowerCase() === 'nikhileshmendhe07@gmail.com' &&
      (currentUser.role === 'admin' || currentUser.role === 'super_admin');
    
    if (!isSuperAdmin) return;

    if (typeof window !== 'undefined') {
      // Push guard entry so laptop/browser back button hits popstate
      window.history.pushState({ adminGuard: true }, '', window.location.pathname);

      const handlePopState = () => {
        // Intercept browser back button on laptop / computer
        window.history.pushState({ adminGuard: true }, '', window.location.pathname);
        setShowExitAdminModal(true);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [activePlatform, currentUser]);

  // Central URL Navigation Function with Protected Authentication Gate
  const navigateToPath = (path, platform, tab, adminTabName) => {
    // Check if user is attempting to access Merchant Portal
    if (platform === 'merchant' || (path && path.startsWith('/merchant'))) {
      const isMerchantAuth = currentUser && (currentUser.role === 'merchant' || currentUser.role === 'admin');
      if (!isMerchantAuth) {
        // Show dedicated Merchant Auth full-page instead of modal
        setPendingRedirect({ path: path || '/merchant', platform: 'merchant', tab: tab || 'merchantDashboard', adminTabName });
        setActivePlatform('merchantAuth');
        if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant');
        return;
      }
    }

    // Check if user is attempting to access Super Admin Panel
    if (platform === 'admin' || (path && path.startsWith('/admin'))) {
      setActivePlatform('admin');
      if (adminTabName) setCurrentAdminTab(adminTabName);
      if (typeof window !== 'undefined' && window.location.pathname !== path) {
        window.history.pushState({}, '', path || '/admin');
      }
      return;
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
      if (route.shopId) {
        setSelectedShopId(route.shopId);
      }
      if (route.platform === 'merchant') {
        const isMerchantAuth = currentUser && (currentUser.role === 'merchant' || currentUser.role === 'admin' || currentUser.role === 'super_admin');
        if (!isMerchantAuth) {
          setActivePlatform('merchantAuth');
          return;
        }
      } else if (route.platform === 'admin') {
        setActivePlatform('admin');
        if (route.adminTab) setCurrentAdminTab(route.adminTab);
        return;
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
  const [shops, setShops] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (_) {}
    return INITIAL_SHOPS;
  });
  const [products, setProducts] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('growlocal_merchant_products') || '[]');
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (_) {}
    return INITIAL_PRODUCTS;
  });
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
  const [kpiMetrics, setKpiMetrics] = useState(null);

  // Selections & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState(() => initialRoute.shopId || "shop-1");
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
            setPendingRedirect({ path: '/merchant', platform: 'merchant', tab: 'merchantDashboard' });
            setActivePlatform('merchantAuth');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant');
          } else if (initial.platform === 'admin') {
            setActivePlatform('admin');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/admin');
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

        const fetchedKPIs = await adminService.getDashboardKPIs();
        if (fetchedKPIs) setKpiMetrics(fetchedKPIs);

        const { data: fetchedLogs } = await adminService.getAuditLogs();
        if (fetchedLogs && fetchedLogs.length > 0) setAuditLogs(fetchedLogs);
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

  // Resilient Shop Matching: matches by id, slugified name, exact name, or email prefix
  const activeShop = shops.find(s => {
    if (!selectedShopId) return false;
    const target = String(selectedShopId).toLowerCase().trim();
    return (
      String(s.id).toLowerCase() === target ||
      s.name?.toLowerCase().trim() === target ||
      s.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') === target.replace(/[^a-z0-9]/g, '-') ||
      (s.merchantEmail && s.merchantEmail.toLowerCase().startsWith(target)) ||
      (s.merchantId && String(s.merchantId).toLowerCase() === target)
    );
  }) || (selectedShopId && selectedShopId !== 'shop-1' ? {
    id: selectedShopId,
    name: selectedShopId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: 'Verified Local Retail',
    verified: true,
    rating: 4.8,
    reviewsCount: 1,
    distance: '0.5 km away',
    address: 'Nagpur, Maharashtra',
    status: 'Open',
    openHours: '10:00 AM – 9:00 PM',
    priceRange: '₹299 – ₹9,999',
    about: `Welcome to our store on GrowLocal! Browse our in-store digital catalog, check real stock, and chat directly with us.`,
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80'
  } : shops[0]);

  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Automatically restore / fetch merchant shop if referenced by URL slug or ID
  useEffect(() => {
    if (!selectedShopId) return;
    const target = String(selectedShopId).toLowerCase().trim();
    const alreadyFound = shops.some(s => 
      String(s.id).toLowerCase() === target ||
      s.name?.toLowerCase().trim() === target ||
      s.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') === target.replace(/[^a-z0-9]/g, '-')
    );
    if (alreadyFound) return;

    try {
      const storedShops = JSON.parse(localStorage.getItem('growlocal_merchant_shops') || '[]');
      const localMatch = storedShops.find(s => 
        String(s.id).toLowerCase() === target || 
        s.name?.toLowerCase().trim() === target ||
        s.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') === target.replace(/[^a-z0-9]/g, '-')
      );
      if (localMatch) {
        setShops(prev => [localMatch, ...prev.filter(s => s.id !== localMatch.id)]);
        return;
      }

      const storedMerchants = JSON.parse(localStorage.getItem('growlocal_registered_merchants') || '[]');
      const mMatch = storedMerchants.find(m => 
        String(m.id).toLowerCase() === target || 
        m.name?.toLowerCase().trim() === target ||
        (m.email && m.email.toLowerCase().startsWith(target))
      );
      if (mMatch) {
        const synthShop = {
          id: mMatch.id || selectedShopId,
          name: mMatch.shopName || mMatch.name || selectedShopId,
          category: 'Verified Local Retail',
          verified: true,
          rating: 4.8,
          reviewsCount: 1,
          distance: '0.5 km away',
          address: mMatch.address || 'Nagpur, Maharashtra',
          status: 'Open',
          openHours: '10:00 AM – 9:00 PM',
          about: `${mMatch.name || selectedShopId} is a verified neighborhood merchant on GrowLocal.`,
          coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          logoImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=200&q=80'
        };
        setShops(prev => [synthShop, ...prev]);
        return;
      }
    } catch (_) {}

    shopService.getAllShops().then(({ data }) => {
      if (data && data.length > 0) {
        setShops(prev => {
          const merged = [...prev];
          data.forEach(item => {
            if (!merged.some(m => m.id === item.id)) merged.push(item);
          });
          return merged;
        });
      }
    });
  }, [selectedShopId]);

  const handleExecuteSearch = (query) => {
    setSearchQuery(query);
    setActivePlatform("customer");
    setActiveTab("searchResults");
  };

  const handleSelectShop = (shopId) => {
    setSelectedShopId(shopId);
    setActivePlatform("customer");
    setActiveTab("shopProfile");
    if (typeof window !== 'undefined') {
      const targetShopObj = shops.find(s => s.id === shopId);
      const urlSlug = targetShopObj?.name ? targetShopObj.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') : shopId;
      window.history.pushState({}, '', `/shop/${encodeURIComponent(urlSlug)}`);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setActivePlatform("customer");
    setActiveTab("productDetails");
  };

  const handleToggleSave = (shopId) => {
    requireUserAuth('save', shopId, () => {
      setSavedShopIds(prev => {
        const updated = prev.includes(shopId) ? prev.filter(id => id !== shopId) : [...prev, shopId];
        localStorage.setItem('growlocal_saved_shops', JSON.stringify(updated));
        return updated;
      });
      triggerToast(savedShopIds.includes(shopId) ? "Shop removed from saved list" : "✓ Shop saved to your collection!");
    });
  };

  const handleSendMessage = (text) => {
    requireUserAuth('chat', text, () => {
      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: activePlatform === "merchant" ? "shop" : "customer",
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMsg]);
    });
  };

  const handleSendCustomOffer = (offerObj) => {
    const newOfferMsg = {
      id: `msg-${Date.now()}`,
      sender: "shop",
      text: `We can offer ${offerObj.productName} (Size ${offerObj.size}) for ₹${offerObj.price}!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offer: offerObj
    };
    setMessages(prev => [...prev, newOfferMsg]);
  };

  const handleReserveProduct = (productToReserve, size) => {
    requireUserAuth('reserve', { productToReserve, size }, () => {
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
    });
  };

  const handleAddProduct = async (newProd) => {
    try {
      const { data: savedProd } = await productService.createProduct(newProd);
      const prodToUse = savedProd || newProd;
      setProducts(prev => [prodToUse, ...prev.filter(p => p.id !== prodToUse.id)]);
      triggerToast(`🎉 "${prodToUse.name}" is now live on GrowLocal Customer Home!`);
      return prodToUse;
    } catch (e) {
      console.warn('handleAddProduct error:', e);
      productService.saveProductLocally(newProd);
      setProducts(prev => [newProd, ...prev.filter(p => p.id !== newProd.id)]);
      triggerToast(`🎉 "${newProd.name}" is live!`);
      return newProd;
    }
  };

  const handleUpdateProduct = async (updatedProd) => {
    try {
      if (productService.updateProduct) {
        await productService.updateProduct(updatedProd.id, updatedProd);
      }
    } catch (e) {
      console.warn('handleUpdateProduct error:', e);
    }
    productService.saveProductLocally(updatedProd);
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? { ...p, ...updatedProd } : p));
    triggerToast(`✓ "${updatedProd.name}" updated successfully!`);
    return updatedProd;
  };

  const handleSubmitDemand = (demandObj) => {
    requireUserAuth('demand', demandObj, () => {
      const userName = currentUser?.name || currentUser?.email?.split('@')[0] || "Customer";
      const userPhone = currentUser?.phone || "+91 98765 43210";
      const code = `#GL${Math.floor(1000 + Math.random() * 9000)}`;

      const newEnq = {
        id: code,
        customerName: userName,
        customerPhone: userPhone,
        productRequested: demandObj.productName || demandObj.description || "Product Demand Request",
        category: demandObj.category || "General Local Retail",
        targetArea: demandObj.targetArea || demandObj.area || "Sitabuldi, Nagpur",
        budget: demandObj.maxBudget ? `₹${demandObj.maxBudget}` : demandObj.budget || "₹1,500",
        submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: "Pending Merchant Offers",
        responsesCount: 0,
        merchantQuotes: []
      };

      enquiryService.saveEnquiryLocally(newEnq);
      setEnquiries(enquiryService.getStoredEnquiries());
      triggerToast(`✓ Demand request submitted to nearby verified shops!`);
      setShowDemandModal(false);
      setActivePlatform("customer");
      setActiveTab("enquiries");
    });
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

  const isSuperAdminAuthenticated = Boolean(
    currentUser && 
    currentUser.email?.toLowerCase() === 'nikhileshmendhe07@gmail.com' &&
    (currentUser.role === 'admin' || currentUser.role === 'super_admin')
  );

  return (
    <div className="min-h-screen bg-[#F7F8F7] flex flex-col font-sans selection:bg-[#EAF7EE] selection:text-[#138A36] overflow-x-hidden">
      
      {/* MERCHANT AUTH PAGE — Full-screen dedicated merchant sign-in/up */}
      {activePlatform === 'merchantAuth' && (
        <MerchantAuthPage
          onSwitchToCustomer={() => {
            setActivePlatform('customer');
            setActiveTab('home');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
          }}
          onLoginSuccess={async (userData) => {
            setCurrentUser(userData);
            const cleanEmail = (userData.email || '').toLowerCase().trim();

            if (cleanEmail && (userData.role === 'merchant' || !userData.role)) {
              merchantService.registerMerchantInSupabase(userData);
              setMerchants(merchantService.getStoredMerchants());
            }

            // 1. Check in loaded shops state
            const inStateShop = shops.some(
              s => (cleanEmail && s.merchantEmail?.toLowerCase() === cleanEmail) ||
                   (cleanEmail && s.email?.toLowerCase() === cleanEmail) ||
                   (userData.id && s.merchantId === userData.id) ||
                   (userData.shopName && s.name?.toLowerCase() === userData.shopName.toLowerCase())
            );

            // 2. Check in Supabase & local storage for existing shop
            const hasShop = inStateShop || await shopService.checkMerchantHasShop(cleanEmail, userData.id, userData.shopName);

            // 3. Check in Supabase & local storage for existing merchant record
            const hasMerchantRecord = await merchantService.checkMerchantExists(cleanEmail, userData.id);

            // 4. Check if account already completed onboarding in local storage vault
            let accountOnboardingNotRequired = false;
            try {
              const accounts = JSON.parse(localStorage.getItem('growlocal_registered_accounts') || '[]');
              const acc = accounts.find(a => a.email?.toLowerCase() === cleanEmail);
              if (acc && acc.onboardingRequired === false) accountOnboardingNotRequired = true;
            } catch (_) {}

            const isReturningMerchant = Boolean(hasShop || hasMerchantRecord || accountOnboardingNotRequired);

            const target = pendingRedirect || {};
            setPendingRedirect(null);
            if (typeof window !== 'undefined') window.history.pushState({}, '', target.path || '/merchant');

            if (isReturningMerchant) {
              // Returning merchant — go straight to dashboard
              triggerToast(`✓ Welcome back to your Merchant Dashboard, ${userData.name || cleanEmail}!`);
              setActivePlatform('merchant');
              setActiveTab(target.tab || 'merchantDashboard');
            } else {
              // Truly new merchant with no shop & no database record — show shop registration wizard first
              triggerToast(`👋 Welcome, ${userData.name || cleanEmail}! Let's set up your shop.`);
              setActivePlatform('merchantOnboarding');
            }
          }}
        />
      )}

      {/* MERCHANT ONBOARDING WIZARD — Full-screen creative shop setup wizard */}
      {activePlatform === 'merchantOnboarding' && (
        <MerchantOnboardingWizard
          currentUser={currentUser}
          onSaveShop={async (newShop) => {
            const stampedShop = { ...newShop, merchantEmail: currentUser?.email || '' };
            await handleAddShop(stampedShop);
          }}
          onComplete={(newShop) => {
            triggerToast(`🎉 "${newShop.name}" is live on GrowLocal! Here is Your Shop.`);
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant');
            setActivePlatform('merchant');
            setActiveTab('merchantShopProfile');
          }}
          onClose={() => {
            setActivePlatform('merchant');
            setActiveTab('merchantDashboard');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant');
          }}
        />
      )}

      {/* MERCHANT MARKETING PAGE — Full-screen "Why be a Merchant" landing */}
      {activePlatform === 'merchantMarketing' && (
        <MerchantMarketingPage
          onJoinAsMerchant={() => {
            setPendingRedirect({ path: '/merchant', platform: 'merchant', tab: 'merchantDashboard' });
            setActivePlatform('merchantAuth');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant');
          }}
          onSwitchToCustomer={() => {
            setActivePlatform('customer');
            setActiveTab('home');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
          }}
        />
      )}

      {/* 1. SUPER ADMIN PLATFORM VIEW */}
      {activePlatform === 'admin' && !isSuperAdminAuthenticated && (
        <AdminAuthPage
          onLoginSuccess={(adminSession) => {
            setCurrentUser(adminSession);
            triggerToast("✓ Super Admin Session Established");
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/admin');
            }
          }}
          onBackToCustomerView={() => {
            setActivePlatform('customer');
            setActiveTab('home');
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
            }
          }}
          onShowToast={triggerToast}
        />
      )}

      {activePlatform === 'admin' && isSuperAdminAuthenticated && (
        <AdminLayout
          currentAdminTab={currentAdminTab}
          setCurrentAdminTab={setCurrentAdminTab}
          onSwitchPlatform={(platform) => {
            if (platform === 'customer') {
              setShowExitAdminModal(true);
            } else {
              setActivePlatform(platform);
            }
          }}
          onExitAdminLogout={() => setShowExitAdminModal(true)}
          adminUser={currentUser || adminUsers[0]}
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
              kpiMetrics={kpiMetrics}
              customers={customers}
              merchants={merchants}
              shops={shops}
              products={products}
              pendingVerifications={pendingVerifications}
              enquiries={enquiries}
              reservations={reservations}
              offers={offers}
              auditLogs={auditLogs}
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
      )}

      {/* 2. DEDICATED MERCHANT PLATFORM VIEW — Standalone Full Merchant Portal */}
      {activePlatform === 'merchant' && (
        <MerchantLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSwitchPlatform={(platform) => {
            if (platform === 'customer') {
              setShowExitMerchantModal(true);
            } else {
              setActivePlatform(platform);
            }
          }}
          onRequestExitToCustomer={() => setShowExitMerchantModal(true)}
          currentUser={currentUser}
          merchantProfile={merchants.find(m => m.email?.toLowerCase() === currentUser?.email?.toLowerCase())}
          shops={shops}
          products={products}
          enquiries={enquiries}
          reservations={reservations}
          onAddShop={() => setActivePlatform('merchantOnboarding')}
          onLogout={() => {
            setCurrentUser(null);
            authService.logout();
            setActivePlatform('merchantAuth');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant');
            triggerToast("Signed out of Merchant Portal");
          }}
        >
          {(activeTab === "merchantDashboard" || activeTab === "home") && (
            <MerchantDashboard
              stats={MERCHANT_STATS}
              enquiries={enquiries}
              onNavigateMerchant={setActiveTab}
              currentUser={currentUser}
              merchantProfile={merchants.find(m => m.email?.toLowerCase() === currentUser?.email?.toLowerCase())}
              shops={shops}
              onAddShop={() => setActivePlatform('merchantOnboarding')}
              onLogout={() => {
                setCurrentUser(null);
                authService.logout();
                setActivePlatform('merchantAuth');
                if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant');
                triggerToast("Signed out of Merchant Portal");
              }}
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
              shops={shops}
              currentUser={currentUser}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onShowToast={triggerToast}
            />
          )}

          {activeTab === "merchantShopProfile" && (
            <MerchantShopProfile
              shop={shops.find(s => 
                (currentUser?.id && s.merchantId === currentUser?.id) ||
                (currentUser?.email && s.merchantEmail?.toLowerCase() === currentUser?.email?.toLowerCase())
              ) || shops[0]}
              products={products}
              onPreviewPublic={() => {
                const curShop = shops.find(s => 
                  (currentUser?.id && s.merchantId === currentUser?.id) ||
                  (currentUser?.email && s.merchantEmail?.toLowerCase() === currentUser?.email?.toLowerCase())
                ) || shops[0];
                setSelectedShopId(curShop?.id);
                setActivePlatform("customer");
                setActiveTab("shopProfile");
              }}
              onSaveShop={async (updatedShop) => {
                try {
                  await shopService.updateShop(updatedShop.id, updatedShop);
                } catch (e) {
                  shopService.saveShopLocally(updatedShop);
                }
                setShops(prev => prev.map(s => s.id === updatedShop.id ? { ...s, ...updatedShop } : s));
              }}
              onNavigate={setActiveTab}
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

          {activeTab === "merchantOffers" && (
            <MerchantOffers
              onShowToast={triggerToast}
            />
          )}
        </MerchantLayout>
      )}

      {/* 3. CUSTOMER & LANDING PLATFORM VIEWS */}
      {activePlatform !== 'admin' && activePlatform !== 'merchant' && activePlatform !== 'merchantAuth' && activePlatform !== 'merchantMarketing' && (
        <>
          {/* Global Desktop Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentLocation={currentLocation}
            onOpenLocationModal={() => setShowLocationModal(true)}
            onOpenDemandModal={() => setShowDemandModal(true)}
            onOpenAuthModal={handleOpenAuthModal}
            activePlatform={activePlatform}
            setActivePlatform={setActivePlatform}
            savedCount={savedShopIds.length}
            enquiriesCount={enquiries.length}
            onNavigatePath={navigateToPath}
            onOpenMerchantMarketing={() => {
              setActivePlatform('merchantMarketing');
              if (typeof window !== 'undefined') window.history.pushState({}, '', '/for-merchants');
            }}
            currentUser={currentUser}
            onLogout={handleUserLogout}
          />

          {/* Global Mobile Header */}
          <MobileHeader
            currentLocation={currentLocation}
            onOpenLocationModal={() => setShowLocationModal(true)}
            onOpenSearch={() => { setActivePlatform("customer"); setActiveTab("search"); }}
            onOpenAuthModal={handleOpenAuthModal}
            activePlatform={activePlatform}
            setActivePlatform={setActivePlatform}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenDemandModal={() => setShowDemandModal(true)}
            onOpenMerchantMarketing={() => {
              setActivePlatform('merchantMarketing');
              if (typeof window !== 'undefined') window.history.pushState({}, '', '/for-merchants');
            }}
            currentUser={currentUser}
            onLogout={handleUserLogout}
          />

          {/* Main Content View Switcher */}
          <main className="flex-1 pb-16 md:pb-6">
            {/* MARKETING LANDING PAGE VIEW */}
            {activePlatform === "landing" && (
              <MarketingLanding
                onStartShopping={() => { setActivePlatform("customer"); setActiveTab("home"); }}
                onOpenMerchantAuth={() => handleOpenAuthModal("merchant")}
                onOpenMerchantMarketing={() => {
                  setActivePlatform('merchantMarketing');
                  if (typeof window !== 'undefined') window.history.pushState({}, '', '/for-merchants');
                }}
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
                    onBuyNow={handleOpenBuyNow}
                    onSearch={handleExecuteSearch}
                    onOpenPhotoSearch={() => setShowPhotoSearchModal(true)}
                    onOpenDemandRequest={() => setShowDemandModal(true)}
                    onOpenLocationModal={() => setShowLocationModal(true)}
                    onOpenAuthModal={handleOpenAuthModal}
                    onOpenMerchantMarketing={() => {
                      setActivePlatform('merchantMarketing');
                      if (typeof window !== 'undefined') window.history.pushState({}, '', '/for-merchants');
                    }}
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
                    products={products}
                    categories={categories}
                    onSelectProduct={handleSelectProduct}
                    onBuyNow={handleOpenBuyNow}
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
                    categories={categories}
                    onBack={() => setActiveTab("home")}
                    onSelectShop={handleSelectShop}
                    onSelectProduct={handleSelectProduct}
                    onBuyNow={handleOpenBuyNow}
                    onSearch={handleExecuteSearch}
                    onOpenDemandRequest={() => setShowDemandModal(true)}
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
                    onBuyNow={handleOpenBuyNow}
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
                    onBuyNow={handleOpenBuyNow}
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
                    onOpenAuthModal={handleOpenAuthModal}
                    onSwitchPlatform={setActivePlatform}
                    savedCount={savedShopIds.length}
                    enquiriesCount={enquiries.length}
                    reservationsCount={reservations.length}
                    currentUser={currentUser}
                    onLogOut={handleUserLogout}
                  />
                )}

                {(activeTab === "vendorTerms" || activeTab === "terms") && (
                  <VendorTerms
                    onNavigate={setActiveTab}
                    onOpenMerchantAuth={() => handleOpenAuthModal("merchant")}
                    onShowToast={triggerToast}
                  />
                )}
              </>
            )}
          </main>

          {/* Global Footer */}
          <footer className="bg-white border-t border-[#E5E7E5] py-8 md:py-12 px-4 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <img src="/growlocal-logo.png" alt="GrowLocal Logo" className="h-8 w-auto object-contain" />
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
                  <li><button onClick={() => {
                    setActivePlatform("customer");
                    setActiveTab("home");
                    setTimeout(() => {
                      const el = document.getElementById('how-it-works-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} className="hover:text-[#138A36]">How It Works</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider mb-3">Businesses</h4>
                <ul className="space-y-2 text-xs text-[#666666]">
                  <li>
                    <button 
                      onClick={() => { 
                        setActivePlatform('merchantMarketing'); 
                        if (typeof window !== 'undefined') window.history.pushState({}, '', '/for-merchants'); 
                      }} 
                      className="hover:text-[#138A36] text-[#138A36] font-bold"
                    >
                      🌱 Why Join as Merchant?
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { 
                        setActivePlatform('merchantMarketing'); 
                        if (typeof window !== 'undefined') window.history.pushState({}, '', '/for-merchants'); 
                      }} 
                      className="hover:text-[#138A36]"
                    >
                      List Your Shop Free
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { 
                        setActivePlatform('merchantAuth'); 
                        if (typeof window !== 'undefined') window.history.pushState({}, '', '/merchant'); 
                      }} 
                      className="hover:text-[#138A36]"
                    >
                      Merchant Portal Login
                    </button>
                  </li>
                  <li><button onClick={() => setActivePlatform("merchant")} className="hover:text-[#138A36]">Merchant Dashboard</button></li>
                  <li><button onClick={() => { setActivePlatform("merchant"); setActiveTab("merchantCreators"); }} className="hover:text-[#138A36]">GrowLocal Creators</button></li>
                  <li><button onClick={() => { setActivePlatform("merchant"); setActiveTab("merchantSubscription"); }} className="hover:text-[#138A36]">Pricing & Plans</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider mb-3">Company</h4>
                <ul className="space-y-2 text-xs text-[#666666]">
                  <li><button onClick={() => setActivePlatform("landing")} className="hover:text-[#138A36]">About GrowLocal</button></li>
                  <li><button onClick={() => { setActivePlatform("customer"); setActiveTab("vendorTerms"); }} className="hover:text-[#138A36]">Vendor Terms & Conditions</button></li>
                  <li><button onClick={() => { setActivePlatform("customer"); setActiveTab("vendorTerms"); }} className="hover:text-[#138A36]">Privacy Policy</button></li>
                  <li><button onClick={() => { setActivePlatform("customer"); setActiveTab("vendorTerms"); }} className="hover:text-[#138A36]">Terms of Service</button></li>
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
            onOpenMerchantMarketing={() => {
              setActivePlatform('merchantMarketing');
              if (typeof window !== 'undefined') window.history.pushState({}, '', '/for-merchants');
            }}
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
          interceptNotice={
            pendingUserAction?.type === 'buyNow'
              ? "Account required: Please log in or create an account first to buy this product."
              : pendingUserAction
              ? "Login required to save items, enquire with shops, and reserve products."
              : null
          }
          onClose={() => { setShowAuthModal(false); setPendingUserAction(null); }}
          onOpenTerms={() => { setActivePlatform("customer"); setActiveTab("vendorTerms"); }}
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

            // Resume intercepted action if user clicked reserve/save/enquiry while logged out
            if (pendingUserAction && typeof pendingUserAction.onProceed === 'function') {
              const actionToResume = pendingUserAction;
              setPendingUserAction(null);
              setTimeout(() => {
                actionToResume.onProceed();
              }, 150);
              return;
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

      {showShopSetupModal && (
        <MerchantShopSetupModal
          currentUser={currentUser}
          onClose={() => setShowShopSetupModal(false)}
          onSaveShop={(newShop) => {
            handleAddShop(newShop);
            setShowShopSetupModal(false);
          }}
        />
      )}

      {/* ── INSTANT BUY NOW EXPRESS CHECKOUT MODAL ── */}
      <BuyNowModal
        product={buyNowProduct}
        currentUser={currentUser}
        initialSize={buyNowInitialSize}
        isOpen={showBuyNowModal}
        onClose={() => {
          setShowBuyNowModal(false);
          setBuyNowProduct(null);
        }}
        onCompleteOrder={handleCompleteBuyNowOrder}
        onRequireAuth={(onProceed) => {
          setPendingUserAction({ type: 'buyNow', payload: buyNowProduct, onProceed });
          setAuthRole("customer");
          setShowAuthModal(true);
        }}
        onShowToast={triggerToast}
      />

      {/* ── EXIT MERCHANT PORTAL LOGOUT CONFIRMATION POPUP ── */}
      {showExitMerchantModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center border border-gray-200 shadow-2xl relative space-y-4 font-sans animate-in zoom-in-95 duration-200">
            {/* Close / Cancel Button */}
            <button
              onClick={() => setShowExitMerchantModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning / Logout Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
              <LogOut className="w-7 h-7" />
            </div>

            {/* Header & Notice */}
            <div>
              <h3 className="text-lg font-black text-[#111111] font-poppins">
                Exit Merchant Portal?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                You are about to return to the customer marketplace.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-left text-xs text-gray-600 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <ShieldCheck className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Session Protection Required</span>
              </div>
              <p className="leading-relaxed">
                To safeguard your store orders, live customer inquiries, and private merchant inventory, returning to the customer view requires logging out of your Merchant session.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExitMerchantModal(false)}
                className="w-full sm:flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Stay in Merchant Portal
              </button>

              <button
                type="button"
                onClick={handleConfirmExitMerchantLogout}
                className="w-full sm:flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out & Go Home</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXIT SUPER ADMIN CONSOLE LOGOUT CONFIRMATION POPUP ── */}
      {showExitAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#161D1A] text-white rounded-3xl max-w-md w-full p-6 text-center border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative space-y-4 font-sans animate-in zoom-in-95 duration-200">
            {/* Close / Cancel Button */}
            <button
              onClick={() => setShowExitAdminModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Shield Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
              <LogOut className="w-7 h-7" />
            </div>

            {/* Header & Notice */}
            <div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-black text-white font-poppins">
                  Exit Super Admin Console?
                </h3>
                <span className="text-[10px] bg-red-500/20 text-red-400 font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-500/30">
                  Protected Node
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                You are requesting to return to the customer marketplace.
              </p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-left text-xs text-gray-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-[#138A36] shrink-0" />
                <span>Administrative Session Lockdown Required</span>
              </div>
              <p className="leading-relaxed text-gray-400">
                To safeguard platform controls, merchant KYC verifications, payment ledgers, and database security, leaving the Super Admin panel requires terminating your active administrative session.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExitAdminModal(false)}
                className="w-full sm:flex-1 py-3 px-4 bg-white/10 hover:bg-white/15 text-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Stay in Admin Console
              </button>

              <button
                type="button"
                onClick={handleConfirmExitAdminLogout}
                className="w-full sm:flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-colors shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out & Exit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
