import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon, Sparkles, TrendingUp, X } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import useLiveCatalog from '../hooks/useLiveCatalog.js';
import ProductCard from '../components/ProductCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeQuery = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  const [input, setInput] = useState(activeQuery);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [popular, setPopular] = useState([]);
  const [products, setProducts] = useState([]);

  useLiveCatalog(products, setProducts, { enabled: results !== null });

  useEffect(() => {
    setInput(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    api
      .get(ENDPOINTS.CATEGORIES.LIST)
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    api
      .get(ENDPOINTS.SEARCH.POPULAR, { query: { limit: 8 } })
      .then((data) => setPopular(data.searches || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const queryParams = { limit: 30 };
    if (activeQuery.trim()) queryParams.q = activeQuery.trim();
    if (categoryFilter.trim()) queryParams.categoryId = categoryFilter.trim();

    api
      .get(ENDPOINTS.PRODUCTS.LIST, { query: queryParams, signal: controller.signal })
      .then((data) => {
        setResults({ productTotal: data.total || data.products?.length || 0 });
        setProducts(data.products || []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Search failed');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [activeQuery, categoryFilter]);

  function submit(event) {
    event.preventDefault();
    const term = input.trim();
    const nextParams = {};
    if (term) nextParams.q = term;
    if (categoryFilter) nextParams.category = categoryFilter;
    setSearchParams(nextParams);
  }

  function handleCategoryClick(catId) {
    const nextParams = {};
    if (activeQuery) nextParams.q = activeQuery;
    if (categoryFilter !== catId) nextParams.category = catId;
    setSearchParams(nextParams);
  }

  function clearAllFilters() {
    setInput('');
    setSearchParams({});
  }

  const selectedCategoryName = categories.find((c) => c.id === categoryFilter)?.name;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">Product Catalog</h1>
        <p className="text-xs text-[#666666] mt-0.5">
          Browse and order from GrowLocal's verified product range.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={submit} className="flex max-w-xl">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search products by name or description…"
            className="w-full h-12 bg-white border border-[#E5E7E5] rounded-l-2xl pl-11 pr-4 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          {input ? (
            <button
              type="button"
              onClick={() => {
                setInput('');
                const nextParams = {};
                if (categoryFilter) nextParams.category = categoryFilter;
                setSearchParams(nextParams);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#999999] hover:text-[#111111]"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          className="h-12 px-6 rounded-r-2xl bg-brand text-white text-sm font-semibold hover:bg-[#0F752C] transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Category Pills Bar */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleCategoryClick('')}
            className={`px-3.5 py-2 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              !categoryFilter
                ? 'bg-brand text-white shadow-xs'
                : 'bg-white border border-[#E5E7E5] text-[#555555] hover:border-brand hover:text-brand'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategoryClick(c.id)}
              className={`px-3.5 py-2 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === c.id
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-white border border-[#E5E7E5] text-[#555555] hover:border-brand hover:text-brand'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Active filters summary */}
      {(activeQuery || categoryFilter) && (
        <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800">
          <div className="flex items-center gap-2">
            <span>Filtering by:</span>
            {activeQuery ? (
              <span className="font-semibold bg-white/70 px-2 py-0.5 rounded-md">
                “{activeQuery}”
              </span>
            ) : null}
            {selectedCategoryName ? (
              <span className="font-semibold bg-white/70 px-2 py-0.5 rounded-md">
                Category: {selectedCategoryName}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="font-bold underline text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Popular Searches when empty */}
      {popular.length > 0 && !activeQuery && (
        <div className="flex items-center gap-2 text-xs text-[#666666] flex-wrap">
          <span className="font-semibold text-[#111111]">Popular:</span>
          {popular.map((item) => (
            <button
              key={item.query}
              type="button"
              onClick={() => {
                setInput(item.query);
                setSearchParams({ q: item.query });
              }}
              className="bg-white border border-[#E5E7E5] px-2.5 py-1 rounded-full text-[#444444] hover:text-brand hover:border-brand transition-colors cursor-pointer"
            >
              {item.query}
            </button>
          ))}
        </div>
      )}

      {/* Search results */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : error ? (
        <EmptyState title="Search failed" subtitle={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          subtitle="Try adjusting your search terms or clearing your category filters."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#666666] font-medium">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
