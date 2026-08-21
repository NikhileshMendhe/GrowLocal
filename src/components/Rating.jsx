import React from 'react';
import { Star } from 'lucide-react';

export default function Rating({ rating, count, showCount = true }) {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-flex items-center gap-1 font-semibold text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
        <span>{rating}</span>
      </span>
      {showCount && count && (
        <span className="text-xs text-[#666666]">({count})</span>
      )}
    </div>
  );
}
