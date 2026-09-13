import React, { useState } from 'react';
import { Search, MapPin, Clock, Flame, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import AdvanceSearchBar from '../components/AdvanceSearchBar';

export default function CustomerSearch({ 
  onSearch, 
  onOpenLocationModal, 
  currentLocation,
  products = [],
  categories = [],
  onSelectProduct,
  onBuyNow
}) {
  const RECENT_SEARCHES = [
    "Black oversized T-shirt",
    "Casual sneakers UK 9",
    "Formal slim fit chinos",
    "Wireless noise cancelling headphones"
  ];

  const POPULAR_SEARCHES = [
    "Resort printed shirt",
    "Rayban sunglasses",
    "Running shoes",
    "Denim jackets",
    "Cotton kurtas",
    "Leather formal shoes",
    "Smartwatches"
  ];

  const handleExecuteSearch = (query) => {
    if (onSearch) onSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Location Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111111] font-poppins">Discover Nagpur Retail</h1>
          <p className="text-xs text-[#666666]">Search live products and verified local shops near you</p>
        </div>

        <button
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 bg-[#EAF7EE] text-[#138A36] px-3 py-1.5 rounded-full text-xs font-bold border border-[#DDF3E3] cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{currentLocation.area} ({currentLocation.radius})</span>
        </button>
      </div>

      {/* Main Advance Search Bar */}
      <div className="space-y-3">
        <AdvanceSearchBar
          onSearch={handleExecuteSearch}
          onSelectProduct={onSelectProduct}
          onBuyNow={onBuyNow}
          products={products}
          categories={categories}
          placeholder="What are you looking for? (e.g. shirt, sneakers, headphones...)"
          autoFocus={true}
          size="large"
        />
      </div>

      {/* Recent Searches */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#666666] uppercase">
          <Clock className="w-4 h-4 text-[#138A36]" />
          <span>Recent Searches</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {RECENT_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => handleExecuteSearch(term)}
              className="bg-white hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] border border-[#E5E7E5] text-xs font-medium px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{term}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Searches */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#666666] uppercase">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Popular in Nagpur</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              onClick={() => handleExecuteSearch(term)}
              className="bg-white hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] border border-[#E5E7E5] text-xs font-medium px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#138A36]" />
              <span>{term}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
