import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, ShoppingBag } from 'lucide-react';
import { formatMoney, initials } from '../lib/format';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { triggerWhatsAppInquiry } from '../lib/whatsapp.js';

export default function ProductCard({ product }) {
  const { addToCart, openCart } = useCart();
  const { user } = useAuth();
  const outOfStock = product.availability_status === 'Out of Stock';

  function handleQuickAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  }

  function handleQuickWhatsApp(e) {
    e.preventDefault();
    e.stopPropagation();
    triggerWhatsAppInquiry({ product, quantity: 1, customer: user });
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group cursor-pointer block bg-white border border-[#E5E7E5] rounded-2xl overflow-hidden card-shadow card-shadow-hover transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
    >
      <div className="relative aspect-square w-full bg-[#F4F6F4] overflow-hidden flex items-center justify-center shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#DDF3E3] via-[#EAF7EE] to-[#F7F8F7] flex items-center justify-center">
            <span className="text-3xl font-bold text-brand/40 select-none">
              {initials(product.name)}
            </span>
          </div>
        )}

        {product.discount_percentage > 0 ? (
          <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-brand px-2 py-0.5 rounded-md shadow-xs">
            {product.discount_percentage}% OFF
          </span>
        ) : null}

        {outOfStock ? (
          <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-[#666666] bg-white/95 border border-[#E5E7E5] px-2 py-0.5 rounded-md shadow-xs">
            Out of Stock
          </span>
        ) : null}

        {/* Quick action overlay buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleQuickWhatsApp}
            title="Inquire on WhatsApp"
            className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
          </button>
        </div>
      </div>

      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#111111] line-clamp-2 group-hover:text-brand transition-colors leading-snug">
            {product.name}
          </p>
          {product.category_name ? (
            <span className="text-[10px] font-medium text-[#666666] mt-1 inline-block">
              {product.category_name}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#111111]">{formatMoney(product.price)}</span>
            {product.original_price && Number(product.original_price) > Number(product.price) ? (
              <span className="text-[11px] text-[#999999] line-through">
                {formatMoney(product.original_price)}
              </span>
            ) : null}
          </div>

          {!outOfStock ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-brand bg-brand-light hover:bg-brand hover:text-white rounded-lg transition-colors border border-brand/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
