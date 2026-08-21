import React, { useState } from 'react';
import { ArrowLeft, SlidersHorizontal, MapPin, Clock, MessageSquare, Check, Sparkles } from 'lucide-react';
import VerifiedBadge from '../components/VerifiedBadge';
import Rating from '../components/Rating';

export default function CustomerSearchResults({ 
  searchQuery, 
  shops, 
  products, 
  onBack, 
  onSelectShop, 
  onSelectProduct,
  onOpenChat 
}) {
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterRating, setFilterRating] = useState(false);
  const [sortBy, setSortBy] = useState("distance");

  const matchingProducts = products.filter(p => 
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let filteredShops = shops.filter(shop => {
    if (filterOpenNow && shop.status !== "Open") return false;
    if (filterRating && shop.rating < 4.5) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header with Back */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 bg-white border border-[#E5E7E5] rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#111111]" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-[#111111] font-poppins">Search Results</h1>
          <p className="text-xs text-[#666666]">{filteredShops.length} verified shops found near you</p>
        </div>
      </div>

      {/* Query Display Card */}
      <div className="bg-[#EAF7EE] border border-[#DDF3E3] p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#138A36] text-white rounded-xl flex items-center justify-center font-bold">
            🌱
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#138A36] uppercase tracking-wider">Searching For</span>
            <h2 className="text-lg font-extrabold text-[#111111]">{searchQuery || "All Nearby Local Products"}</h2>
          </div>
        </div>
        <span className="bg-white text-[#138A36] text-xs font-bold px-3 py-1.5 rounded-full shadow-xs border border-[#DDF3E3]">
          In Stock Nearby
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button 
          onClick={() => setSortBy(sortBy === "distance" ? "rating" : "distance")}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
            sortBy === "distance" ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-[#111111] border-[#E5E7E5]"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Sort: {sortBy === "distance" ? "Nearest First" : "Top Rated"}</span>
        </button>

        <button 
          onClick={() => setFilterOpenNow(!filterOpenNow)}
          className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
            filterOpenNow ? "bg-[#138A36] text-white border-[#138A36]" : "bg-white text-[#111111] border-[#E5E7E5]"
          }`}
        >
          Open Now
        </button>

        <button 
          onClick={() => setFilterRating(!filterRating)}
          className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
            filterRating ? "bg-[#138A36] text-white border-[#138A36]" : "bg-white text-[#111111] border-[#E5E7E5]"
          }`}
        >
          Rating 4.5+
        </button>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs font-bold text-[#666666]">
        <span>{filteredShops.length} Shops found in Butibori, Nagpur</span>
      </div>

      {/* Shop Results Cards */}
      <div className="space-y-4">
        {filteredShops.map((shop) => {
          const shopProduct = matchingProducts.find(p => p.shopId === shop.id) || products[0];

          return (
            <div 
              key={shop.id}
              onClick={() => onSelectShop(shop.id)}
              className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden card-shadow-hover cursor-pointer p-4 md:p-5 flex flex-col md:flex-row gap-5"
            >
              {/* Shop Cover Image */}
              <div className="relative w-full md:w-56 h-48 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#EAF7EE] text-[#138A36] font-bold text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#138A36]"></span>
                  <span>{shop.status}</span>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#111111] font-bold text-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#138A36]" />
                  <span>{shop.distance}</span>
                </div>
              </div>

              {/* Details Content */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[#111111] hover:text-[#138A36] transition-colors">
                      {shop.name}
                    </h3>
                    {shop.verified && <VerifiedBadge />}
                  </div>

                  <p className="text-xs font-medium text-[#666666] mb-2">{shop.category}</p>

                  <div className="flex items-center gap-4 text-xs text-[#666666] mb-3">
                    <Rating rating={shop.rating} count={shop.reviewsCount} />
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#138A36]" />
                      <span>{shop.closingTime}</span>
                    </span>
                  </div>

                  {/* Product Match Highlights */}
                  {shopProduct && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(shopProduct.id);
                      }}
                      className="bg-[#F7F8F7] hover:bg-[#EAF7EE] p-3 rounded-xl border border-[#E5E7E5] flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={shopProduct.images[0]} alt={shopProduct.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-bold text-[#111111]">{shopProduct.name}</p>
                          <p className="text-[11px] text-[#138A36] font-semibold">₹{shopProduct.price} · Sizes: {shopProduct.sizes.join(', ')}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#138A36] bg-white px-2.5 py-1 rounded-lg border border-[#DDF3E3]">
                        Available Now
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-[#E5E7E5]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChat(shop);
                    }}
                    className="flex-1 bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message Shop</span>
                  </button>

                  <button
                    onClick={() => onSelectShop(shop.id)}
                    className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-colors"
                  >
                    View Shop Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
