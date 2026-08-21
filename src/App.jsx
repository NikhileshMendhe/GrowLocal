import React, { useState } from 'react';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import BottomNavigation from './components/BottomNavigation';
import LocationSelector from './components/LocationSelector';
import PhotoSearchModal from './components/PhotoSearchModal';
import DemandRequestModal from './components/DemandRequestModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

// Mock Dataset
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

// Customer Views
import CustomerHome from './views/CustomerHome';
import CustomerSearch from './views/CustomerSearch';
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

// Landing Page
import MarketingLanding from './views/MarketingLanding';
import { 
  LayoutDashboard, Package, MessageSquare, Inbox, ShoppingBag, 
  TrendingUp, Sparkles, Tag, Store 
} from 'lucide-react';

export default function App() {
  // Main Navigation State
  const [activePlatform, setActivePlatform] = useState("customer"); // 'customer', 'merchant', 'landing'
  const [activeTab, setActiveTab] = useState("home"); // customer or merchant subtabs

  // App Data State
  const [currentLocation, setCurrentLocation] = useState(INITIAL_LOCATION);
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [savedShopIds, setSavedShopIds] = useState(["shop-1", "shop-2"]);

  // Selections & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState("shop-1");
  const [selectedProductId, setSelectedProductId] = useState("prod-1");

  // Modals & Toast State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPhotoSearchModal, setShowPhotoSearchModal] = useState(false);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState("customer");
  const [toastMessage, setToastMessage] = useState(null);

  const activeShop = shops.find(s => s.id === selectedShopId) || shops[0];
  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Helper Functions & Actions
  const triggerToast = (msg) => {
    setToastMessage(msg);
  };

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
    if (savedShopIds.includes(shopId)) {
      setSavedShopIds(savedShopIds.filter(id => id !== shopId));
    } else {
      setSavedShopIds([...savedShopIds, shopId]);
    }
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
    const newRes = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Ananya Deshmukh",
      customerPhone: "+91 98765 43210",
      shopId: productToReserve.shopId || "shop-1",
      shopName: productToReserve.shopName || "Trendy Wear",
      shopAddress: "Shop #14, Main Market, Model Town, Butibori, Nagpur",
      productName: productToReserve.name || productToReserve.productName,
      productImage: productToReserve.images ? productToReserve.images[0] : productToReserve.productImage,
      size: size || "L",
      price: productToReserve.price || 699,
      reservedDate: "Today, 21 Aug 2026",
      pickupTime: "6:00 PM - 8:30 PM",
      status: "Confirmed",
      qrCode: `GL-RES-${Math.floor(1000 + Math.random() * 9000)}-NGP`
    };
    setReservations([newRes, ...reservations]);
    triggerToast(`Product reserved! Show QR code at ${newRes.shopName}`);
    setActivePlatform("customer");
    setActiveTab("reservations");
  };

  const handleAddProduct = (newProd) => {
    setProducts([newProd, ...products]);
  };

  const handleSubmitDemand = (demandObj) => {
    const newEnq = {
      id: `#GL${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Ananya Deshmukh",
      customerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      shopId: "shop-1",
      shopName: "Trendy Wear",
      productName: demandObj.productName,
      productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80",
      size: `Size: ${demandObj.size}`,
      budget: demandObj.budget,
      status: "Pending",
      lastMessage: "Broadcast demand sent to nearby Nagpur shops",
      timestamp: "Just Now",
      date: "Today"
    };
    setEnquiries([newEnq, ...enquiries]);
    triggerToast("Demand broadcast sent! Check response in Enquiries tab.");
    setActivePlatform("customer");
    setActiveTab("enquiries");
  };

  return (
    <div className="min-h-screen bg-[#F7F8F7] flex flex-col font-sans selection:bg-[#EAF7EE] selection:text-[#138A36] overflow-x-hidden">
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
                categories={CATEGORIES}
                onSelectShop={handleSelectShop}
                onSelectProduct={handleSelectProduct}
                onSearch={handleExecuteSearch}
                onOpenPhotoSearch={() => setShowPhotoSearchModal(true)}
                onOpenDemandRequest={() => setShowDemandModal(true)}
                onOpenLocationModal={() => setShowLocationModal(true)}
                currentLocation={currentLocation}
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
              />
            )}
          </>
        )}

        {/* MERCHANT / BUSINESS PLATFORM VIEWS */}
        {activePlatform === "merchant" && (
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Merchant Navigation: Responsive Sidebar on Desktop & Horizontal Scroll Tabs on Mobile */}
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

              {/* Horizontal Scroll on Mobile, Vertical List on Desktop */}
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

            {/* Main Merchant Content */}
            <div className="flex-1 min-w-0">
              {(activeTab === "merchantDashboard" || activeTab === "home") && (
                <MerchantDashboard
                  stats={MERCHANT_STATS}
                  enquiries={enquiries}
                  onNavigateMerchant={setActiveTab}
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
                  creators={LOCAL_CREATORS}
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
              <li><a href="#" className="hover:text-[#138A36]">Contact Us</a></li>
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
            triggerToast(`Welcome back, ${userData.name}!`);
            if (userData.role === "merchant") {
              setActivePlatform("merchant");
              setActiveTab("merchantDashboard");
            } else {
              setActivePlatform("customer");
              setActiveTab("home");
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
