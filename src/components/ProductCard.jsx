import React from 'react';
import VerifiedBadge from './VerifiedBadge';
import { MessageSquare, Zap } from 'lucide-react';

export default function ProductCard({ product = {}, onClick, onAskAvailability, onBuyNow }) {
  const imageUrl = product.images?.[0] || product.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
  const sizes = Array.isArray(product.sizes) ? product.sizes : ["Standard"];
  const price = typeof product.price === 'number' ? product.price : (Number(product.price) || 0);
  const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice : Number(product.originalPrice)) : null;

  return (
    <div 
      onClick={() => onClick && onClick(product.id)}
      className="bg-white rounded-2xl border border-[#E5E7E5] overflow-hidden card-shadow-hover cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Product Image */}
        <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={product.name || "Product"} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {originalPrice && originalPrice > price && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-[#138A36]">
            {product.availability || "In Stock"}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#666666]">
            <span className="font-semibold text-[#111111] truncate">{product.shopName || "Local Shop"}</span>
            {(product.shopVerified || product.verified) && <VerifiedBadge size="small" text="Verified" />}
          </div>

          <h4 className="font-bold text-sm text-[#111111] group-hover:text-[#138A36] transition-colors line-clamp-1 mb-1">
            {product.name || "Product"}
          </h4>

          {/* Sizes */}
          <div className="flex items-center gap-1 my-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-[#666666]">Sizes:</span>
            {sizes.slice(0, 4).map((s, idx) => (
              <span key={idx} className="text-[10px] bg-gray-100 text-[#111111] px-1.5 py-0.2 rounded font-medium">
                {s}
              </span>
            ))}
            {sizes.length > 4 && (
              <span className="text-[10px] text-[#666666]">+{sizes.length - 4}</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-bold text-[#111111]">₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-[#666666] line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="p-3 pt-0 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow ? onBuyNow(product) : (onClick && onClick(product.id));
            }}
            className="w-full bg-[#138A36] hover:bg-[#0B6B2B] text-white font-black text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
            title="Instant Buy Now"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
            <span>Buy Now</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskAvailability ? onAskAvailability(product) : (onClick && onClick(product.id));
            }}
            className="w-full bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] font-extrabold text-[11px] py-2 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
            title="Ask Availability"
          >
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span className="truncate">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
