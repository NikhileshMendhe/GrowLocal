import React from 'react';
import ShopCard from '../components/ShopCard';
import { Bookmark, ArrowRight } from 'lucide-react';

export default function CustomerSavedShops({ shops, savedShopIds, onSelectShop, onRemoveSaved, onOpenSearch }) {
  const savedShops = shops.filter(s => savedShopIds.includes(s.id));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">Saved Shops</h1>
          <p className="text-xs text-[#666666]">{savedShops.length} bookmarked local merchants in Nagpur</p>
        </div>
      </div>

      {savedShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedShops.map((shop) => (
            <div key={shop.id} className="relative">
              <ShopCard shop={shop} onClick={onSelectShop} />
              <button
                onClick={() => onRemoveSaved(shop.id)}
                className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md z-20 hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7E5] rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-[#EAF7EE] text-[#138A36] rounded-full flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">No Saved Shops Yet</h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto">
            Bookmark your favorite nearby local shops in Nagpur to easily check inventory and enquire.
          </p>
          <button
            onClick={onOpenSearch}
            className="bg-[#138A36] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#0F752C] transition-colors inline-flex items-center gap-2"
          >
            <span>Discover Nearby Shops</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
