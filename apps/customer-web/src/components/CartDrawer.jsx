import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/apiClient.js';
import { formatCurrency } from '../lib/format.js';
import {
  OFFICIAL_WHATSAPP_SHORT_LINK,
  triggerWhatsAppInquiry,
} from '../lib/whatsapp.js';
import CheckoutModal from './CheckoutModal.jsx';

export default function CartDrawer() {
  const { items, totalCount, subtotal, isCartOpen, closeCart, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  function handleWhatsAppInquiry() {
    triggerWhatsAppInquiry({
      items,
      totalAmount: subtotal,
      customer: user,
    });
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#E5E7E5] flex items-center justify-between shrink-0 bg-[#F7F8F7]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand" />
              <h2 className="font-bold text-base text-[#111111]">
                My Shopping Cart ({totalCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E5E7E5]">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-[#111111]">Your cart is empty</h3>
                <p className="text-xs text-[#666666] mt-1 max-w-xs mx-auto">
                  Browse products and add items to your cart to inquire or order.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-white hover:bg-[#0F752C]"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              items.map((item) => {
                const prod = item.product;
                const price = Number(prod.price) || 0;
                const itemTotal = price * item.quantity;

                return (
                  <div key={prod.id} className="py-4 first:pt-0 last:pb-0 flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-[#F0F2F0] border border-[#E5E7E5] overflow-hidden shrink-0 flex items-center justify-center">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-[#999999]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-[#111111] truncate">{prod.name}</h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(prod.id)}
                          className="text-[#999999] hover:text-red-600 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-brand font-bold mt-0.5">
                        {formatCurrency(price)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#E5E7E5] rounded-lg overflow-hidden bg-[#F7F8F7]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(prod.id, -1)}
                            className="p-1 hover:bg-[#E5E7E5] text-[#444444]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-[#111111]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(prod.id, 1)}
                            className="p-1 hover:bg-[#E5E7E5] text-[#444444]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#111111]">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Actions */}
          {items.length > 0 ? (
            <div className="p-5 border-t border-[#E5E7E5] bg-[#F7F8F7] space-y-3 shrink-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#666666]">Estimated Total ({totalCount} items):</span>
                <span className="text-lg font-bold text-brand-dark">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {/* Primary Action: WhatsApp Inquiry */}
              <button
                type="button"
                onClick={handleWhatsAppInquiry}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                INQUIRE ON WHATSAPP
              </button>

              {/* Secondary Action: Order Now */}
              <button
                type="button"
                onClick={handleOrderNow}
                className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-[#0F752C] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                ORDER NOW
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
