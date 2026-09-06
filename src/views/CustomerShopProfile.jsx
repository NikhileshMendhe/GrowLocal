import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, Heart, Share2, MessageSquare, Navigation, Bookmark, 
  Clock, Calendar, Tag, MapPin, ChevronDown, ChevronUp, Star, ShieldCheck, 
  Lock, Store, Check, ExternalLink, Image as ImageIcon, QrCode, Copy, X, Phone 
} from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import Rating from '../components/Rating';
import MapPlaceholder from '../components/MapPlaceholder';
import ProductCard from '../components/ProductCard';

export default function CustomerShopProfile({ 
  shop, 
  products, 
  isSaved, 
  onToggleSave, 
  onBack, 
  onSelectProduct, 
  onOpenChat,
  onBuyNow,
  onShowToast 
}) {
  const [readMore, setReadMore] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!shop) return null;

  const shopSlug = shop.id || (shop.name ? shop.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') : 'store');
  const shopUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/shop/${encodeURIComponent(shopSlug)}`
    : `https://growlocal.netlify.app/shop/${encodeURIComponent(shopSlug)}`;

  const handleShareClick = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${shop.name} on GrowLocal`,
          text: `Check out ${shop.name} on GrowLocal Nagpur! Browse local in-store catalog and message the shop directly:`,
          url: shopUrl
        });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shopUrl);
    setCopiedLink(true);
    if (onShowToast) onShowToast("🔗 Shop link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shopProducts = (products || []).filter(p => 
    p.shopId === shop.id || 
    (p.shopName && shop.name && p.shopName.trim().toLowerCase() === shop.name.trim().toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* 1. Hero Cover Header */}
      <div className="relative h-64 md:h-80 w-full bg-gray-200 overflow-hidden md:rounded-3xl shadow-md">
        <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Top Overlay Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#111111] hover:bg-white shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                onToggleSave(shop.id);
                onShowToast(isSaved ? "Shop removed from saved list" : "Shop saved to your bookmarks!");
              }}
              className={`p-2.5 backdrop-blur-md rounded-full shadow-md transition-all ${
                isSaved ? "bg-[#138A36] text-white" : "bg-white/90 text-[#111111] hover:bg-white"
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? "fill-white" : ""}`} />
            </button>

            <button 
              onClick={handleShareClick}
              className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#111111] hover:bg-white shadow-md transition-all cursor-pointer active:scale-95"
              title="Share Shop Link & QR"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop Logo Avatar overlay */}
        <div className="absolute bottom-4 left-4 md:left-6 flex items-end gap-4 z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-xl">
            <img src={shop.logoImage || shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* 2. Shop Overview Section */}
        <div className="bg-white rounded-3xl border border-[#E5E7E5] p-5 md:p-6 card-shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">{shop.name}</h1>
                {shop.verified && <VerifiedBadge text="✓ Verified Shop" />}
              </div>

              <p className="text-sm font-semibold text-[#666666]">{shop.category}</p>

              <div className="flex items-center gap-3 mt-2 text-xs text-[#666666]">
                <Rating rating={shop.rating} count={`${shop.reviewsCount} ratings`} />
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-[#138A36]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{shop.distance}</span>
                </span>
              </div>

              <p className="text-xs text-[#666666] mt-1">{shop.address}</p>
            </div>

            {/* Main Action Buttons: Enquire / Call / Directions / Save */}
            <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
              <button
                onClick={() => onOpenChat(shop)}
                className="flex-1 md:flex-initial bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs md:text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                title="Send Enquiry / Message"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Enquire / Message</span>
              </button>

              <a
                href={`tel:${shop.phone || '+917122548899'}`}
                onClick={(e) => {
                  if (typeof window !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches) {
                    e.preventDefault();
                    setShowCallModal(true);
                  }
                }}
                className="bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] font-bold text-xs md:text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#DDF3E3]"
                title="Call Shopkeeper"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>

              <button
                onClick={() => setShowMap(!showMap)}
                className="bg-[#F7F8F7] hover:bg-gray-100 text-[#111111] font-bold text-xs md:text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E5E7E5]"
                title="View Directions on Map"
              >
                <Navigation className="w-4 h-4 text-[#138A36]" />
                <span>{showMap ? "Hide Map" : "Directions"}</span>
              </button>

              <button
                onClick={() => {
                  onToggleSave(shop.id);
                  onShowToast(isSaved ? "Shop removed from saved list" : "Shop saved!");
                }}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  isSaved ? "bg-[#138A36] text-white border-[#138A36]" : "bg-white text-[#111111] border-[#E5E7E5] hover:bg-gray-50"
                }`}
                title={isSaved ? "Saved" : "Save Shop"}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
              </button>
            </div>
          </div>

          {/* Interactive Map Visual */}
          {showMap && (
            <div className="pt-3 animate-in fade-in duration-200">
              <MapPlaceholder shopName={shop.name} address={shop.address} distance={shop.distance} />
              <div className="mt-2 text-right">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + ' ' + (shop.address || 'Nagpur'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#138A36] hover:underline"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Call Modal for Desktop */}
          {showCallModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-[#E5E7E5] shadow-2xl relative animate-in zoom-in-95 duration-150">
                <button
                  onClick={() => setShowCallModal(false)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111111]">{shop.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Verified Nagpur Merchant Contact</p>
                  <p className="text-lg font-mono font-black text-[#138A36] mt-2">
                    {shop.phone || '+91 712 254 8899'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">Available during store hours: {shop.openHours || '10:00 AM – 9:00 PM'}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${shop.phone || '+917122548899'}`}
                    className="flex-1 py-2.5 px-4 bg-[#138A36] hover:bg-[#0F752C] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Dial Number</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(shop.phone || '+91 712 254 8899');
                      if (onShowToast) onShowToast('📋 Phone number copied!');
                      setShowCallModal(false);
                    }}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Shop Information Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#666666] uppercase">Open Hours</p>
              <p className="text-xs font-bold text-[#111111]">{shop.openHours}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#666666] uppercase">Working Days</p>
              <p className="text-xs font-bold text-[#111111]">{shop.openDays}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#666666] uppercase">Price Range</p>
              <p className="text-xs font-bold text-[#111111]">{shop.priceRange}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E7E5] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#666666] uppercase">Category</p>
              <p className="text-xs font-bold text-[#111111] truncate">{shop.category}</p>
            </div>
          </div>
        </div>

        {/* 4. About Shop */}
        <div className="bg-white rounded-3xl border border-[#E5E7E5] p-5 md:p-6 card-shadow space-y-2">
          <h2 className="text-base font-bold text-[#111111]">About Shop</h2>
          <p className={`text-xs md:text-sm text-[#666666] leading-relaxed ${!readMore ? "line-clamp-2" : ""}`}>
            {shop.about}
          </p>
          <button
            onClick={() => setReadMore(!readMore)}
            className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1 pt-1"
          >
            <span>{readMore ? "Show Less ↑" : "Read More ↓"}</span>
          </button>
        </div>

        {/* 3. Shop Inventory & Live Products Showcase */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <h2 className="text-lg md:text-xl font-black text-[#111111] font-poppins">
                  Store Inventory ({shopProducts.length})
                </h2>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                {shopProducts.length > 0 
                  ? `Live in-store stock available at ${shop.name}`
                  : `Digital catalog for this neighborhood store`}
              </p>
            </div>
            {shopProducts.length > 0 && (
              <span className="text-xs font-bold text-[#138A36] bg-[#EAF7EE] px-3 py-1 rounded-full border border-[#DDF3E3]">
                ✓ In-Store Stock
              </span>
            )}
          </div>

          {shopProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E5E7E5] p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F8F7] flex items-center justify-center text-3xl mx-auto border border-[#E5E7E5]">
                📦
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-extrabold text-base text-[#111111]">
                  Sorry, currently no products are available in this store's inventory.
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {shop.name} hasn't published digital inventory items yet, but their physical store is open at {shop.address}. You can message them directly to check item availability and prices!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onOpenChat(shop)}
                  className="bg-[#138A36] hover:bg-[#0B6B2B] text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message {shop.name} to Ask</span>
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className="bg-[#F7F8F7] hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] text-xs font-bold px-4 py-3 rounded-xl border border-[#E5E7E5] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>View Location & Directions</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {shopProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onClick={onSelectProduct}
                  onAskAvailability={(p) => onOpenChat(shop)}
                  onBuyNow={onBuyNow}
                />
              ))}
            </div>
          )}
        </div>

        {/* 6. Shop Photos Gallery */}
        {shop.photos && shop.photos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111111]">Shop Photos</h2>
              <span className="text-xs text-[#138A36] font-semibold">Store Gallery</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {shop.photos.map((photoUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhoto(photoUrl)}
                  className="w-32 h-24 rounded-2xl overflow-hidden border border-[#E5E7E5] shrink-0 group relative"
                >
                  <img src={photoUrl} alt="Shop interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 7. Customer Reviews Section */}
        <div className="bg-white rounded-3xl border border-[#E5E7E5] p-5 md:p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7E5] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#111111]">Customer Ratings & Reviews</h2>
              <p className="text-xs text-[#666666]">Verified customer feedback in Nagpur</p>
            </div>
            <span className="bg-[#EAF7EE] text-[#138A36] text-xs font-bold px-3 py-1 rounded-full">
              {shop.reviewsRecommendation}% Customers Recommend
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Rating Number */}
            <div className="text-center md:border-r border-[#E5E7E5] pr-4">
              <span className="text-4xl font-black text-[#111111]">{shop.rating}</span>
              <div className="flex justify-center gap-1 my-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-[#666666]">{shop.reviewsCount} Total Ratings</span>
            </div>

            {/* Rating Breakdown Progress Bars */}
            <div className="col-span-2 space-y-1.5 text-xs font-semibold text-[#666666]">
              {Object.entries(shop.ratingsBreakdown || {}).reverse().map(([star, count]) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-6">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#138A36]" 
                      style={{ width: `${(count / shop.reviewsCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Trust Section */}
        <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-6 h-6 text-[#138A36]" />
            <h4 className="font-bold text-xs text-[#111111]">✓ Verified Shop</h4>
            <p className="text-[11px] text-[#666666]">Background & GST verified local merchant</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Store className="w-6 h-6 text-[#138A36]" />
            <h4 className="font-bold text-xs text-[#111111]">✓ Local Business</h4>
            <p className="text-[11px] text-[#666666]">Supporting local Nagpur retail economy</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Lock className="w-6 h-6 text-[#138A36]" />
            <h4 className="font-bold text-xs text-[#111111]">🔒 Safe & Secure</h4>
            <p className="text-[11px] text-[#666666]">In-app private communication & reservation</p>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-2xl w-full">
            <img src={selectedPhoto} alt="Preview" className="w-full h-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Share & QR Code Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-gray-200 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center mx-auto text-xl shadow-xs">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900">{shop.name}</h3>
              <p className="text-xs text-gray-500">Share Store & Scan Inventory QR</p>
            </div>

            {/* Crisp client-side vector SVG QR Code */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 inline-block shadow-xs">
              <QRCodeSVG
                value={shopUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#111111"
                level="H"
                includeMargin={false}
                className="w-44 h-44 rounded-xl mx-auto"
              />
            </div>

            <p className="text-xs text-gray-600">
              Scan with any phone camera to view {shop.name}'s real store inventory and enquire directly.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Store Web Link'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out ${shop.name} on GrowLocal: ${shopUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-[#138A36] hover:bg-[#0F752C] text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
