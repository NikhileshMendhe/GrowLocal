import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Flame,
  MessageCircle,
  Package,
  Percent,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import useLiveCatalog from '../hooks/useLiveCatalog.js';
import ProductCard from '../components/ProductCard.jsx';
import SocketStatusBadge from '../components/SocketStatusBadge.jsx';
import {
  OFFICIAL_WHATSAPP_SHORT_LINK,
  triggerWhatsAppInquiry,
} from '../lib/whatsapp.js';

const CATEGORY_ICONS = {
  'Fresh Fruits & Vegetables': '🍎',
  'Dairy, Bread & Eggs': '🥛',
  'Snacks & Munchies': '🍿',
  'Bakery & Cakes': '🥐',
  Beverages: '🧃',
  'Atta, Rice, Oil & Dals': '🌾',
  'Masalas & Dry Fruits': '🌰',
  'Personal Care': '🧴',
  'Cleaning & Household': '🧹',
  'Stationery & Pooja Needs': '🪔',
};

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { connected } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searches, setSearches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useLiveCatalog(products, setProducts);

  useEffect(() => {
    api
      .get(ENDPOINTS.CATEGORIES.LIST)
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    api
      .get(ENDPOINTS.PRODUCTS.LIST, { query: { limit: 20 } })
      .then((data) => setProducts(data.products || []))
      .catch(() => {});

    api
      .get(ENDPOINTS.SEARCH.POPULAR, { query: { limit: 8 } })
      .then((data) => setSearches(data.searches || []))
      .catch(() => {});
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  // Filtered views
  const featuredProducts = products.filter((p) => p.is_featured);
  const discountedProducts = products.filter(
    (p) => Number(p.original_price) > Number(p.price)
  );

  const displayedProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="space-y-10 pb-12">
      {/* 1. Value Proposition Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full pointer-events-none hidden md:block" />
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            GrowLocal Marketplace &bull; Find Local. Buy Local.
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Quality Products Near You
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 max-w-lg leading-relaxed">
            Explore authentic local products, get best prices, and order with instant WhatsApp support.
          </p>

          {/* Prominent Search Bar */}
          <form onSubmit={submitSearch} className="flex max-w-md bg-white rounded-2xl p-1.5 shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, groceries, daily essentials…"
                className="w-full h-11 pl-10 pr-3 text-sm text-[#111111] placeholder:text-[#999999] rounded-xl focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 h-11 bg-brand hover:bg-[#0F752C] text-white text-sm font-bold rounded-xl transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Key Value Props */}
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-emerald-100">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-300" /> Instant Local Pickup
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-300" /> Direct WhatsApp Ordering
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> 100% Quality Checked
            </span>
          </div>
        </div>
      </div>

      {/* 2. Category Explorer */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" /> Shop by Category
            </h2>
            <p className="text-xs text-[#666666]">Explore standard product aisles</p>
          </div>
          <Link
            to="/search"
            className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
          >
            All Products <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.slice(0, 10).map((cat) => {
            const icon = CATEGORY_ICONS[cat.name] || '🛍️';
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(isSelected ? null : cat.id);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer group ${
                  isSelected
                    ? 'border-brand bg-brand-light shadow-sm ring-2 ring-brand/30'
                    : 'border-[#E5E7E5] bg-white hover:border-brand/40 hover:bg-[#FBFDFB]'
                }`}
              >
                <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-[#111111] truncate">{cat.name}</p>
                  <p className="text-[10px] text-[#666666]">Explore &rarr;</p>
                </div>
              </button>
            );
          })}
        </div>

        {selectedCategory ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs text-emerald-800">
            <span>
              Filtering by: <strong>{categories.find((c) => c.id === selectedCategory)?.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="font-bold underline text-emerald-700 hover:text-emerald-900"
            >
              Clear Filter
            </button>
          </div>
        ) : null}
      </section>

      {/* 3. Discount Deals Section (if items with discounts exist) */}
      {!selectedCategory && discountedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111111]">Great Deals & Offers</h2>
                <p className="text-xs text-[#666666]">Save big on discounted daily essentials</p>
              </div>
            </div>
            <Link to="/search" className="text-xs font-bold text-brand hover:underline">
              View all offers &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {discountedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Featured or Main Products Catalog */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111111]">
                {selectedCategory ? 'Category Products' : 'Trending & Popular Products'}
              </h2>
              <p className="text-xs text-[#666666]">
                Available for instant local inquiry and quick checkout
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ${
              connected ? 'text-brand bg-brand-light' : 'text-amber-700 bg-amber-50'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? 'bg-brand animate-pulse' : 'bg-amber-500'
              }`}
            />
            {connected ? 'Live Catalog' : 'Catalog'}
          </span>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E5E7E5] rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-[#111111]">No products found in this category</h3>
            <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
              Please check other categories or browse the full store catalog.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-[#0F752C]"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Trending Searches */}
      {searches.length > 0 && (
        <section className="bg-white border border-[#E5E7E5] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-brand" />
            <h3 className="font-bold text-sm text-[#111111]">Popular Searches</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {searches.map((item) => (
              <button
                key={item.query}
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}`)}
                className="text-xs font-medium text-[#111111] bg-[#F7F8F7] border border-[#E5E7E5] rounded-full px-3 py-1.5 hover:border-brand hover:text-brand transition-colors cursor-pointer"
              >
                {item.query}
                <span className="text-[#999999] ml-1.5">×{item.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 6. WhatsApp Inquiry CTA Banner */}
      <section className="bg-gradient-to-br from-[#138A36] to-[#0A5722] rounded-3xl p-8 sm:p-10 text-white text-center shadow-lg relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto text-[#25D366]">
            <MessageCircle className="w-7 h-7 fill-white text-[#138A36]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Have Questions About Any Product?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto leading-relaxed">
            Get instant assistance, live product photos, bulk discounts, and fast local delivery by chatting with GrowLocal on WhatsApp.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => triggerWhatsAppInquiry({ customer: user })}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1fbe59] text-white font-bold text-sm shadow-md shadow-[#25D366]/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
              CHAT ON WHATSAPP
            </button>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Action Button for Easy Access */}
      <aside aria-label="WhatsApp Support" className="fixed bottom-20 md:bottom-6 right-5 z-40">
        <button
          type="button"
          onClick={() => triggerWhatsAppInquiry({ customer: user })}
          title="Inquire on WhatsApp"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-3 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 font-bold text-xs cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
          <span className="hidden sm:inline">Inquire on WhatsApp</span>
        </button>
      </aside>
    </div>
  );
}
