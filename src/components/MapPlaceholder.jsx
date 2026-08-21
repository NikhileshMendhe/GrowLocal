import React from 'react';
import { MapPin, Navigation, Compass, ExternalLink } from 'lucide-react';

export default function MapPlaceholder({ shopName, address, distance = "1.2 km away" }) {
  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-[#E5E7E5] bg-[#E8F0E6]">
      {/* Map visual background graphics */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#138A36_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Simulated map roads and blocks */}
      <svg className="absolute inset-0 w-full h-full opacity-30 stroke-[#138A36] fill-none" strokeWidth="3">
        <path d="M -50 80 Q 200 40 400 120 T 800 90" strokeWidth="6" stroke="#ffffff" />
        <path d="M -50 80 Q 200 40 400 120 T 800 90" strokeWidth="3" stroke="#138A36" />
        <path d="M 120 -20 L 180 300" strokeWidth="5" stroke="#ffffff" />
        <path d="M 120 -20 L 180 300" strokeWidth="2" stroke="#138A36" />
        <path d="M 280 10 L 320 280" strokeDasharray="6,6" />
      </svg>

      {/* Simulated shop pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="bg-[#138A36] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 mb-1 animate-bounce">
          <MapPin className="w-3.5 h-3.5 fill-white text-[#138A36]" />
          <span>{shopName}</span>
        </div>
        <div className="w-4 h-4 bg-[#138A36] rounded-full border-2 border-white shadow-md"></div>
        <div className="w-8 h-2 bg-black/20 rounded-full blur-xs mt-0.5"></div>
      </div>

      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E5E7E5] text-xs font-medium flex items-center gap-2 text-[#111111] shadow-xs">
        <Compass className="w-4 h-4 text-[#138A36]" />
        <span>Nagpur Map Area</span>
        <span className="bg-[#EAF7EE] text-[#138A36] font-semibold px-2 py-0.5 rounded-full">{distance}</span>
      </div>

      {/* Map Bottom Card & Directions Action */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#E5E7E5] shadow-md flex items-center justify-between">
        <div className="max-w-[70%]">
          <p className="text-xs font-semibold text-[#111111] truncate">{shopName}</p>
          <p className="text-[11px] text-[#666666] truncate">{address}</p>
        </div>
        <a 
          href={`https://maps.google.com/?q=${encodeURIComponent(address || shopName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#138A36] hover:bg-[#0F752C] text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          <span>Get Directions</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
        </a>
      </div>
    </div>
  );
}
