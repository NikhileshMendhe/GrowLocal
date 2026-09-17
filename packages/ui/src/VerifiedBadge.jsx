import React from 'react';

export default function VerifiedBadge({ text = 'Verified Shop', size = 'normal' }) {
  const isSmall = size === 'small';
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#EAF7EE] text-[#138A36] ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <svg
        className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-[#138A36] text-white`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <span>{text}</span>
    </span>
  );
}
