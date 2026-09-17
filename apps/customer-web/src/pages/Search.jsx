import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon, TrendingUp } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import useLiveCatalog from '../hooks/useLiveCatalog.js';
import ProductCard from '../components/ProductCard.jsx';
import ShopCard from '../components/ShopCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeQuery = searchParams.get('q') || '';
  const [input, setInput] = useState(activeQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [popular, setPopular] = useState([]);
  const [gaps, setGaps] = useState([]);

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);

  useLiveCatalog(products, setProducts, { enabled: results !== null });

  useEffect(() => {
    setInput(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    api
      .get(ENDPOINTS.SEARCH.POPULAR, { query: { limit: 10 } })
      .then((data) => setPopular(data.searches || []))
      .catch(() => {});
    api
      .get(ENDPOINTS.SEARCH.DEMAND_GAPS, { query: { limit: 8 } })
      .then((data) => setGaps(data.gaps || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeQuery) {
      setResults(null);
      setShops([]);
      setProducts([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api
      .post(ENDPOINTS.SEARCH.RUN, { query: activeQuery, limit: 20 }, { signal: controller.signal })
      .then((data) => {
        setResults(data);
        setShops(data.shops || []);
        setProducts(data.products || []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Search failed');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [activeQuery]);

  function submit(event) {
    event.preventDefault();
    const term = input.trim();
    setSearchParams(term ? { q: term } : {});
  }

  function runTerm(term) {
    setInput(term);
    setSearchParams({ q: term });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">Search</h1>
        <p className="text-sm text-[#666666] mt-1">
          One search across every shop and product on GrowLocal.
        </p>
      </div>

      <form onSubmit={submit} className="flex max-w-xl">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search shops & products…"
            className="w-full h-12 bg-white border border-[#E5E7E5] rounded-l-xl pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
        <button
          type="submit"
          className="h-12 px-6 rounded-r-xl bg-brand text-white text-sm font-semibold hover:bg-[#0F752C]"
        >
          Search
        </button>
      </form>

      {!activeQuery ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand" /> Popular right now
            </h2>
            {popular.length === 0 ? (
              <p className="text-sm text-[#666666] mt-3">No searches recorded yet — be the first!</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-4">
                {popular.map((item) => (
                  <button
                    key={item.query}
                    type="button"
                    onClick={() => runTerm(item.query)}
                    className="text-xs font-medium text-[#111111] bg-[#F7F8F7] border border-[#E5E7E5] rounded-full px-3 py-1.5 hover:border-brand hover:text-brand"
                  >
                    {item.query}
                    <span className="text-[#999999] ml-1.5">×{item.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white border border-[#E5E7E5] rounded-2xl p-5">
            <h2 className="text-base font-bold text-[#111111]">Demand gaps</h2>
            <p className="text-xs text-[#666666] mt-1">
              Searched often but no shop stocks it yet — a signal for local merchants.
            </p>
            {gaps.length === 0 ? (
              <p className="text-sm text-[#666666] mt-3">No gaps detected right now.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mt-4">
                {gaps.map((gap) => (
                  <button
                    key={gap.query}
                    type="button"
                    onClick={() => runTerm(gap.query)}
                    className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:border-amber-400"
                  >
                    {gap.query}
                    <span className="text-amber-600 ml-1.5">×{gap.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : error ? (
        <EmptyState title="Search failed" subtitle={error} />
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-[#666666]">
            {results?.shopTotal || 0} {results?.shopTotal === 1 ? 'shop' : 'shops'} ·{' '}
            {results?.productTotal || 0} {results?.productTotal === 1 ? 'product' : 'products'} for
            “{activeQuery}”
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#111111]">Shops</h2>
            {shops.length === 0 ? (
              <p className="text-sm text-[#666666] bg-white border border-[#E5E7E5] rounded-xl p-4">
                No shops matched.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#111111]">
              Products{' '}
              <span className="text-xs font-medium text-brand bg-brand-light px-2 py-0.5 rounded-full">
                live
              </span>
            </h2>
            {products.length === 0 ? (
              <EmptyState
                title="No products matched"
                subtitle="Try a different term, or post a demand request so nearby shops can source it for you."
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
