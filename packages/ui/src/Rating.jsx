import React from 'react';

export default function Rating({ rating, count, showCount = true }) {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-flex items-center gap-1 font-semibold text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
        <svg className="w-3 h-3 fill-amber-500 text-amber-500" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span>{rating}</span>
      </span>
      {showCount && count ? <span className="text-xs text-[#666666]">({count})</span> : null}
    </div>
  );
}
