import React from 'react';
import { Link } from 'react-router-dom';
import { Rating, VerifiedBadge } from '@growlocal/ui';
import { MapPin } from 'lucide-react';
import { initials } from '../lib/format';

export default function ShopCard({ shop }) {
  return (
    <Link
      to={`/shops/${shop.id}`}
      className="group cursor-pointer block bg-white border border-[#E5E7E5] rounded-2xl overflow-hidden card-shadow card-shadow-hover"
    >
      <div className="h-24 bg-gradient-to-br from-[#138A36] via-[#159947] to-[#0B6B2B] relative">
        {shop.logo_url ? (
          <img
            src={shop.logo_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white/80 select-none">
            {initials(shop.name)}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#111111] truncate group-hover:text-brand flex-1">
            {shop.name}
          </p>
          {shop.is_verified ? <VerifiedBadge size="small" /> : null}
        </div>
        <p className="text-xs text-[#666666] truncate mt-1">{shop.description || shop.category_name}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="inline-flex items-center gap-1 text-xs text-[#666666]">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            {shop.city}
          </span>
          <Rating rating={shop.rating ?? 5} count={shop.review_count} />
        </div>
      </div>
    </Link>
  );
}
