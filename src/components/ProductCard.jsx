import React from 'react';
import VerifiedBadge from './VerifiedBadge';
import { MessageSquare, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product, onClick, onAskAvailability }) {
  return (
    <div 
      onClick={() => onClick(product.id)}
      className="bg-white rounded-2xl border border-[#E5E7E5] overflow-hidden card-shadow-hover cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Product Image */}
        <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.originalPrice && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-[#138A36]">
            {product.availability}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#666666]">
            <span className="font-semibold text-[#111111] truncate">{product.shopName}</span>
            {product.shopVerified && <VerifiedBadge size="small" text="Verified" />}
          </div>

          <h4 className="font-bold text-sm text-[#111111] group-hover:text-[#138A36] transition-colors line-clamp-1 mb-1">
            {product.name}
          </h4>

          {/* Sizes */}
          <div className="flex items-center gap-1 my-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-[#666666]">Sizes:</span>
            {product.sizes.slice(0, 4).map((s) => (
              <span key={s} className="text-[10px] bg-gray-100 text-[#111111] px-1.5 py-0.2 rounded font-medium">
                {s}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-[10px] text-[#666666]">+{product.sizes.length - 4}</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-bold text-[#111111]">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-[#666666] line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="p-3.5 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAskAvailability ? onAskAvailability(product) : onClick(product.id);
          }}
          className="w-full bg-[#EAF7EE] hover:bg-[#138A36] text-[#138A36] hover:text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask About Availability</span>
        </button>
      </div>
    </div>
  );
}
