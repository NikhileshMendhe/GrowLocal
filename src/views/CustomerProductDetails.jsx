import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Bookmark, MapPin, CheckCircle2, ShieldCheck, ShoppingBag, Share2, Tag, Zap } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';

export default function CustomerProductDetails({ 
  product, 
  onBack, 
  onOpenChat, 
  onReserveProduct, 
  onBuyNow,
  onShowToast 
}) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes[1] || product?.sizes[0] || "L");
  const [selectedImage, setSelectedImage] = useState(product?.images[0] || "");

  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-[#666666] hover:text-[#111111]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to results</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border border-[#E5E7E5] card-shadow">
        {/* Left: Product Images */}
        <div className="space-y-4">
          <div className="relative h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-gray-100 border border-[#E5E7E5]">
            <img src={selectedImage || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 bg-[#138A36] text-white text-xs font-bold px-3 py-1 rounded-full">
              {product.availability}
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === imgUrl ? "border-[#138A36]" : "border-[#E5E7E5] opacity-70"
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Shop Header Pill */}
            <div className="bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#111111]">{product.shopName}</span>
                {product.shopVerified && <VerifiedBadge size="small" />}
              </div>
              <span className="text-xs text-[#138A36] font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{product.shopDistance}</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#111111]">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-base text-[#666666] line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
              {product.originalPrice && (
                <span className="text-xs font-bold text-[#138A36] bg-[#EAF7EE] px-2.5 py-1 rounded-full">
                  Save ₹{product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-2 uppercase">Select Size / Option</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === s
                        ? "bg-[#138A36] text-white border-[#138A36] shadow-xs"
                        : "bg-white text-[#111111] border-[#E5E7E5] hover:border-gray-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-[#666666] leading-relaxed">
              {product.description}
            </p>

            <div className="bg-[#EAF7EE] p-3 rounded-xl border border-[#DDF3E3] text-xs font-medium text-[#138A36] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Available right now in Nagpur store inventory. You can reserve for pickup.</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-4 border-t border-[#E5E7E5]">
            <button
              onClick={() => onBuyNow ? onBuyNow(product, selectedSize) : onReserveProduct(product, selectedSize)}
              className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-black text-sm py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>⚡ Buy Now (Instant Checkout)</span>
            </button>

            <button
              onClick={() => onReserveProduct(product, selectedSize)}
              className="w-full bg-white hover:bg-gray-50 text-[#111111] border-2 border-[#138A36] font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#138A36]" />
              <span>Reserve & Visit Store</span>
            </button>

            <button
              onClick={() => onOpenChat(product)}
              className="w-full bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask About Availability & Negotiate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
