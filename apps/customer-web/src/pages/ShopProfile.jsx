import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Rating, VerifiedBadge } from '@growlocal/ui';
import {
  Clock,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Send,
} from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import useLiveCatalog from '../hooks/useLiveCatalog.js';
import ProductCard from '../components/ProductCard.jsx';
import EnquiryModal from '../components/EnquiryModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, initials } from '../lib/format';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ShopProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const [savingShop, setSavingShop] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useLiveCatalog(products, setProducts);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get(ENDPOINTS.SHOPS.DETAIL(id)).catch((err) => {
        throw err;
      }),
      api
        .get(ENDPOINTS.PRODUCTS.LIST, { query: { shopId: id, limit: 48 } })
        .catch(() => ({ products: [] })),
      api
        .get(ENDPOINTS.REVIEWS.LIST, { query: { shopId: id, limit: 10 } })
        .catch(() => ({ reviews: [] })),
    ])
      .then(([shopData, productData, reviewData]) => {
        setShop(shopData.shop);
        setProducts(productData.products || []);
        setReviews(reviewData.reviews || []);
      })
      .catch((err) => setError(err.message || 'Could not load this shop'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSaved(false);
      return;
    }
    api
      .get(ENDPOINTS.SAVED_SHOPS.MINE, { query: { limit: 100 } })
      .then((data) => setSaved((data.savedShops || []).some((item) => item.shop_id === id)))
      .catch(() => {});
  }, [isAuthenticated, id]);

  function searchProducts(event) {
    event.preventDefault();
    api
      .get(ENDPOINTS.PRODUCTS.LIST, {
        query: { shopId: id, limit: 48, ...(productQuery.trim() ? { q: productQuery.trim() } : {}) },
      })
      .then((data) => setProducts(data.products || []))
      .catch(() => {});
  }

  async function toggleSave() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/shops/${id}` } });
      return;
    }
    setSavingShop(true);
    try {
      if (saved) {
        await api.delete(ENDPOINTS.SAVED_SHOPS.SAVE(id));
        setSaved(false);
        toast('Removed from saved shops');
      } else {
        await api.put(ENDPOINTS.SAVED_SHOPS.SAVE(id));
        setSaved(true);
        toast('Shop saved!');
      }
    } catch (err) {
      toast(err.message || 'Could not update saved shops', 'error');
    } finally {
      setSavingShop(false);
    }
  }

  async function startChat() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/shops/${id}` } });
      return;
    }
    setStartingChat(true);
    try {
      const data = await api.post(ENDPOINTS.CONVERSATIONS.CREATE, { shopId: id });
      navigate(`/chat/${data.conversation.id}`);
    } catch (err) {
      toast(err.message || 'Could not start the chat', 'error');
    } finally {
      setStartingChat(false);
    }
  }

  function openEnquiry() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/shops/${id}` } });
      return;
    }
    setEnquiryOpen(true);
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !shop) {
    return <EmptyState title="Shop not found" subtitle={error || 'This shop does not exist.'} />;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = (shop.hours || []).find((entry) => entry.day_of_week === today);

  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden">
        <div className="h-40 md:h-52 bg-gradient-to-br from-[#138A36] via-[#159947] to-[#0B6B2B] relative">
          {shop.cover_image_url ? (
            <img src={shop.cover_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-white/70 select-none">
              {initials(shop.name)}
            </span>
          )}
        </div>
        <div className="bg-white border border-[#E5E7E5] border-t-0 rounded-b-3xl p-5 md:p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-light border border-[#E5E7E5] overflow-hidden -mt-12 shadow-lg shrink-0">
              {shop.logo_url ? (
                <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center font-bold text-brand text-xl">
                  {initials(shop.name)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-[#111111]">{shop.name}</h1>
                {shop.is_verified ? <VerifiedBadge /> : null}
                {shop.is_featured ? (
                  <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                    Featured
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#666666]">
                <Rating rating={shop.rating ?? 5} count={shop.review_count} />
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand" /> {shop.city}
                </span>
                {shop.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand" /> {shop.phone}
                  </span>
                ) : null}
                {todayHours ? (
                  <span
                    className={`inline-flex items-center gap-1 ${
                      todayHours.is_open ? 'text-brand' : 'text-amber-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {todayHours.is_open
                      ? `Open today · ${String(todayHours.opening_time).slice(0, 5)}–${String(
                          todayHours.closing_time
                        ).slice(0, 5)}`
                      : 'Closed today'}
                  </span>
                ) : null}
              </div>
              {shop.description ? (
                <p className="text-sm text-[#666666] mt-2 max-w-2xl">{shop.description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSave}
                disabled={savingShop}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border ${
                  saved
                    ? 'text-red-600 border-red-200 bg-red-50'
                    : 'text-[#666666] border-[#E5E7E5] bg-white hover:border-brand hover:text-brand'
                }`}
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-red-600' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={startChat}
                disabled={startingChat}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg disabled:opacity-50"
              >
                {startingChat ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                Chat
              </button>
              <button
                type="button"
                onClick={openEnquiry}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-brand-dark bg-brand-light border border-brand/20 hover:border-brand rounded-lg"
              >
                <Send className="w-4 h-4" /> Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <form onSubmit={searchProducts} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <input
              value={productQuery}
              onChange={(event) => setProductQuery(event.target.value)}
              placeholder="Search products in this shop…"
              className="w-full bg-white border border-[#E5E7E5] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111111]">
            Products <span className="text-sm font-medium text-[#666666]">({products.length})</span>
          </h2>
          <span className="text-xs text-[#666666]">Updates live</span>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            subtitle="This shop hasn't listed anything (matching your search) yet — check back soon."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-[1fr_20rem] gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#111111]">
            Reviews{' '}
            <span className="text-sm font-medium text-[#666666]">({shop.review_count})</span>
          </h2>
          {reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              subtitle="Completed an order from this shop? Your review will appear here."
            />
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-[#E5E7E5] rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-xs font-bold text-brand">
                      {initials(review.customer_name)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {review.customer_name}
                      </p>
                      <p className="text-xs text-[#666666]">{formatDate(review.created_at)}</p>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      ★ {review.rating}
                    </span>
                  </div>
                  {review.review_text ? (
                    <p className="text-sm text-[#666666] mt-3">{review.review_text}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-[#E5E7E5] rounded-xl p-4">
            <h3 className="text-sm font-bold text-[#111111] mb-3">Shop hours</h3>
            <ul className="space-y-1.5 text-sm">
              {(shop.hours || []).length === 0 ? (
                <li className="text-[#666666] text-sm">Hours not listed.</li>
              ) : (
                DAYS.map((day) => {
                  const entry = (shop.hours || []).find((item) => item.day_of_week === day);
                  return (
                    <li
                      key={day}
                      className={`flex justify-between ${
                        day === today ? 'font-semibold text-brand-dark' : 'text-[#666666]'
                      }`}
                    >
                      <span>{day.slice(0, 3)}</span>
                      <span>
                        {entry && entry.is_open
                          ? `${String(entry.opening_time).slice(0, 5)} – ${String(
                              entry.closing_time
                            ).slice(0, 5)}`
                          : 'Closed'}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          <div className="bg-white border border-[#E5E7E5] rounded-xl p-4">
            <h3 className="text-sm font-bold text-[#111111] mb-2">Location</h3>
            <p className="text-sm text-[#666666]">{shop.address}</p>
            <p className="text-sm text-[#666666]">
              {shop.city}
              {shop.state ? `, ${shop.state}` : ''} {shop.pincode || ''}
            </p>
            {shop.photos && shop.photos.length > 0 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                {shop.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.image_url}
                    alt={photo.caption || ''}
                    className="w-20 h-20 object-cover rounded-lg border border-[#E5E7E5]"
                    loading="lazy"
                  />
                ))}
              </div>
            ) : null}
          </div>
          <Link
            to="/shops"
            className="block text-center text-sm font-semibold text-brand hover:underline"
          >
            ← Back to all shops
          </Link>
        </aside>
      </section>

      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        shopId={shop.id}
      />
    </div>
  );
}
