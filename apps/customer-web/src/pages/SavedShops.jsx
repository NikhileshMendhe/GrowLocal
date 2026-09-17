import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating, VerifiedBadge } from '@growlocal/ui';
import { Heart, Loader2, MapPin } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useToast } from '../context/ToastContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { initials } from '../lib/format';

export default function SavedShops() {
  const toast = useToast();
  const [savedShops, setSavedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.SAVED_SHOPS.MINE, { query: { limit: 100 } })
      .then((data) => setSavedShops(data.savedShops || []))
      .catch((err) => setError(err.message || 'Could not load saved shops'))
      .finally(() => setLoading(false));
  }, []);

  async function unsave(shopId) {
    setBusyId(shopId);
    try {
      await api.delete(ENDPOINTS.SAVED_SHOPS.SAVE(shopId));
      setSavedShops((prev) => prev.filter((item) => item.shop_id !== shopId));
      toast('Removed from saved shops');
    } catch (err) {
      toast(err.message || 'Could not unsave this shop', 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">Saved shops</h1>
        <p className="text-sm text-[#666666] mt-1">Your favourite local stores, one tap away.</p>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : error ? (
        <EmptyState title="Something went wrong" subtitle={error} />
      ) : savedShops.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          subtitle="Tap the heart on any shop to keep it handy here."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {savedShops.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E5E7E5] rounded-2xl p-4 flex items-center gap-4"
            >
              <Link to={`/shops/${item.shop_id}`} className="shrink-0">
                <span className="w-14 h-14 rounded-2xl bg-brand-light overflow-hidden flex items-center justify-center text-sm font-bold text-brand">
                  {item.logo_url ? (
                    <img src={item.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials(item.name)
                  )}
                </span>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/shops/${item.shop_id}`}
                    className="text-sm font-semibold text-[#111111] truncate hover:text-brand"
                  >
                    {item.name}
                  </Link>
                  {item.is_verified ? <VerifiedBadge size="small" /> : null}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-[#666666]">
                    <MapPin className="w-3 h-3 text-brand" /> {item.city}
                  </span>
                  <Rating rating={item.rating ?? 5} count={item.review_count} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => unsave(item.shop_id)}
                disabled={busyId === item.shop_id}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:border-red-400 rounded-lg disabled:opacity-50"
              >
                {busyId === item.shop_id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Heart className="w-3.5 h-3.5 fill-red-600" />
                )}
                Unsave
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
