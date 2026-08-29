import React, { useState } from 'react';
import { 
  Grid, Store, MapPin, ChevronRight, Sparkles, ShoppingBag, 
  Tag, Compass, TrendingUp, ShieldCheck, ArrowRight, Search, Filter 
} from 'lucide-react';

export default function CustomerCategories({ 
  categories = [], 
  shops = [], 
  products = [], 
  onSelectCategory,
  onOpenDemandRequest,
  onOpenLocationModal,
  currentLocation
}) {
  const [selectedMainCat, setSelectedMainCat] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");

  const NAGPUR_CATEGORIES_DATA = [
    {
      id: "cat-1",
      name: "Clothing & Fashion",
      icon: "👗",
      badge: "Popular in Sitabuldi",
      color: "from-pink-500 to-rose-600",
      lightBg: "bg-pink-50 border-pink-200 text-pink-700",
      shopsCount: 18,
      productsCount: 145,
      subcategories: ["Men's Wear", "Women's Sarees", "Ethnic & Festive", "Kids Wear", "Custom Tailoring"],
      popularCluster: "Sitabuldi & Sadar, Nagpur",
      desc: "Top local boutiques, branded apparel & traditional Nagpur sarees"
    },
    {
      id: "cat-2",
      name: "Grocery & Daily Essentials",
      icon: "🛒",
      badge: "Express Same-Day Pickup",
      color: "from-emerald-500 to-teal-600",
      lightBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      shopsCount: 24,
      productsCount: 310,
      subcategories: ["Organic Grains", "Daily Spices", "Fresh Produce", "Dry Fruits", "Packaged Snacks"],
      popularCluster: "Itwari Wholesale & Khamla",
      desc: "Fresh daily provisions, organic pulses & authentic Vidarbha spices"
    },
    {
      id: "cat-3",
      name: "Electronics & Accessories",
      icon: "⚡",
      badge: "Verified Warranty Shops",
      color: "from-blue-500 to-indigo-600",
      lightBg: "bg-blue-50 border-blue-200 text-blue-700",
      shopsCount: 15,
      productsCount: 98,
      subcategories: ["Smartphones", "Laptops & IT", "Noise Cancelling Audio", "Smartwatches", "Home Appliances"],
      popularCluster: "Dharampeth & Wardha Road",
      desc: "Local authorized dealers for smartphones, accessories & gadgets"
    },
    {
      id: "cat-4",
      name: "Footwear & Leather Goods",
      icon: "👟",
      badge: "Top Rated",
      color: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-50 border-amber-200 text-amber-700",
      shopsCount: 12,
      productsCount: 84,
      subcategories: ["Sports Sneakers", "Formal Shoes", "Ethnic Mojaris", "Ladies Heels", "Leather Belts & Bags"],
      popularCluster: "Sitabuldi Market, Nagpur",
      desc: "Quality leather footwear, sports shoes & handcrafted accessories"
    },
    {
      id: "cat-5",
      name: "Beauty & Cosmetics",
      icon: "💄",
      badge: "100% Genuine Brands",
      color: "from-purple-500 to-fuchsia-600",
      lightBg: "bg-purple-50 border-purple-200 text-purple-700",
      shopsCount: 10,
      productsCount: 76,
      subcategories: ["Skincare Essentials", "Haircare Oils", "Makeup & Palettes", "Perfumes & Deos", "Herbal Wellness"],
      popularCluster: "Civil Lines & Dharampeth",
      desc: "Genuine beauty products, organic skincare & local salon supplies"
    },
    {
      id: "cat-6",
      name: "Food, Sweets & Nagpur Oranges",
      icon: "🍊",
      badge: "Famous Local Delicacies",
      color: "from-orange-500 to-amber-600",
      lightBg: "bg-orange-50 border-orange-200 text-orange-700",
      shopsCount: 20,
      productsCount: 120,
      subcategories: ["Famous Orange Barfi", "Saoji Spices", "Bakery & Cakes", "Dry Sweets", "Snack Namkeen"],
      popularCluster: "Itwari & Main Highway Outlets",
      desc: "Nagpur special Saoji masalas, fresh bakery goods & famous orange sweets"
    },
    {
      id: "cat-7",
      name: "Jewelry & Luxury Watches",
      icon: "💎",
      badge: "BIS Hallmarked Gold",
      color: "from-yellow-500 to-amber-700",
      lightBg: "bg-yellow-50 border-yellow-200 text-yellow-700",
      shopsCount: 9,
      productsCount: 65,
      subcategories: ["916 Gold Jewelry", "Silver Articles", "Diamond Rings", "Fashion Jewelry", "Luxury Watches"],
      popularCluster: "Itwari & Sarafa Bazaar",
      desc: "Trusted Nagpur jewelers with certified hallmark gold & silver"
    },
    {
      id: "cat-8",
      name: "Home, Furniture & Decor",
      icon: "🏡",
      badge: "Custom Orders",
      color: "from-cyan-500 to-blue-600",
      lightBg: "bg-cyan-50 border-cyan-200 text-cyan-700",
      shopsCount: 14,
      productsCount: 110,
      subcategories: ["Wooden Furniture", "Bedding & Curtains", "Kitchenware", "Wall Decor & Lights", "Paints & Hardware"],
      popularCluster: "Sadar & Central Avenue",
      desc: "Local furniture artisans, modern curtains & home decoration items"
    }
  ];

  const mainCatFilterPills = ["All", "Clothing & Fashion", "Grocery & Daily Essentials", "Electronics & Accessories", "Footwear & Leather Goods", "Food, Sweets & Nagpur Oranges"];

  const filteredCategories = NAGPUR_CATEGORIES_DATA.filter(cat => {
    const matchesMain = selectedMainCat === "All" || cat.name === selectedMainCat;
    const matchesSearch = !searchFilter || 
      cat.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
      cat.subcategories.some(sub => sub.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesMain && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-200">
      
      {/* HERO BANNER SECTION */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#111111] via-[#0B6B2B] to-[#138A36] p-6 md:p-10 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-[#DDF3E3]">
            <Compass className="w-3.5 h-3.5 text-[#138A36] animate-pulse" />
            <span>Nagpur Local Commerce Taxonomy</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-poppins tracking-tight leading-tight">
            Explore <span className="text-emerald-400">Categories</span> in Nagpur
          </h1>

          <p className="text-xs md:text-sm text-gray-200 font-medium leading-relaxed">
            Browse verified local shops and authentic inventories organized by categories across Sitabuldi, Sadar, Dharampeth, and Itwari markets.
          </p>

          {/* Quick Category Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search category or subcategory (e.g. Sarees, Audio, Spices...)"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-white/90 backdrop-blur-md text-[#111111] pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:bg-white placeholder-gray-500 shadow-md"
              />
            </div>
            
            <button
              onClick={onOpenLocationModal}
              className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{currentLocation.area} ({currentLocation.radius})</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER PILLS BAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#138A36]" />
            <span>Browse All Categories ({filteredCategories.length})</span>
          </h2>

          <button
            onClick={onOpenDemandRequest}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#138A36] bg-[#EAF7EE] hover:bg-[#DDF3E3] border border-[#DDF3E3] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Can't find a category? Broadcast Request</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs font-semibold">
          {mainCatFilterPills.map(pill => (
            <button
              key={pill}
              onClick={() => setSelectedMainCat(pill)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedMainCat === pill 
                  ? "bg-[#138A36] text-white shadow-md font-bold scale-102" 
                  : "bg-white hover:bg-gray-100 text-[#666666] border border-[#E5E7E5]"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map(cat => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-[#E5E7E5] p-6 shadow-sm hover:shadow-xl hover:border-[#138A36]/40 transition-all duration-200 space-y-4 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Category Icon Header */}
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-108 transition-transform`}>
                  {cat.icon}
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${cat.lightBg}`}>
                  {cat.badge}
                </span>
              </div>

              {/* Title & Stats */}
              <div>
                <h3 className="text-lg font-extrabold text-[#111111] font-poppins group-hover:text-[#138A36] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#666666] mt-1 line-clamp-2">
                  {cat.desc}
                </p>
              </div>

              {/* Micro Metrics */}
              <div className="flex items-center gap-4 text-xs font-semibold text-[#666666] pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-[#138A36]" />
                  <span>{cat.shopsCount} Shops</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#138A36]" />
                  <span>{cat.productsCount}+ Products</span>
                </div>
              </div>

              {/* Subcategories Chips */}
              <div className="pt-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Subcategories</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.map(sub => (
                    <button
                      key={sub}
                      onClick={() => onSelectCategory(sub)}
                      className="bg-[#F7F8F7] hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#E5E7E5] hover:border-[#DDF3E3] transition-colors cursor-pointer"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => onSelectCategory(cat.name)}
                className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
              >
                <span>Explore {cat.name}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DEMAND REQUEST CTA CARD */}
      <div className="bg-gradient-to-r from-[#EAF7EE] via-[#DDF3E3] to-[#EAF7EE] rounded-3xl p-6 md:p-8 border border-[#138A36]/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-[#138A36] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>GrowLocal Broadcast Engine</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-[#111111] font-poppins">
            Couldn't find the category or item you're looking for?
          </h3>
          <p className="text-xs text-[#666666] max-w-xl font-medium">
            Post a free demand request and let verified Nagpur local shop owners contact you directly with availability, pricing, and photos.
          </p>
        </div>

        <button
          onClick={onOpenDemandRequest}
          className="bg-[#138A36] hover:bg-[#0F752C] text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-103 shrink-0 cursor-pointer"
        >
          Tell Shops What You Need
        </button>
      </div>

    </div>
  );
}
