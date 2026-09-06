import React from 'react';
import { ShoppingBag, MapPin, Clock, CheckCircle2, Navigation, QrCode, ArrowRight, Sparkles } from 'lucide-react';
import MapPlaceholder from '../components/MapPlaceholder';

export default function CustomerReservations({ reservations = [], onNavigate, onShowToast }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">My Product Reservations</h1>
          <p className="text-xs text-[#666666]">Reserved items held for pickup at Nagpur local stores</p>
        </div>
        {reservations.length > 0 && (
          <span className="bg-[#EAF7EE] text-[#138A36] text-xs font-bold px-3 py-1 rounded-full border border-[#DDF3E3]">
            {reservations.length} Active
          </span>
        )}
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E5E7E5] p-8 text-center space-y-4 card-shadow">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#111111]">No Active Reservations</h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto mt-1">
              Reserve products from verified shops near you, try or inspect in person, and pay offline at the counter.
            </p>
          </div>
          <button
            onClick={() => onNavigate ? onNavigate('searchResults') : null}
            className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Products Nearby</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {reservations.map((res) => (
          <div key={res.id} className="bg-white rounded-3xl border border-[#E5E7E5] p-5 md:p-6 card-shadow space-y-5">
            {/* Header Status */}
            <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#138A36] bg-[#EAF7EE] px-2.5 py-1 rounded-md">
                  {res.id}
                </span>
                <span className="bg-[#138A36] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-white text-[#138A36]" />
                  <span>{res.status}</span>
                </span>
              </div>
              <span className="text-xs text-[#666666] font-medium">{res.reservedDate}</span>
            </div>

            {/* Reserved Item */}
            <div className="flex items-center gap-4">
              <img src={res.productImage} alt={res.productName} className="w-20 h-20 rounded-2xl object-cover border border-[#E5E7E5]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#111111]">{res.productName}</h3>
                <p className="text-xs text-[#666666]">Store: <span className="font-bold text-[#111111]">{res.shopName}</span></p>
                <p className="text-xs text-[#138A36] font-bold">Size: {res.size} · Price: ₹{res.price}</p>
              </div>
            </div>

            {/* Pickup Details Box */}
            <div className="bg-[#F7F8F7] p-4 rounded-2xl border border-[#E5E7E5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#666666]">Pickup Hours:</span>
                <span className="font-bold text-[#111111] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#138A36]" />
                  <span>{res.pickupTime}</span>
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#111111]">
                <MapPin className="w-4 h-4 text-[#138A36] shrink-0 mt-0.5" />
                <span>{res.shopAddress}</span>
              </div>
            </div>

            {/* Map Directions Visual */}
            <MapPlaceholder shopName={res.shopName} address={res.shopAddress} distance="1.2 km away" />

            {/* Verification QR / Pickup Code */}
            <div className="bg-[#EAF7EE] p-4 rounded-2xl border border-[#DDF3E3] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#138A36] uppercase">Show Store Cashier Code</p>
                <p className="text-base font-mono font-bold text-[#111111]">{res.qrCode}</p>
              </div>
              <button
                onClick={() => onShowToast(`Store pickup code ${res.qrCode} ready!`)}
                className="bg-[#138A36] text-white p-2.5 rounded-xl hover:bg-[#0F752C] transition-colors"
                title="Show Pickup Code"
              >
                <QrCode className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
