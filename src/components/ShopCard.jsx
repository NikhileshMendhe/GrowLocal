import React from 'react';
import VerifiedBadge from './VerifiedBadge';
import Rating from './Rating';
import { MapPin, Clock, MessageSquare } from 'lucide-react';

export default function ShopCard({ shop = {}, onClick, onMessageClick }) {
  const coverImage = shop.coverImage || shop.cover_image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80";
  const logoImage = shop.logoImage || shop.logo_url || coverImage;
  const isVerified = Boolean(shop.verified || shop.is_verified);

  return (
    <div 
      onClick={() => onClick && onClick(shop.id)}
      className="bg-white rounded-2xl border border-[#E5E7E5] overflow-hidden card-shadow-hover cursor-pointer group flex flex-col h-full"
    >
      {/* Cover & Thumbnail header */}
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        <img 
          src={coverImage} 
          alt={shop.name || "Shop"} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Distance Pill */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-[#111111] shadow-xs flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#138A36]" />
          <span>{shop.distance || "1.2 km away"}</span>
        </div>

        {/* Status Pill */}
        <div className="absolute top-3 left-3 bg-[#EAF7EE] text-[#138A36] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#138A36] animate-pulse"></span>
          <span>{shop.status || "Open"}</span>
        </div>

        {/* Shop Logo Avatar */}
        <div className="absolute -bottom-4 left-4 w-12 h-12 rounded-xl border-2 border-white overflow-hidden shadow-md bg-white">
          <img src={logoImage} alt={shop.name || "Logo"} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 pt-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-base text-[#111111] group-hover:text-[#138A36] transition-colors truncate">
              {shop.name || "Local Shop"}
            </h3>
            {isVerified && <VerifiedBadge size="small" />}
          </div>

          <p className="text-xs text-[#666666] mb-2">{shop.category || "Local Merchant"}</p>

          <div className="flex items-center justify-between text-xs text-[#666666] mb-3">
            <Rating rating={shop.rating || 4.8} count={shop.reviewsCount || 12} />
            <span className="flex items-center gap-1 text-[11px] text-[#666666]">
              <Clock className="w-3 h-3 text-[#138A36]" />
              <span>{shop.closingTime || "Closes 9 PM"}</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-[#E5E7E5] flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMessageClick ? onMessageClick(shop) : (onClick && onClick(shop.id));
            }}
            className="flex-1 bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Shop</span>
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(shop.id);
            }}
            className="bg-[#138A36] hover:bg-[#0F752C] text-white font-semibold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer"
          >
            View Shop
          </button>
        </div>
      </div>
    </div>
  );
}
