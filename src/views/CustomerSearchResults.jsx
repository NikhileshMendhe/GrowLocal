import React, { useState } from 'react';
import { 
  ArrowLeft, SlidersHorizontal, MapPin, Clock, MessageSquare, 
  Check, Sparkles, Zap, Store, Filter, ArrowUpDown, CheckCircle2, 
  ShoppingBag, ChevronDown, PackageCheck, AlertCircle, ShieldCheck
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import Rating from '../components/Rating';
import AdvanceSearchBar from '../components/AdvanceSearchBar';
import { advancedProductSearch, getMatchingShopsForSearch, detectCategoryIntent } from '../utils/searchHelper';

export default function CustomerSearchResults({ 
  searchQuery, 
  shops = [], 
  products = [], 
  categories = [],
  onBack, 
  onSelectShop, 
  onSelectProduct,
  onOpenChat,
  onBuyNow,
  onSearch,
  onOpenDemandRequest
}) {
  // View Toggle: Products First (default) vs Local Shops
  const [activeViewTab, setActiveViewTab] = useState('products'); // 'products' | 'shops'

  // Advanced Filters State
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under500' | '500-1000' | '1000-2000' | '2000plus'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState('all'); // 'all' | '1' | '3' | '5' | '10'
  const [selectedSize, setSelectedSize] = useState('all');
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'price_low' | 'price_high'
  const [shopFilterOpenNow, setShopFilterOpenNow] = useState(false);
  const [shopFilterRating, setShopFilterRating] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Detect category intent from search query (e.g. "black shoes" -> "Footwear", "shoes" -> "Footwear")
  const categoryIntent = detectCategoryIntent(searchQuery);

  // Execute advanced product search engine
  const baseMatchedProducts = advancedProductSearch(products, searchQuery, {
    priceRange,
    inStockOnly,
    selectedSize,
    sortBy
  });

  // Apply distance, verified shop, and open now filters
  const matchedProducts = baseMatchedProducts.filter(p => {
    if (selectedRadius !== 'all') {
      const distNum = parseFloat(p.shopDistance) || 1.0;
      if (distNum > parseFloat(selectedRadius)) return false;
    }
    if (verifiedOnly) {
      const shopObj = shops.find(s => s.id === p.shopId || s.name === p.shopName);
      if (!p.shopVerified && !shopObj?.verified) return false;
    }
    if (openNow) {
      const shopObj = shops.find(s => s.id === p.shopId || s.name === p.shopName);
      if (shopObj && shopObj.status !== 'Open') return false;
    }
    return true;
  });

  // Get shops carrying matching products
  const matchedShops = getMatchingShopsForSearch(shops, matchedProducts, searchQuery).filter(shop => {
    if ((openNow || shopFilterOpenNow) && shop.status !== 'Open') return false;
    if (shopFilterRating && shop.rating < 4.5) return false;
    if (verifiedOnly && !shop.verified) return false;
    if (selectedRadius !== 'all') {
      const distNum = parseFloat(shop.distance) || 1.0;
      if (distNum > parseFloat(selectedRadius)) return false;
    }
    return true;
  });

  // Available sizes across matched products
  const availableSizes = Array.from(
    new Set(
      products
        .flatMap(p => p.sizes || [])
        .filter(s => s && s !== 'Standard')
    )
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header with Back Button and Quick Info */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-[#E5E7E5] rounded-2xl hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#111111]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-[#111111] font-poppins">
                Local Search Results
              </h1>
              <span className="bg-[#EAF7EE] text-[#138A36] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#DDF3E3]">
                Nagpur Realtime
              </span>
            </div>
            <p className="text-xs text-[#666666] font-medium">
              Found <strong className="text-[#138A36]">{matchedProducts.length} products</strong> across <strong className="text-[#111111]">{matchedShops.length} verified stores</strong>
            </p>
          </div>
        </div>

        {onOpenDemandRequest && (
          <button
            onClick={onOpenDemandRequest}
            className="hidden sm:flex items-center gap-1.5 bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-[#DDF3E3]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Can't find? Request Shops</span>
          </button>
        )}
      </div>

      {/* 2. Embedded Creative Advance Search Bar */}
      <div className="bg-[#EAF7EE]/60 border border-[#DDF3E3] p-3 sm:p-4 rounded-3xl">
        <AdvanceSearchBar
          initialQuery={searchQuery}
          onSearch={onSearch || ((q) => onSearch ? onSearch(q) : null)}
          onSelectProduct={onSelectProduct}
          onBuyNow={onBuyNow}
          products={products}
          categories={categories}
          placeholder="Refine your search (e.g. shoes, black shoes, shirt...)"
          size="medium"
        />
      </div>

      {/* 2b. AI Category Intent Smart Routing Banner */}
      {categoryIntent.hasCategoryIntent && (
        <div className="bg-gradient-to-r from-[#EAF7EE] via-white to-[#F8FAF8] border-2 border-[#138A36]/30 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#138A36] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded-md border border-[#CDEED5]">
                  Category Algorithm Active
                </span>
                <span className="text-xs font-bold text-gray-500">
                  Trigger: "{categoryIntent.matchedTrigger}"
                </span>
              </div>
              <p className="text-sm font-black text-[#111111] mt-0.5">
                Auto-routed into <span className="text-[#138A36] underline decoration-wavy decoration-[#138A36]/40">{categoryIntent.categoryName}</span> Category
                {categoryIntent.attributeQuery && (
                  <span className="font-semibold text-gray-700"> • Matching Attribute: "{categoryIntent.attributeQuery}"</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[#138A36] bg-white px-3 py-1.5 rounded-xl border border-[#DDF3E3] shadow-2xs">
              {matchedProducts.length} in {categoryIntent.categoryName}
            </span>
            {onSearch && (
              <button
                onClick={() => onSearch('')}
                className="text-xs font-bold text-gray-500 hover:text-[#111111] hover:underline bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 cursor-pointer"
                title="Search all categories"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Product-First View Tabs & Filter Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7E5] pb-3">
        {/* Navigation Tabs: Products First (DEFAULT) vs Shops */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs ${
              activeViewTab === 'products'
                ? 'bg-[#138A36] text-white shadow-md shadow-[#138A36]/20'
                : 'bg-white text-[#111111] border border-[#E5E7E5] hover:border-[#138A36] hover:bg-[#EAF7EE]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Products ({matchedProducts.length})</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              activeViewTab === 'products' ? 'bg-white/20 text-white' : 'bg-[#EAF7EE] text-[#138A36]'
            }`}>
              Primary
            </span>
          </button>

          <button
            onClick={() => setActiveViewTab('shops')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs ${
              activeViewTab === 'shops'
                ? 'bg-[#138A36] text-white shadow-md shadow-[#138A36]/20'
                : 'bg-white text-[#111111] border border-[#E5E7E5] hover:border-[#138A36] hover:bg-[#EAF7EE]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Local Stores ({matchedShops.length})</span>
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#888888] hidden md:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-[#E5E7E5] rounded-xl px-3 py-1.5 text-xs font-bold text-[#111111] outline-none focus:border-[#138A36] cursor-pointer shadow-xs"
          >
            <option value="relevance">⚡ Best Match (Relevance)</option>
            <option value="price_low">₹ Price: Low to High</option>
            <option value="price_high">₹ Price: High to Low</option>
          </select>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`sm:hidden p-2 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer ${
              showFilterDrawer ? 'bg-[#138A36] text-white border-[#138A36]' : 'bg-white text-[#111111] border-[#E5E7E5]'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 4. Creative Filter Pills Bar */}
      <div className={`flex flex-wrap items-center gap-2 ${showFilterDrawer ? 'block' : 'hidden sm:flex'}`}>
        <span className="text-[11px] font-black uppercase tracking-wider text-[#888888] mr-1">
          Quick Filters:
        </span>

        {/* Distance Radius Pills */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#E5E7E5]">
          <span className="text-[10px] font-bold text-[#888888] pl-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#138A36]" /> Radius:
          </span>
          {[
            { label: 'All', val: 'all' },
            { label: '1 km', val: '1' },
            { label: '3 km', val: '3' },
            { label: '5 km', val: '5' },
            { label: '10 km', val: '10' }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setSelectedRadius(item.val)}
              className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedRadius === item.val
                  ? 'bg-[#138A36] text-white shadow-2xs'
                  : 'text-[#555555] hover:text-[#111111] hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Verified Shop Only Toggle */}
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            verifiedOnly
              ? 'bg-[#138A36] text-white border-[#138A36] shadow-xs'
              : 'bg-white text-[#111111] border-[#E5E7E5] hover:border-[#138A36]'
          }`}
          title="Filter verified shops only"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Verified Only</span>
        </button>

        {/* Open Now Toggle */}
        <button
          onClick={() => setOpenNow(!openNow)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            openNow
              ? 'bg-[#138A36] text-white border-[#138A36] shadow-xs'
              : 'bg-white text-[#111111] border-[#E5E7E5] hover:border-[#138A36]'
          }`}
          title="Shops open right now"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Open Now</span>
        </button>

        {/* In-Stock Toggle */}
        <button
          onClick={() => setInStockOnly(!inStockOnly)}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            inStockOnly
              ? 'bg-[#138A36] text-white border-[#138A36]'
              : 'bg-white text-[#111111] border-[#E5E7E5] hover:border-[#138A36]'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>In Stock Only</span>
        </button>

        {/* Price Pills */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#E5E7E5]">
          {[
            { label: 'All Prices', val: 'all' },
            { label: 'Under ₹500', val: 'under500' },
            { label: '₹500–₹1,000', val: '500-1000' },
            { label: '₹1,000–₹2,000', val: '1000-2000' },
            { label: '₹2,000+', val: '2000plus' }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setPriceRange(item.val)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                priceRange === item.val
                  ? 'bg-[#111111] text-white'
                  : 'text-[#555555] hover:text-[#111111] hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Size Pills if apparel */}
        {availableSizes.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold text-[#888888] ml-1">Size:</span>
            <button
              onClick={() => setSelectedSize('all')}
              className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                selectedSize === 'all' ? 'bg-[#138A36] text-white border-[#138A36]' : 'bg-white text-[#555555] border-[#E5E7E5]'
              }`}
            >
              All
            </button>
            {availableSizes.slice(0, 6).map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(selectedSize === sz ? 'all' : sz)}
                className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                  selectedSize === sz ? 'bg-[#138A36] text-white border-[#138A36]' : 'bg-white text-[#555555] border-[#E5E7E5]'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        )}

        {/* Reset Filters */}
        {(priceRange !== 'all' || inStockOnly || verifiedOnly || openNow || selectedRadius !== 'all' || selectedSize !== 'all' || sortBy !== 'relevance') && (
          <button
            onClick={() => {
              setPriceRange('all');
              setInStockOnly(false);
              setVerifiedOnly(false);
              setOpenNow(false);
              setSelectedRadius('all');
              setSelectedSize('all');
              setSortBy('relevance');
            }}
            className="text-xs font-bold text-red-600 hover:underline ml-auto cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 5. PRIMARY CONTENT: PRODUCTS FIRST */}
      {activeViewTab === 'products' && (
        <div className="space-y-6">
          {matchedProducts.length === 0 ? (
            /* Creative Empty State */
            <div className="bg-gradient-to-br from-white to-[#F8FAF8] rounded-3xl border-2 border-dashed border-[#C6E6D0] p-8 md:p-12 text-center space-y-5 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
                🔍
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-black text-[#111111] font-poppins">
                  No matching products found for "{searchQuery || 'your filter'}"
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Nearby shops in Nagpur haven't listed this specific item yet, or it may currently be out of stock in this price range.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenDemandRequest && (
                  <button
                    onClick={onOpenDemandRequest}
                    className="bg-[#138A36] hover:bg-[#0B6B2B] text-white font-black text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Ask Local Shops to Source It (Free)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setPriceRange('all');
                    setInStockOnly(false);
                    setSelectedSize('all');
                    if (onSearch) onSearch('');
                  }}
                  className="bg-white border border-[#E5E7E5] text-[#111111] hover:border-[#138A36] font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  View All Available Products
                </button>
              </div>
            </div>
          ) : (
            /* Responsive High-Converting Product Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {matchedProducts.map((prod) => {
                const discountPct = prod.originalPrice > prod.price
                  ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => onSelectProduct(prod.id)}
                    className="group bg-white rounded-3xl border border-[#E5E7E5] overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative h-44 sm:h-52 bg-[#F8FAF8] overflow-hidden">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
                          }}
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                          {discountPct >= 5 && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                              -{discountPct}% OFF
                            </span>
                          )}
                          <span className="bg-[#111111]/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {prod.category}
                          </span>
                        </div>

                        {/* Availability Pill */}
                        <div className="absolute bottom-2.5 right-2.5 z-10">
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#EAF7EE]/95 text-[#138A36] border border-[#BDE7C9] shadow-xs backdrop-blur-sm">
                            ✓ {prod.availability || 'In Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="p-3.5 sm:p-4 space-y-1.5">
                        <h3 className="font-black text-sm md:text-base text-[#111111] group-hover:text-[#138A36] transition-colors line-clamp-2 leading-snug">
                          {prod.name}
                        </h3>

                        {/* Store chip with direct link */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (prod.shopId) onSelectShop(prod.shopId);
                          }}
                          className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#138A36] transition-colors cursor-pointer bg-[#F8FAF8] hover:bg-[#EAF7EE] p-1.5 rounded-xl border border-transparent hover:border-[#CDEED5]"
                        >
                          <Store className="w-3.5 h-3.5 text-[#138A36] shrink-0" />
                          <span className="font-bold text-[#111111] truncate max-w-[120px]">{prod.shopName}</span>
                          <span className="text-[10px] text-[#888888] ml-auto shrink-0">{prod.shopDistance || 'Nagpur'}</span>
                        </div>

                        {/* Sizes */}
                        {prod.sizes && prod.sizes.length > 0 && prod.sizes[0] !== 'Standard' && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {prod.sizes.slice(0, 4).map((s, idx) => (
                              <span key={idx} className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-base sm:text-lg font-black text-[#111111]">
                            ₹{prod.price?.toLocaleString()}
                          </span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-xs text-gray-400 line-through font-medium">
                              ₹{prod.originalPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action CTAs: Buy Now + Chat */}
                    <div className="p-3 sm:p-3.5 pt-0 space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBuyNow) onBuyNow(prod);
                            else onSelectProduct(prod.id);
                          }}
                          className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white text-xs font-black py-2.5 rounded-xl transition-all shadow-md shadow-[#138A36]/20 flex items-center justify-center gap-1 cursor-pointer hover:scale-[1.02]"
                          title="Instant Buy Now"
                        >
                          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
                          <span>Buy Now</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const matchingShop = shops.find(s => s.id === prod.shopId) || { id: prod.shopId, name: prod.shopName };
                            if (onOpenChat) onOpenChat(matchingShop);
                            else onSelectProduct(prod.id);
                          }}
                          className="w-full bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer truncate"
                          title="Chat with shop"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span>Chat</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(prod.id);
                        }}
                        className="w-full text-center text-[11px] font-bold text-gray-500 hover:text-gray-800 py-1 transition-colors"
                      >
                        View Full Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. SECONDARY CONTENT: LOCAL STORES TAB */}
      {activeViewTab === 'shops' && (
        <div className="space-y-4">
          {matchedShops.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E5E7E5] p-8 text-center space-y-3">
              <p className="font-bold text-sm text-[#111111]">No local shops found matching "{searchQuery}"</p>
              <button
                onClick={() => setActiveViewTab('products')}
                className="text-xs font-black text-[#138A36] hover:underline cursor-pointer"
              >
                Back to Matching Products ({matchedProducts.length})
              </button>
            </div>
          ) : (
            matchedShops.map((shop) => {
              const shopCarriedProducts = matchedProducts.filter(p => p.shopId === shop.id);

              return (
                <div 
                  key={shop.id}
                  onClick={() => onSelectShop(shop.id)}
                  className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden card-shadow-hover cursor-pointer p-4 md:p-5 flex flex-col md:flex-row gap-5"
                >
                  {/* Shop Image */}
                  <div className="relative w-full md:w-56 h-48 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-[#EAF7EE] text-[#138A36] font-bold text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#138A36]"></span>
                      <span>{shop.status}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#111111] font-bold text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#138A36]" />
                      <span>{shop.distance}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-[#111111] hover:text-[#138A36] transition-colors">
                          {shop.name}
                        </h3>
                        {shop.verified && <VerifiedBadge />}
                      </div>

                      <p className="text-xs font-medium text-[#666666] mb-2">{shop.category}</p>

                      <div className="flex items-center gap-4 text-xs text-[#666666] mb-3">
                        <Rating rating={shop.rating} count={shop.reviewsCount} />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#138A36]" />
                          <span>{shop.closingTime}</span>
                        </span>
                      </div>

                      {/* Products available in this store */}
                      {shopCarriedProducts.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-[#138A36]">
                            Available Items in this store ({shopCarriedProducts.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {shopCarriedProducts.map((p) => (
                              <div
                                key={p.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectProduct(p.id);
                                }}
                                className="flex items-center gap-2 bg-[#F7F8F7] hover:bg-[#EAF7EE] p-1.5 pr-3 rounded-xl border border-[#E5E7E5] transition-colors"
                              >
                                <img src={p.images?.[0] || p.image} alt={p.name} className="w-7 h-7 rounded-lg object-cover" />
                                <span className="text-xs font-bold text-[#111111]">{p.name}</span>
                                <span className="text-xs font-black text-[#138A36]">₹{p.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shop Action CTAs */}
                    <div className="flex items-center gap-3 pt-3 border-t border-[#E5E7E5]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChat(shop);
                        }}
                        className="flex-1 bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Message Shop</span>
                      </button>

                      <button
                        onClick={() => onSelectShop(shop.id)}
                        className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-colors cursor-pointer"
                      >
                        View Store Profile & Catalog
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
