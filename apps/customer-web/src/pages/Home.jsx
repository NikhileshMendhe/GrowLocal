import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Megaphone, Search, Sparkles, Star, Store, Truck } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import useLiveCatalog from '../hooks/useLiveCatalog.js';
import ProductCard from '../components/ProductCard.jsx';
import ShopCard from '../components/ShopCard.jsx';
import SocketStatusBadge from '../components/SocketStatusBadge.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { connected } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [searches, setSearches] = useState([]);
  const [gaps, setGaps] = useState([]);

  useLiveCatalog(products, setProducts);

  useEffect(() => {
    api
      .get(ENDPOINTS.CATEGORIES.LIST)
      .then((data) => setCategories((data.categories || []).slice(0, 10)))
      .catch(() => {});
    api
      .get(ENDPOINTS.PRODUCTS.LIST, { query: { limit: 8 } })
      .then((data) => setProducts(data.products || []))
      .catch(() => {});
    api
      .get(ENDPOINTS.SHOPS.LIST, { query: { limit: 4 } })
      .then((data) => setShops(data.shops || []))
      .catch(() => {});
    api
      .get(ENDPOINTS.SEARCH.POPULAR, { query: { limit: 8 } })
      .then((data) => setSearches(data.searches || []))
      .catch(() => {});
    api
      .get(ENDPOINTS.SEARCH.DEMAND_GAPS, { query: { limit: 6 } })
      .then((data) => setGaps(data.gaps || []))
      .catch(() => {});
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="homepage-shell -mx-4 px-4 md:px-6">
      <section className="homepage-hero relative overflow-hidden -mx-4 md:-mx-6">
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-12 md:pt-14 md:pb-16">
          <div className="hero-ornament hidden sm:block" aria-hidden="true">
            <span className="hero-ornament-line" />
            <span className="hero-ornament-dot hero-ornament-dot-one" />
            <span className="hero-ornament-dot hero-ornament-dot-two" />
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div>
              <div className="homepage-social-proof flex items-center gap-2 text-sm">
                <span className="flex -space-x-1.5">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-[#159947] to-[#0B6B2B]"
                    />
                  ))}
                </span>
                <span className="text-[#666666]">
                  <strong className="text-[#111111]">12,000+</strong> shoppers in Nagpur
                </span>
              </div>

              <h1 className="homepage-title mt-5 text-4xl md:text-5xl font-extrabold leading-[1.05] text-[#111111]">
                <span>Your neighbourhood,</span> now in stock.
              </h1>
              <p className="mt-4 text-[#666666] max-w-md text-sm md:text-base leading-relaxed">
                Discover verified local shops, negotiate directly with owners, and pick up your
                order on your way home — no waiting for courier packages from far away.
              </p>

              <form onSubmit={submitSearch} className="mt-6 flex max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Try 'wireless earbuds' or 'kirana'…"
                    className="w-full h-12 bg-white border border-[#E5E7E5] rounded-l-xl pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-5 rounded-r-xl bg-brand text-white text-sm font-semibold hover:bg-[#0F752C]"
                >
                  Search
                </button>
              </form>

              <div className="homepage-metrics mt-8 grid grid-cols-3 border bg-white rounded-2xl overflow-hidden divide-x divide-[#E5E7E5]">
                <div className="py-3 text-center">
                  <p className="text-lg font-extrabold text-brand-dark">350+</p>
                  <p className="text-[10px] md:text-xs text-[#666666]">verified shops</p>
                </div>
                <div className="py-3 text-center">
                  <p className="text-lg font-extrabold text-brand-dark">3 km</p>
                  <p className="text-[10px] md:text-xs text-[#666666]">average pickup</p>
                </div>
                <div className="py-3 text-center">
                  <p className="text-lg font-extrabold text-brand-dark">4.6★</p>
                  <p className="text-[10px] md:text-xs text-[#666666]">shop rating</p>
                </div>
              </div>
            </div>

            <div className="homepage-visual relative hidden lg:block">
              <img
                src="/growlocal-scooter.png"
                alt="Local delivery scooter"
                className="homepage-scooter w-full max-w-md mx-auto"
              />
              <div className="homepage-visual-label absolute top-8 right-6 rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-brand" /> Ready in 2 hours
              </div>
              <div className="homepage-delivery-card absolute bottom-6 left-4 rounded-xl px-4 py-3 text-xs flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-brand" />
                <span>
                  <span className="block font-bold text-[#111111]">Order picked</span>
                  <span className="text-[#666666]">Sharma Kirana · 1.2 km away</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="homepage-content flex flex-col gap-12 py-12">
        <section>
          <div className="homepage-categories bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" /> Browse categories
              </h2>
              <Link
                to="/shops"
                className="text-sm font-semibold text-brand inline-flex items-center gap-1 hover:underline"
              >
                All shops <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shops?category=${encodeURIComponent(category.slug)}`}
                  className="shrink-0 px-4 py-2 rounded-full border border-[#E5E7E5] bg-white text-sm font-medium text-[#111111] hover:border-brand hover:text-brand"
                >
                  {category.name}
                </Link>
              ))}
              {categories.length === 0 ? (
                <span className="text-sm text-[#666666]">Categories coming soon.</span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="homepage-products flex flex-col gap-4">
          <div className="bg-white border border-[#E5E7E5] rounded-2xl p-4 md:p-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">Fresh from local shops</h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Live from the catalog — updates the moment a shop adds or edits a product.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ${
                connected ? 'text-brand bg-brand-light' : 'text-amber-700 bg-amber-50'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse-subtle ${
                  connected ? 'bg-brand' : 'bg-amber-500'
                }`}
              />
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
          {products.length > 0 ? (
            <div className="homepage-product-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="homepage-empty-state homepage-shops-empty bg-white border border-[#E5E7E5] rounded-2xl px-6 py-10 text-center">
              <h3 className="text-xl font-bold text-[#111111]">Shops are stocking up</h3>
              <p className="text-sm text-[#666666] mt-2 max-w-sm mx-auto">
                No products are live yet. Come back shortly — this grid updates in real time.
              </p>
            </div>
          )}
        </section>

        {shops.length > 0 ? (
          <section className="homepage-shops flex flex-col gap-4">
            <div className="bg-white border border-[#E5E7E5] rounded-2xl p-4 md:p-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111111]">Featured local shops</h2>
              <Link
                to="/shops"
                className="text-sm font-semibold text-brand inline-flex items-center gap-1 hover:underline"
              >
                Browse all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </section>
        ) : null}

        {(searches.length > 0 || gaps.length > 0) && (
          <section className="grid md:grid-cols-2 gap-4">
            {searches.length > 0 ? (
              <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5">
                <h2 className="text-base font-bold text-[#111111]">Trending searches</h2>
                <div className="flex flex-wrap gap-2 mt-4">
                  {searches.map((item) => (
                    <Link
                      key={item.query}
                      to={`/search?q=${encodeURIComponent(item.query)}`}
                      className="text-xs font-medium text-[#111111] bg-[#F7F8F7] border border-[#E5E7E5] rounded-full px-3 py-1.5 hover:border-brand hover:text-brand"
                    >
                      {item.query}
                      <span className="text-[#999999] ml-1.5">×{item.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {gaps.length > 0 ? (
              <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5">
                <h2 className="text-base font-bold text-[#111111]">
                  Searched a lot, not in stock yet
                </h2>
                <div className="flex flex-wrap gap-2 mt-4">
                  {gaps.map((gap) => (
                    <Link
                      key={gap.query}
                      to={`/search?q=${encodeURIComponent(gap.query)}`}
                      className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:border-amber-400"
                    >
                      {gap.query}
                      <span className="text-amber-600 ml-1.5">×{gap.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        )}

        <section className="homepage-final-cta relative overflow-hidden bg-gradient-to-br from-[#138A36] to-[#0B6B2B] rounded-3xl px-6 py-10 md:px-12 md:py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Can't find what you need?
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/80 max-w-lg mx-auto">
            Broadcast a demand request — shops near you will respond with what they have, at the
            price you want.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/demand"
                className="inline-flex items-center gap-2 bg-white text-brand-dark font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#EAF7EE]"
              >
                <Megaphone className="w-4 h-4" /> Post a demand request
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-dark font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#EAF7EE]"
              >
                <Star className="w-4 h-4" /> Join free to broadcast demand
              </Link>
            )}
          </div>
        </section>

        <div className="flex justify-center">
          <SocketStatusBadge />
        </div>
      </div>
    </div>
  );
}
