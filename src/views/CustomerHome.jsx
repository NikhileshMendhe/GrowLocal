import React from 'react';
import { 
  Search, Camera, Mic, ArrowRight, ShieldCheck, MessageSquare, 
  MapPin, Heart, Sparkles, ChevronRight, Shirt, Footprints, Glasses, 
  Watch, Smartphone, ShoppingBag, Home as HomeIcon, Dumbbell, Gem, Store 
} from 'lucide-react';
import ShopCard from '../components/ShopCard';
import ProductCard from '../components/ProductCard';

export default function CustomerHome({ 
  shops, 
  products, 
  categories, 
  onSelectShop, 
  onSelectProduct, 
  onSearch, 
  onOpenPhotoSearch, 
  onOpenDemandRequest, 
  onOpenLocationModal,
  currentLocation 
}) {
  const iconMap = {
    Shirt: Shirt,
    Footprints: Footprints,
    Glasses: Glasses,
    Watch: Watch,
    Smartphone: Smartphone,
    Sparkles: Sparkles,
    ShoppingBag: ShoppingBag,
    Home: HomeIcon,
    Dumbbell: Dumbbell,
    Gem: Gem
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Hero & Search Section */}
      <section className="bg-white border-b border-[#E5E7E5] py-8 px-4 rounded-b-3xl shadow-xs">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Greeting */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight">
                  Hello, Ananya 👋
                </h1>
              </div>
              <p className="text-[#666666] text-sm font-medium mt-1">
                Find it nearby. Buy local.
              </p>
            </div>

            {/* Location Pill */}
            <button
              onClick={onOpenLocationModal}
              className="bg-[#EAF7EE] border border-[#DDF3E3] text-[#138A36] font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-[#DDF3E3] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentLocation.area}</span>
            </button>
          </div>

          {/* Large Search Bar */}
          <div className="relative">
            <div className="relative flex items-center bg-[#F7F8F7] border-2 border-[#E5E7E5] focus-within:border-[#138A36] focus-within:bg-white rounded-2xl p-2 transition-all shadow-xs">
              <Search className="w-5 h-5 text-[#666666] ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search for products, brands or local shops in Nagpur..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    onSearch(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-transparent text-sm md:text-base text-[#111111] focus:outline-none placeholder-[#666666]"
              />
              <div className="flex items-center gap-2 pr-2">
                <button
                  onClick={onOpenPhotoSearch}
                  className="p-2 text-[#138A36] hover:bg-[#EAF7EE] rounded-xl transition-colors"
                  title="Search by Photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onSearch("Black oversized T-shirt")}
                  className="p-2 text-[#666666] hover:text-[#111111] hover:bg-gray-200 rounded-xl transition-colors"
                  title="Voice Search"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search by Photo Promotional Card */}
          <div className="bg-gradient-to-r from-[#138A36] to-[#0B6B2B] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="z-10 space-y-2 max-w-md">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white">
                <Camera className="w-3.5 h-3.5" />
                <span>Visual AI Search</span>
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-poppins leading-tight">
                Can't find it? Search by photo
              </h2>
              <p className="text-xs md:text-sm text-[#DDF3E3]">
                Snap a photo, we'll scan local shops in Nagpur to find exact or similar availability instantly.
              </p>
              <button
                onClick={onOpenPhotoSearch}
                className="mt-3 bg-white text-[#138A36] hover:bg-[#EAF7EE] font-bold text-xs md:text-sm px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Search by Photo</span>
              </button>
            </div>

            {/* Visual product preview banner graphic */}
            <div className="relative z-10 w-full md:w-48 h-32 md:h-36 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl shrink-0">
              <img
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
                alt="Search by Photo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <span className="text-[10px] font-bold text-white bg-[#138A36] px-2 py-0.5 rounded">
                  Instant Shop Match
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* 2. Tell Shops What You Need (Demand Request Trigger Banner) */}
        <section className="bg-[#EAF7EE] border border-[#DDF3E3] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#138A36] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-[#111111]">
                Looking for something specific in Nagpur?
              </h3>
              <p className="text-xs md:text-sm text-[#666666]">
                Tell nearby shops what you need, size, and budget. Get instant availability responses!
              </p>
            </div>
          </div>
          <button
            onClick={onOpenDemandRequest}
            className="w-full md:w-auto bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
          >
            <span>Tell Shops What You Need</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* 3. Popular Categories */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-[#111111] font-poppins">
              Popular Categories
            </h2>
            <button 
              onClick={() => onSearch("")}
              className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => {
              const IconComponent = iconMap[cat.icon] || ShoppingBag;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSearch(cat.name)}
                  className="flex flex-col items-center gap-2 min-w-[90px] p-3.5 bg-white rounded-2xl border border-[#E5E7E5] hover:border-[#138A36] hover:bg-[#EAF7EE] transition-all card-shadow-hover group shrink-0"
                >
                  <div className="w-12 h-12 bg-[#F7F8F7] group-hover:bg-[#138A36] text-[#138A36] group-hover:text-white rounded-xl flex items-center justify-center transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#111111] group-hover:text-[#138A36] transition-colors">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Nearby Shops */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#111111] font-poppins">
                Nearby Shops
              </h2>
              <p className="text-xs text-[#666666]">Verified local merchants within {currentLocation.radius}</p>
            </div>
            <button
              onClick={() => onSearch("")}
              className="text-xs font-bold text-[#138A36] hover:underline flex items-center gap-1"
            >
              <span>Explore All ({shops.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} onClick={onSelectShop} />
            ))}
          </div>
        </section>

        {/* 5. Trending Local Products */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-[#111111] font-poppins">
              Trending Products Available Today
            </h2>
            <button 
              onClick={() => onSearch("")}
              className="text-xs font-bold text-[#138A36] hover:underline"
            >
              See All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                onClick={onSelectProduct}
                onAskAvailability={(p) => onSelectProduct(p.id)}
              />
            ))}
          </div>
        </section>

        {/* 6. Local Community Banner */}
        <section className="bg-gradient-to-r from-[#EAF7EE] via-[#DDF3E3] to-[#EAF7EE] border border-[#138A36]/30 rounded-3xl p-8 text-center space-y-3 relative overflow-hidden">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#138A36] uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-xs">
            🌱 Support Local Economy
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#111111] font-poppins">
            Support local. Strengthen your community.
          </h2>
          <p className="text-xs md:text-sm text-[#666666] max-w-xl mx-auto">
            Choose local shops in Nagpur, check real inventory availability before traveling, build a stronger neighborhood commerce network.
          </p>
        </section>

        {/* 7. Customer Value Section */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold text-[#111111] font-poppins text-center mb-6">
            Why Shop With GrowLocal?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#111111]">Verified Shops</h3>
              <p className="text-xs text-[#666666]">Trusted & background verified local businesses in Nagpur.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#111111]">In-App Communication</h3>
              <p className="text-xs text-[#666666]">Safe, secure & reliable direct chat with shop owners.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#111111]">Nearby & Easy</h3>
              <p className="text-xs text-[#666666]">Find. Connect. Shop Local within 1 to 10 km distance.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E7E5] space-y-2 card-shadow">
              <div className="w-10 h-10 bg-[#EAF7EE] text-[#138A36] rounded-xl flex items-center justify-center font-bold">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#111111]">Support Local</h3>
              <p className="text-xs text-[#666666]">Stronger Community, Better Tomorrow for offline retail.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
