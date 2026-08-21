import React, { useState } from 'react';
import { Search, Camera, MapPin, Clock, Flame, ChevronRight, Sparkles } from 'lucide-react';

export default function CustomerSearch({ 
  onSearch, 
  onOpenPhotoSearch, 
  onOpenLocationModal, 
  currentLocation 
}) {
  const [query, setQuery] = useState("");

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
    "Cotton kurtis",
    "Leather belt",
    "Smartwatch"
  ];

  const handleExecuteSearch = (searchTerm) => {
    if (searchTerm) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">Search Local</h1>
          <p className="text-xs text-[#666666]">Discover products available in nearby Nagpur shops</p>
        </div>
        <button
          onClick={onOpenLocationModal}
          className="bg-[#EAF7EE] text-[#138A36] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{currentLocation.area} ({currentLocation.radius})</span>
        </button>
      </div>

      {/* Main Search Bar */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch(query);
          }}
          className="relative flex items-center bg-white border-2 border-[#138A36] rounded-2xl p-2 shadow-md"
        >
          <Search className="w-5 h-5 text-[#138A36] ml-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="What are you looking for? (e.g. Black oversized T-shirt)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm text-[#111111] focus:outline-none placeholder-[#666666]"
          />
          <button
            type="submit"
            className="bg-[#138A36] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#0F752C] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Photo Search Banner Option */}
        <button
          onClick={onOpenPhotoSearch}
          className="w-full bg-[#EAF7EE] hover:bg-[#DDF3E3] border border-[#DDF3E3] p-3.5 rounded-2xl flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#138A36] text-white rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111111]">Have a photo of the product?</p>
              <p className="text-[11px] text-[#666666]">Upload image to match with local Nagpur shop inventories</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#138A36]" />
        </button>
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
              className="bg-white hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] border border-[#E5E7E5] text-xs font-medium px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
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
              className="bg-white hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] border border-[#E5E7E5] text-xs font-medium px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
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
