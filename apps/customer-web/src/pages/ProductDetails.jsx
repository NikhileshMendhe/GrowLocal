import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Rating, VerifiedBadge } from '@growlocal/ui';
import {
  ArrowLeft,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  Send,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatMoney, initials } from '../lib/format';
import BuyNowModal from '../components/BuyNowModal.jsx';
import EnquiryModal from '../components/EnquiryModal.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyOpen, setBuyOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.PRODUCTS.DETAIL(id))
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message || 'Could not load this product'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !product) return;
    api
      .get(ENDPOINTS.SAVED_SHOPS.MINE, { query: { limit: 100 } })
      .then((data) => setSaved((data.savedShops || []).some((item) => item.shop_id === product.shop_id)))
      .catch(() => {});
  }, [isAuthenticated, product?.shop_id]);

  function requireLogin(action) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    action();
  }

  async function toggleSave() {
    if (!product) return;
    requireLogin(async () => {
      setBusy(true);
      try {
        if (saved) {
          await api.delete(ENDPOINTS.SAVED_SHOPS.SAVE(product.shop_id));
          setSaved(false);
          toast('Removed from saved shops');
        } else {
          await api.put(ENDPOINTS.SAVED_SHOPS.SAVE(product.shop_id));
          setSaved(true);
          toast('Shop saved!');
        }
      } catch (err) {
        toast(err.message || 'Could not update saved shops', 'error');
      } finally {
        setBusy(false);
      }
    });
  }

  async function startChat() {
    if (!product) return;
    requireLogin(async () => {
      setBusy(true);
      try {
        const data = await api.post(ENDPOINTS.CONVERSATIONS.CREATE, { shopId: product.shop_id });
        navigate(`/chat/${data.conversation.id}`);
      } catch (err) {
        toast(err.message || 'Could not start the chat', 'error');
      } finally {
        setBusy(false);
      }
    });
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return <EmptyState title="Product not found" subtitle={error || 'It may have been removed.'} />;
  }

  const outOfStock = product.availability_status === 'Out of Stock';

  return (
    <div className="space-y-6">
      <Link
        to={`/shops/${product.shop_id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#666666] hover:text-brand"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {product.shop_name}
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#DDF3E3] via-[#EAF7EE] to-[#F7F8F7] rounded-3xl border border-[#E5E7E5] h-72 md:h-96 flex items-center justify-center relative overflow-hidden">
          <span className="text-6xl font-extrabold text-brand/30 select-none">
            {initials(product.name)}
          </span>
          {product.discount_percentage > 0 ? (
            <span className="absolute top-4 left-4 text-sm font-bold text-white bg-brand px-3 py-1 rounded-lg">
              {product.discount_percentage}% OFF
            </span>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            {product.category_name ? (
              <span className="text-xs font-semibold text-brand bg-brand-light px-2.5 py-1 rounded-md">
                {product.category_name}
              </span>
            ) : null}
            <h1 className="text-2xl md:text-3xl font-bold text-[#111111] mt-2">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Rating rating={5} showCount={false} />
              <span className="text-xs text-[#666666]">
                sold by{' '}
                <Link
                  to={`/shops/${product.shop_id}`}
                  className="font-semibold text-brand hover:underline"
                >
                  {product.shop_name}
                </Link>
              </span>
              {product.shop_is_verified ? <VerifiedBadge size="small" /> : null}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#111111]">
              {formatMoney(product.price)}
            </span>
            {product.original_price &&
            Number(product.original_price) > Number(product.price) ? (
              <>
                <span className="text-base text-[#666666] line-through">
                  {formatMoney(product.original_price)}
                </span>
                <span className="text-sm font-bold text-brand">
                  Save {formatMoney(Number(product.original_price) - Number(product.price))}
                </span>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                outOfStock
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-brand bg-brand-light border-brand/20'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              {product.availability_status} · {product.stock_quantity ?? '—'} left
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E5] bg-white text-[#666666]">
              <Truck className="w-4 h-4 text-brand" /> Pickup or delivery
            </span>
            {product.shop_is_verified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7E5] bg-white text-[#666666]">
                <ShieldCheck className="w-4 h-4 text-brand" /> Verified shop
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => requireLogin(() => setBuyOpen(true))}
              className="flex-1 min-w-[10rem] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-brand hover:bg-[#0F752C] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              {outOfStock ? 'Out of stock' : 'Buy now'}
            </button>
            <button
              type="button"
              onClick={() => requireLogin(() => setEnquiryOpen(true))}
              className="flex-1 min-w-[10rem] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-brand-dark bg-brand-light border border-brand/20 hover:border-brand rounded-xl"
            >
              <Send className="w-4 h-4" /> Negotiate
            </button>
            <button
              type="button"
              onClick={startChat}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#666666] bg-white border border-[#E5E7E5] hover:border-brand hover:text-brand rounded-xl disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" /> Chat
            </button>
            <button
              type="button"
              onClick={toggleSave}
              disabled={busy}
              className={`inline-flex items-center justify-center px-4 py-3 rounded-xl border ${
                saved
                  ? 'text-red-600 border-red-200 bg-red-50'
                  : 'text-[#666666] border-[#E5E7E5] bg-white hover:border-brand hover:text-brand'
              }`}
              aria-label={saved ? 'Unsave shop' : 'Save shop'}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-red-600' : ''}`} />
            </button>
          </div>

          {product.description ? (
            <div>
              <h2 className="text-sm font-bold text-[#111111] mb-1.5">About this product</h2>
              <p className="text-sm text-[#666666] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          ) : null}

          <Link
            to={`/shops/${product.shop_id}`}
            className="flex items-center gap-3 bg-white border border-[#E5E7E5] rounded-xl p-3 hover:border-brand"
          >
            <span className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center text-sm font-bold text-brand">
              {initials(product.shop_name)}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-[#111111]">
                {product.shop_name}
              </span>
              <span className="block text-xs text-[#666666] inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {product.shop_city}
              </span>
            </span>
            <ArrowLeft className="w-4 h-4 rotate-180 text-brand" />
          </Link>
        </div>
      </div>

      <BuyNowModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        product={product}
      />
      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        shopId={product.shop_id}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
