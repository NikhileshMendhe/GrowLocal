import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function VerifiedBadge({ text = "Verified Shop", size = "normal" }) {
  const isSmall = size === "small";
  
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#EAF7EE] text-[#138A36] ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
      <CheckCircle2 className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-[#138A36] text-white`} />
      <span>{text}</span>
    </span>
  );
}
