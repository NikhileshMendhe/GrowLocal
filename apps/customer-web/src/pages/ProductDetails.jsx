import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
} from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatMoney, initials } from '../lib/format';
import {
  OFFICIAL_WHATSAPP_SHORT_LINK,
  triggerWhatsAppInquiry,
} from '../lib/whatsapp.js';
import { trackActivity } from '../lib/activityTracker.js';
import EmptyState from '../components/EmptyState.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { addToCart, openCart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.PRODUCTS.DETAIL(id))
      .then((data) => {
        setProduct(data.product);
        if (data.product) {
          trackActivity({
            activityType: 'view_product',
            product: data.product,
            customer: user,
          });
        }
      })
      .catch((err) => setError(err.message || 'Could not load this product'))
      .finally(() => setLoading(false));
  }, [id, user]);

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

  // WhatsApp Inquiry URL with prefilled text
  const inquiryMessage = buildProductInquiryMessage(product, quantity);
  const whatsappUrl = buildWhatsAppUrl(inquiryMessage);

  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.image_url)
      : product.image_url
      ? [product.image_url]
      : [];

  function handleAddToCart() {
    addToCart(product, quantity);
    openCart();
  }

  function handleOrderNow() {
    if (!isAuthenticated) {
      openAuthModal('login', () => {
        setCheckoutOpen(true);
      });
      return;
    }
    setCheckoutOpen(true);
  }

  return (
    <div className="space-y-6">
      <Link
        to="/search"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#666666] hover:text-brand transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Product Media Gallery */}
        <div className="space-y-3">
          <div className="aspect-square w-full bg-[#F4F6F4] rounded-3xl border border-[#E5E7E5] flex items-center justify-center relative overflow-hidden shadow-sm">
            {images.length > 0 ? (
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#DDF3E3] via-[#EAF7EE] to-[#F7F8F7] flex items-center justify-center">
                <span className="text-6xl font-extrabold text-brand/30 select-none">
                  {initials(product.name)}
                </span>
              </div>
            )}
            {product.discount_percentage > 0 ? (
              <span className="absolute top-4 left-4 text-xs font-bold text-white bg-brand px-3 py-1 rounded-lg shadow-sm">
                {product.discount_percentage}% OFF
              </span>
            ) : null}
            {outOfStock ? (
              <span className="absolute bottom-4 right-4 text-xs font-semibold text-[#666666] bg-white/95 border border-[#E5E7E5] px-3 py-1 rounded-lg shadow-sm">
                Out of Stock
              </span>
            ) : null}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                    selectedImage === idx
                      ? 'border-brand shadow-sm'
                      : 'border-[#E5E7E5] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="space-y-6">
          <div>
            {product.category_name ? (
              <span className="text-xs font-bold uppercase tracking-wider text-brand bg-brand-light px-2.5 py-1 rounded-md">
                {product.category_name}
              </span>
            ) : null}
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] mt-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[#888888] mt-1">Verified GrowLocal Listing</p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-white border border-[#E5E7E5] rounded-2xl flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#111111]">
              {formatMoney(product.price)}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) ? (
              <>
                <span className="text-base text-[#999999] line-through">
                  {formatMoney(product.original_price)}
                </span>
                <span className="text-sm font-bold text-brand bg-brand-light px-2 py-0.5 rounded-md">
                  Save {formatMoney(Number(product.original_price) - Number(product.price))}
                </span>
              </>
            ) : null}
          </div>

          {/* Quantity Selector */}
          {!outOfStock ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-[#111111] uppercase tracking-wide">
                Quantity:
              </span>
              <div className="flex items-center border border-[#E5E7E5] rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 hover:bg-[#F0F2F0] text-[#444444]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-[#111111]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 hover:bg-[#F0F2F0] text-[#444444]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}

          {/* Availability Pills */}
          <div className="flex flex-wrap gap-2.5 text-xs font-semibold">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                outOfStock
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-brand bg-brand-light border-brand/20'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              {product.availability_status}{' '}
              {product.stock_quantity ? `· ${product.stock_quantity} in stock` : ''}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7E5] bg-white text-[#555555]">
              <Truck className="w-4 h-4 text-brand" /> Instant Local Pickup & Delivery
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7E5] bg-white text-[#555555]">
              <ShieldCheck className="w-4 h-4 text-brand" /> 100% Quality Checked
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Primary Action: Inquire on WhatsApp */}
            <button
              type="button"
              onClick={() => triggerWhatsAppInquiry({ product, quantity, customer: user })}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-2xl shadow-md shadow-[#25D366]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
              INQUIRE ON WHATSAPP
            </button>

            {/* Dual Actions: Add to Cart & Order Now */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-brand bg-brand-light border border-brand/30 hover:bg-brand/10 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                ADD TO CART
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={handleOrderNow}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-[#111111] bg-white border-2 border-[#111111] hover:bg-[#111111] hover:text-white rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {outOfStock ? 'OUT OF STOCK' : 'ORDER NOW'}
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description ? (
            <div className="pt-4 border-t border-[#E5E7E5]">
              <h2 className="text-sm font-bold text-[#111111] mb-2">About this product</h2>
              <p className="text-sm text-[#666666] leading-relaxed whitespace-pre-line bg-white border border-[#E5E7E5] rounded-2xl p-4">
                {product.description}
              </p>
            </div>
          ) : null}

          {/* Guarantee Box */}
          <div className="p-4 bg-[#F8FAF8] border border-[#E5E7E5] rounded-2xl space-y-2 text-xs text-[#666666]">
            <p className="font-bold text-[#111111] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand" /> GrowLocal Promise
            </p>
            <p>
              Direct contact on WhatsApp guarantees lightning-fast response times, live product photos on request, and smooth local fulfillment.
            </p>
          </div>
        </div>
      </div>

      {product && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          singleItem={{ ...product, quantity }}
        />
      )}
    </div>
  );
}
