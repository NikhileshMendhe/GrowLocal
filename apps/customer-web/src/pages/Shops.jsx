import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import ShopCard from '../components/ShopCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Shops() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api
      .get(ENDPOINTS.SHOPS.LIST, {
        query: {
          q: searchParams.get('q') || undefined,
          category: searchParams.get('category') || undefined,
          city: searchParams.get('city') || undefined,
          limit: 24,
        },
        signal: controller.signal,
      })
      .then((data) => {
        setShops(data.shops || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Could not load shops');
        setLoading(false);
      });
    return () => controller.abort();
  }, [searchParams]);

  function applyFilters(event) {
    event.preventDefault();
    const next = {};
    if (query.trim()) next.q = query.trim();
    if (category.trim()) next.category = category.trim();
    if (city.trim()) next.city = city.trim();
    setSearchParams(next);
  }

  function clearFilters() {
    setQuery('');
    setCategory('');
    setCity('');
    setSearchParams({});
  }

  const hasFilters = query || category || city || searchParams.toString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">Browse shops</h1>
        <p className="text-sm text-[#666666] mt-1">
          {total > 0 ? `${total} local ${total === 1 ? 'shop' : 'shops'}` : 'Verified local shops'}{' '}
          near you
        </p>
      </div>

      <form
        onSubmit={applyFilters}
        className="bg-white border border-[#E5E7E5] rounded-2xl p-4 flex flex-col md:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by shop name or description…"
            className="w-full bg-[#F7F8F7] border border-[#E5E7E5] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category (slug, e.g. electronics)"
          className="md:w-52 bg-[#F7F8F7] border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="City"
          className="md:w-40 bg-[#F7F8F7] border border-[#E5E7E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-[#666666] hover:text-[#111111] rounded-lg"
          >
            Clear
          </button>
        ) : null}
      </form>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : error ? (
        <EmptyState title="Something went wrong" subtitle={error} />
      ) : shops.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No shops match those filters"
          subtitle="Try clearing the filters or searching for something broader."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
