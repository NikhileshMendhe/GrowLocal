import React from 'react';
import { Link } from 'react-router-dom';
import { Rating } from '@growlocal/ui';
import { formatMoney, initials } from '../lib/format';

export default function ProductCard({ product }) {
  const outOfStock = product.availability_status === 'Out of Stock';
  return (
    <Link
      to={`/products/${product.id}`}
      className="group cursor-pointer block bg-white border border-[#E5E7E5] rounded-2xl overflow-hidden card-shadow card-shadow-hover"
    >
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-[#DDF3E3] via-[#EAF7EE] to-[#F7F8F7] flex items-center justify-center">
          <span className="text-3xl font-bold text-brand/40 select-none">
            {initials(product.name)}
          </span>
        </div>
        {product.discount_percentage > 0 ? (
          <span className="absolute top-2 left-2 text-xs font-bold text-white bg-brand px-2 py-0.5 rounded-md">
            {product.discount_percentage}% OFF
          </span>
        ) : null}
        {outOfStock ? (
          <span className="absolute bottom-2 right-2 text-xs font-semibold text-[#666666] bg-white/90 border border-[#E5E7E5] px-2 py-0.5 rounded-md">
            Out of Stock
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-[#111111] truncate group-hover:text-brand">
          {product.name}
        </p>
        <p className="text-xs text-[#666666] truncate">{product.shop_name || product.category_name}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-[#111111]">{formatMoney(product.price)}</span>
            {product.original_price && Number(product.original_price) > Number(product.price) ? (
              <span className="text-xs text-[#666666] line-through">
                {formatMoney(product.original_price)}
              </span>
            ) : null}
          </div>
          {product.category_name ? (
            <span className="text-xs text-brand bg-brand-light px-2 py-0.5 rounded-md truncate max-w-[7rem]">
              {product.category_name}
            </span>
          ) : null}
        </div>
        {product.shop_name ? (
          <div className="mt-2">
            <Rating rating={product.shop_rating ?? 5} count={0} showCount={false} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
