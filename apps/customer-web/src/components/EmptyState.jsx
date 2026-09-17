import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white border border-[#E5E7E5] rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-brand" />
      </div>
      <h3 className="font-semibold text-[#111111]">{title}</h3>
      {subtitle ? <p className="text-sm text-[#666666] mt-1 max-w-sm">{subtitle}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
