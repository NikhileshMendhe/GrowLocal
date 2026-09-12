import React, { useState } from 'react';
import {
  X, ShoppingBag, MapPin, Store, Truck, CreditCard, CheckCircle2,
  Phone, User, ArrowRight, ShieldCheck, Zap, QrCode, Check, Copy, Sparkles
} from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { orderNotificationService } from '../services/orderNotificationService';

export default function BuyNowModal({
  product,
  currentUser,
  initialSize,
  isOpen,
  onClose,
  onCompleteOrder,
  onRequireAuth,
  onShowToast
}) {
  if (!isOpen || !product) return null;

  const [size, setSize] = useState(initialSize || product.sizes?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState('delivery'); // 'delivery' | 'pickup'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'cod' | 'card'
  
  // Customer details
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || 'Sitabuldi, Nagpur, Maharashtra');
  const [deliveryPincode, setDeliveryPincode] = useState('440012');
  const [orderNotes, setOrderNotes] = useState('');

  // Post-order success state
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const unitPrice = typeof product.price === 'number'
    ? product.price
    : parseInt(String(product.price || '0').replace(/[^0-9]/g, ''), 10) || 499;

  const originalUnitPrice = typeof product.originalPrice === 'number'
    ? product.originalPrice
    : parseInt(String(product.originalPrice || '0').replace(/[^0-9]/g, ''), 10) || (unitPrice * 1.25);

  const subtotal = unitPrice * quantity;
  const deliveryFee = fulfillmentType === 'delivery' ? 0 : 0; // Free delivery launch promo
  const totalAmount = subtotal + deliveryFee;

  const handlePlaceOrder = (e) => {
    e?.preventDefault();

    if (!customerName.trim()) {
      if (onShowToast) onShowToast("Please enter your name");
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      if (onShowToast) onShowToast("Please enter a valid 10-digit phone number");
      return;
    }
    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      if (onShowToast) onShowToast("Please provide your delivery address in Nagpur");
      return;
    }

    setIsSubmitting(true);

    const orderId = `GL-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: orderId,
      reservationCode: orderId,
      customerName,
      customerPhone,
      productName: product.name,
      productImage: product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      shopId: product.shopId || 'shop-1',
      shopName: product.shopName || 'Local Partner Store',
      shopAddress: product.shopAddress || 'Nagpur Central Commercial Grid',
      size,
      quantity,
      price: `₹${totalAmount.toLocaleString('en-IN')}`,
      unitPrice,
      totalAmount,
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'delivery' ? `${deliveryAddress}, Nagpur - ${deliveryPincode}` : null,
      paymentMethod,
      orderDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedArrival: fulfillmentType === 'delivery' ? 'Today in 30–60 minutes' : 'Ready for pickup in 15 minutes',
      status: 'Confirmed',
      qrCode: `${orderId}-NGP`
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedOrder(newOrder);

      // Trigger high-urgency siren notification to the merchant
      try {
        orderNotificationService.notifyNewOrder(newOrder);
      } catch (e) {
        console.warn('Failed to broadcast order notification:', e);
      }

      if (onCompleteOrder) {
        onCompleteOrder(newOrder);
      }
      if (onShowToast) {
        onShowToast(`🎉 Order ${orderId} placed successfully!`);
      }
    }, 450);
  };

  const handleCopyCode = () => {
    if (!confirmedOrder) return;
    navigator.clipboard?.writeText(confirmedOrder.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 my-auto relative animate-in zoom-in-95 duration-200">

        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#0B6B2B] to-[#138A36] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Zap className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-none">Instant Buy Now</h3>
                <span className="text-[10px] font-black uppercase bg-white/25 px-1.5 py-0.5 rounded text-white">Express</span>
              </div>
              <p className="text-[11px] text-white/80 font-medium mt-0.5">Verified Nagpur Local Store Fulfillment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── CONFIRMED ORDER SUCCESS SCREEN ── */}
        {confirmedOrder ? (
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#EAF7EE] text-[#138A36] border border-[#CDEED5] flex items-center justify-center mx-auto text-3xl shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#138A36]" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-[#138A36] font-extrabold text-[11px] rounded-full uppercase tracking-wider mb-2">
                Order Placed Successfully
              </span>
              <h2 className="text-xl font-black text-[#111111] font-poppins">
                Thank you for buying local!
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Your order is confirmed with <strong className="text-gray-800">{confirmedOrder.shopName}</strong>.
              </p>
            </div>

            {/* Order QR & Code Card */}
            <div className="bg-gradient-to-br from-[#F8FAF8] to-[#EAF7EE] border border-[#CDEED5] rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-between border-b border-[#CDEED5] pb-2 text-xs font-bold">
                <span className="text-gray-600">Order Reference</span>
                <span className="font-mono text-sm font-black text-[#138A36]">{confirmedOrder.id}</span>
              </div>

              {/* QR Image */}
              <div className="inline-block p-2 bg-white rounded-xl border border-[#CDEED5] shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(confirmedOrder.id)}`}
                  alt="Order QR Code"
                  className="w-32 h-32 rounded-lg mx-auto"
                />
              </div>

              <div className="text-xs text-gray-700 space-y-1">
                <p className="font-extrabold text-[#111111]">{confirmedOrder.productName} (Qty: {confirmedOrder.quantity})</p>
                <p className="text-[11px] text-gray-500">
                  {confirmedOrder.fulfillmentType === 'delivery'
                    ? `🛵 Doorstep Delivery: ${confirmedOrder.estimatedArrival}`
                    : `🏪 Self Pickup: ${confirmedOrder.estimatedArrival}`}
                </p>
                <p className="text-sm font-black text-[#138A36] pt-1">
                  Total Paid / Due: {confirmedOrder.price}
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full py-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copiedCode ? 'Order Code Copied!' : 'Copy Order Code'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  onClose();
                  if (typeof window !== 'undefined') window.history.pushState({}, '', '/reservations');
                  window.location.href = '/reservations';
                }}
                className="flex-1 py-3 bg-[#138A36] hover:bg-[#0F752C] text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View in My Orders</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── CHECKOUT FORM VIEW ── */
          <form onSubmit={handlePlaceOrder} className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">

            {/* 1. Item Summary Card */}
            <div className="flex items-center gap-3 p-3 bg-[#F8FAF8] rounded-2xl border border-[#E5E7E5]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-200">
                <img
                  src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded-md">
                    {product.category || 'Retail'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">·</span>
                  <span className="text-[11px] font-bold text-gray-700 truncate">{product.shopName || 'Local Shop'}</span>
                </div>
                <h4 className="font-black text-xs sm:text-sm text-[#111111] truncate">{product.name}</h4>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-black text-[#138A36]">₹{unitPrice.toLocaleString('en-IN')}</span>
                  {originalUnitPrice > unitPrice && (
                    <span className="text-xs text-gray-400 line-through">₹{originalUnitPrice.toLocaleString('en-IN')}</span>
                  )}
                  {originalUnitPrice > unitPrice && (
                    <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                      {Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Size / Variant Selector & Quantity Row */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Sizes */}
              <div>
                <label className="block font-black text-gray-700 mb-1 text-[11px] uppercase">Option / Size</label>
                {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Standard' ? (
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full p-2 bg-[#F8FAF8] border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#138A36] focus:bg-white"
                  >
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600">
                    Standard Unit
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-black text-gray-700 mb-1 text-[11px] uppercase">Quantity</label>
                <div className="flex items-center justify-between bg-[#F8FAF8] border border-gray-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-black text-xs flex items-center justify-center border border-gray-200"
                  >
                    -
                  </button>
                  <span className="font-black text-sm text-[#111111]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-black text-xs flex items-center justify-center border border-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Fulfillment Selector */}
            <div>
              <label className="block font-black text-gray-700 mb-1.5 text-[11px] uppercase">How would you like to receive it?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    fulfillmentType === 'delivery'
                      ? 'bg-[#EAF7EE] border-[#138A36] shadow-xs'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className={`w-4 h-4 ${fulfillmentType === 'delivery' ? 'text-[#138A36]' : 'text-gray-500'}`} />
                    <span className={`text-xs font-black ${fulfillmentType === 'delivery' ? 'text-[#138A36]' : 'text-gray-800'}`}>
                      Fast Delivery
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">30–60 min to your door in Nagpur</p>
                  <span className="inline-block mt-1 text-[9px] font-black text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                    FREE PROMO
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    fulfillmentType === 'pickup'
                      ? 'bg-[#EAF7EE] border-[#138A36] shadow-xs'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Store className={`w-4 h-4 ${fulfillmentType === 'pickup' ? 'text-[#138A36]' : 'text-gray-500'}`} />
                    <span className={`text-xs font-black ${fulfillmentType === 'pickup' ? 'text-[#138A36]' : 'text-gray-800'}`}>
                      Store Pickup
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">Ready in 15 min at billing counter</p>
                  <span className="inline-block mt-1 text-[9px] font-black text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">
                    DIRECT PICKUP
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Customer & Address Information */}
            <div className="space-y-3 bg-[#F8FAF8] p-3.5 rounded-2xl border border-gray-200 text-xs">
              <p className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#138A36]" />
                Customer Contact Details
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#138A36]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Phone (for order SMS)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98230 12345"
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#138A36]"
                  />
                </div>
              </div>

              {fulfillmentType === 'delivery' ? (
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Delivery Address in Nagpur</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Flat/House, Street, Area (Dharampeth, Sadar, etc.)"
                      className="flex-1 p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#138A36]"
                    />
                    <input
                      type="text"
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value)}
                      placeholder="Pincode"
                      className="w-20 p-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#138A36] text-center"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#138A36] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-gray-900">{product.shopName || 'Store Location'}</span>
                    <p className="text-gray-500">{product.shopAddress || 'Nagpur Central Commercial Zone, Maharashtra'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Payment Method */}
            <div>
              <label className="block font-black text-gray-700 mb-1.5 text-[11px] uppercase">Payment Option</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'upi' ? 'bg-[#EAF7EE] border-[#138A36] text-[#138A36] font-black' : 'bg-white border-gray-200 text-gray-700 font-bold'
                  }`}
                >
                  <span className="block text-sm mb-0.5">📲</span>
                  <span>Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'cod' ? 'bg-[#EAF7EE] border-[#138A36] text-[#138A36] font-black' : 'bg-white border-gray-200 text-gray-700 font-bold'
                  }`}
                >
                  <span className="block text-sm mb-0.5">💵</span>
                  <span>{fulfillmentType === 'delivery' ? 'Cash on Delivery' : 'Pay at Store'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'card' ? 'bg-[#EAF7EE] border-[#138A36] text-[#138A36] font-black' : 'bg-white border-gray-200 text-gray-700 font-bold'
                  }`}
                >
                  <span className="block text-sm mb-0.5">💳</span>
                  <span>Card / NetBank</span>
                </button>
              </div>
            </div>

            {/* 5. Summary Breakdown */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Item Subtotal ({quantity} {quantity === 1 ? 'item' : 'items'})</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Nagpur Local Delivery</span>
                <span className="font-bold text-[#138A36]">FREE</span>
              </div>
              <div className="pt-1.5 border-t border-gray-200 flex justify-between items-baseline">
                <span className="font-black text-[#111111] text-sm">Total Payable</span>
                <span className="font-black text-lg text-[#138A36]">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#138A36] hover:bg-[#0F752C] disabled:bg-gray-300 text-white font-black text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>
                {isSubmitting ? 'Processing Order...' : `Confirm & Buy Now (₹${totalAmount.toLocaleString('en-IN')})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
