import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  User,
  X,
} from 'lucide-react';
import { ENDPOINTS, api } from '../lib/apiClient';
import { formatCurrency } from '../lib/format';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function CheckoutModal({ open, onClose, singleItem = null }) {
  const { user } = useAuth();
  const { items: cartItems, clearCart, subtotal: cartSubtotal } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  // Determine items and total
  const checkoutItems = singleItem ? [singleItem] : cartItems;
  const totalAmount = singleItem
    ? Number(singleItem.price) * (singleItem.quantity || 1)
    : cartSubtotal;

  const [step, setStep] = useState('checkout'); // 'checkout' | 'success'
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Pre-fill user data when opened
  useEffect(() => {
    if (open && user) {
      setRecipientName(user.full_name || '');
      setRecipientPhone(user.phone || '');
      setStep('checkout');
      setError('');
      setPlacedOrder(null);
    }
  }, [open, user]);

  if (!open || checkoutItems.length === 0) return null;

  async function handleSubmitOrder(e) {
    e.preventDefault();
    setError('');

    if (!recipientName.trim()) {
      setError('Please provide the recipient name.');
      return;
    }

    if (!recipientPhone.trim() || recipientPhone.trim().length < 8) {
      setError('Please provide a valid contact phone number.');
      return;
    }

    if (fulfillmentType === 'delivery' && (!deliveryAddress.trim() || deliveryAddress.trim().length < 5)) {
      setError('Please provide a valid delivery address (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fulfillmentType,
        deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress.trim() : null,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        deliveryPincode: deliveryPincode.trim() || null,
        deliveryNotes: deliveryNotes.trim() || null,
        items: checkoutItems.map((item) => {
          const prod = item.product || item;
          return {
            productId: prod.id,
            productVariantId: item.productVariantId || null,
            quantity: item.quantity || 1,
            unitPrice: Number(prod.price),
            productName: prod.name,
            productImage: prod.image_url || null,
          };
        }),
      };

      const res = await api.post(ENDPOINTS.ORDERS.CREATE, payload);
      const order = res.order;
      setPlacedOrder(order);

      // If checking out cart, clear cart
      if (!singleItem) {
        clearCart();
      }

      toast('Order placed successfully! Reference #' + (order.order_code || order.id?.slice(0, 8)));
      setStep('success');
    } catch (err) {
      setError(err?.message || 'Could not complete your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleViewOrder() {
    onClose();
    if (placedOrder?.id) {
      navigate(`/orders/${placedOrder.id}`);
    } else {
      navigate('/orders');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-[#E5E7E5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E7E5] bg-[#F7F8F7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#111111]">
                {step === 'success' ? 'Order Confirmed' : 'Checkout & Place Order'}
              </h3>
              <p className="text-xs text-[#666666]">
                {step === 'success'
                  ? 'Thank you for supporting local businesses'
                  : `${checkoutItems.length} item${checkoutItems.length > 1 ? 's' : ''} · ${formatCurrency(totalAmount)}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-xl text-[#666666] hover:text-[#111111] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {step === 'success' ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-sm animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold rounded-full mb-2">
                  #{placedOrder?.order_code || placedOrder?.id?.slice(0, 8)}
                </span>
                <h4 className="text-xl font-bold text-[#111111]">Order Placed Successfully!</h4>
                <p className="text-sm text-[#666666] mt-1 max-w-sm mx-auto">
                  Your order has been recorded in the GrowLocal system. We will notify you as soon as the shop confirms delivery.
                </p>
              </div>

              <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between text-xs text-[#666666]">
                  <span>Fulfillment:</span>
                  <span className="font-semibold text-[#111111] capitalize">
                    {placedOrder?.fulfillment_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                  </span>
                </div>
                {placedOrder?.delivery_address ? (
                  <div className="flex justify-between text-xs text-[#666666] gap-4">
                    <span>Address:</span>
                    <span className="font-medium text-[#111111] text-right truncate max-w-xs">
                      {placedOrder.delivery_address}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#E5E7E5] text-[#111111]">
                  <span>Total Amount:</span>
                  <span className="text-brand-dark">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleViewOrder}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand hover:bg-[#0F752C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Package className="w-4 h-4" />
                  View Order Details
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl border border-[#E5E7E5] bg-white hover:bg-[#F7F8F7] text-[#111111] font-semibold text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {error ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : null}

              {/* Order Items Summary */}
              <div>
                <label className="text-xs font-semibold text-[#666666] uppercase tracking-wider block mb-2">
                  Items to Order ({checkoutItems.length})
                </label>
                <div className="divide-y divide-[#E5E7E5] border border-[#E5E7E5] rounded-2xl bg-[#F7F8F7] p-3 max-h-44 overflow-y-auto space-y-2">
                  {checkoutItems.map((item, idx) => {
                    const prod = item.product || item;
                    const price = Number(prod.price || 0);
                    const qty = item.quantity || 1;
                    return (
                      <div key={prod.id || idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs gap-3">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-white border border-[#E5E7E5] flex items-center justify-center font-bold text-brand shrink-0 text-[10px]">
                            {qty}x
                          </span>
                          <span className="font-semibold text-[#111111] truncate">{prod.name}</span>
                        </div>
                        <span className="font-bold text-[#111111] shrink-0">
                          {formatCurrency(price * qty)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wider block mb-1">
                    Recipient Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#999999] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#666666] uppercase tracking-wider block mb-1">
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#999999] absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Fulfillment Type Selection */}
              <div>
                <label className="text-xs font-semibold text-[#666666] uppercase tracking-wider block mb-1.5">
                  Fulfillment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                      fulfillmentType === 'delivery'
                        ? 'border-brand bg-brand-light/30 text-brand-dark ring-2 ring-brand'
                        : 'border-[#E5E7E5] bg-white text-[#666666] hover:border-brand/40'
                    }`}
                  >
                    <Truck className={`w-5 h-5 shrink-0 mt-0.5 ${fulfillmentType === 'delivery' ? 'text-brand' : 'text-[#888888]'}`} />
                    <div>
                      <div className="text-sm font-bold text-[#111111]">Home Delivery</div>
                      <div className="text-xs text-[#666666]">Delivered to your doorstep</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                      fulfillmentType === 'pickup'
                        ? 'border-brand bg-brand-light/30 text-brand-dark ring-2 ring-brand'
                        : 'border-[#E5E7E5] bg-white text-[#666666] hover:border-brand/40'
                    }`}
                  >
                    <Store className={`w-5 h-5 shrink-0 mt-0.5 ${fulfillmentType === 'pickup' ? 'text-brand' : 'text-[#888888]'}`} />
                    <div>
                      <div className="text-sm font-bold text-[#111111]">Store Pickup</div>
                      <div className="text-xs text-[#666666]">Collect at local store</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Details */}
              {fulfillmentType === 'delivery' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#666666] uppercase tracking-wider block mb-1">
                      Complete Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#999999] absolute left-3 top-3" />
                      <textarea
                        required
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House / Flat No., Street, Area, Landmark"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#666666] uppercase tracking-wider block mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={deliveryPincode}
                        onChange={(e) => setDeliveryPincode(e.target.value)}
                        placeholder="e.g. 440001"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#666666] uppercase tracking-wider block mb-1">
                        Delivery Notes / Landmark
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Ring bell, near temple"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Payment Method Badge */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">
                    Payment Method: {fulfillmentType === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Store on Pickup'}
                  </span>
                </div>
                <span className="text-emerald-700 font-bold">Pay upon receipt</span>
              </div>

              {/* Footer Confirmation */}
              <div className="pt-2 border-t border-[#E5E7E5] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-[#666666]">Total Payable:</div>
                  <div className="text-lg font-bold text-brand-dark">{formatCurrency(totalAmount)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl border border-[#E5E7E5] text-xs font-semibold text-[#666666] hover:text-[#111111] hover:bg-[#F7F8F7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-brand hover:bg-[#0F752C] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Confirm Order
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
