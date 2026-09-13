import React from 'react';
import { BellRing, VolumeX, CheckCircle, ArrowRight, X, Store, User, MapPin, Package, Clock } from 'lucide-react';

export default function IncomingOrderAlertModal({
  order,
  onDismiss,
  onAccept,
  targetPortal = 'merchant' // 'merchant' | 'admin'
}) {
  if (!order) return null;

  const isDelivery = order.fulfillmentType === 'delivery';
  const orderPrice = order.price || (order.totalAmount ? `₹${Number(order.totalAmount).toLocaleString('en-IN')}` : '₹0');

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-sans"
      onClick={onDismiss}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-4 border-emerald-500 animate-in zoom-in-95 duration-200 relative text-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors cursor-pointer"
          title="Turn Off Ringtone & Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header with Glowing Bell & Sound Wave Animation */}
        <div className="bg-gradient-to-r from-[#0B6B2B] via-[#138A36] to-[#1aad44] text-white p-5 sm:p-6 text-center relative overflow-hidden">
          {/* Subtle Background Glow Blobs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />

          {/* Animated Glowing Ringtone Bell */}
          <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-75" />
            <div className="relative w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30 text-amber-300">
              <BellRing className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-white text-[#138A36] text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-sm mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>New Customer Order Alert</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-poppins text-white">
            NEW ORDER RECEIVED!
          </h2>
          <p className="text-xs text-emerald-100 font-medium mt-0.5 max-w-xs mx-auto">
            {targetPortal === 'admin'
              ? 'A customer just placed a purchase order on Nagpur Local Grid'
              : 'A customer just placed an order for your store on GrowLocal'}
          </p>

          {/* Musical Equalizer Bar indicating live lovely ringtone */}
          <div className="flex items-center justify-center gap-1 mt-3 bg-black/20 py-1.5 px-3 rounded-full mx-auto w-fit">
            <span className="w-1 h-3 bg-amber-300 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-emerald-200 rounded-full animate-pulse delay-75" />
            <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-150" />
            <span className="w-1 h-6 bg-emerald-300 rounded-full animate-pulse delay-100" />
            <span className="w-1 h-3 bg-amber-300 rounded-full animate-pulse delay-200" />
            <span className="text-[10px] font-extrabold text-emerald-100 ml-1.5 tracking-wide">
              🎵 Smooth ringtone playing until stopped
            </span>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="bg-[#F8FAF8] rounded-2xl p-4 border border-[#E5E7E5] space-y-3">
            {/* Order Code & Time */}
            <div className="flex items-center justify-between text-xs border-b border-gray-200/70 pb-2">
              <span className="font-mono font-bold text-gray-500">ORDER ID</span>
              <span className="font-mono font-extrabold text-[#138A36] bg-[#EAF7EE] px-2.5 py-0.5 rounded-md border border-[#DDF3E3]">
                {order.id || order.qrCode || 'GL-ORDER'}
              </span>
            </div>

            {/* Product Name */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Purchased Item</span>
              <p className="font-extrabold text-base text-[#111111] leading-snug mt-0.5">
                {order.productName || 'Local Store Product'}
              </p>
              {order.size && (
                <span className="text-xs text-gray-600 font-semibold mt-0.5 inline-block">
                  Size: <strong className="text-gray-900">{order.size}</strong>
                  {order.quantity ? ` · Qty: ${order.quantity}` : ''}
                </span>
              )}
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-gray-200/70">
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Customer</span>
                <span className="font-extrabold text-gray-800 flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{order.customerName || 'Nagpur Shopper'}</span>
                </span>
                {order.customerPhone && (
                  <span className="text-[11px] text-gray-500 font-medium block">
                    {order.customerPhone}
                  </span>
                )}
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Total Price</span>
                <span className="font-black text-[#138A36] text-base block mt-0.5">
                  {orderPrice}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {order.paymentMethod || 'Pay at store / on delivery'}
                </span>
              </div>
            </div>

            {/* Target Shop (Important for Admin) */}
            {order.shopName && (
              <div className="pt-2 border-t border-gray-200/70 flex items-center gap-1.5 text-xs">
                <Store className="w-3.5 h-3.5 text-[#138A36] shrink-0" />
                <span className="text-gray-500">Store:</span>
                <strong className="text-gray-900 font-bold truncate">{order.shopName}</strong>
              </div>
            )}

            {/* Fulfillment Mode */}
            <div className="text-xs font-semibold pt-2 border-t border-gray-200/70 flex items-center justify-between">
              <span className="text-gray-500">Fulfillment Method:</span>
              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 ${
                isDelivery ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {isDelivery ? '🚚 Home Delivery' : '🏪 In-Store Inspection & Pickup'}
              </span>
            </div>

            {/* Delivery address if available */}
            {isDelivery && order.deliveryAddress && (
              <div className="text-[11px] text-gray-600 bg-white p-2 rounded-xl border border-gray-200/80 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{order.deliveryAddress}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onAccept}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#138A36] to-[#0B6B2B] hover:from-[#0F752C] hover:to-[#095020] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#138A36]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <span>
                {targetPortal === 'admin' ? '✓ View in Admin Enquiries & Orders' : '✓ Accept & View in Enquiries / Orders'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-extrabold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <VolumeX className="w-4 h-4 text-gray-500" />
              <span>🔕 Turn Off Ringtone & Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
