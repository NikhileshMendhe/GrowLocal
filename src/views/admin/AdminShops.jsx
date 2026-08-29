import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Filter, ShieldCheck, Star, Eye, Edit3, 
  Trash2, Sparkles, CheckCircle2, AlertTriangle, X, Calendar, Plus 
} from 'lucide-react';

export default function AdminShops({
  shops,
  featuredShops,
  onToggleFeatureShop,
  onToggleShopStatus,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState("allShops"); // 'allShops' or 'featuredShops'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);

  const filteredShops = shops.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* NAVIGATION TABS */}
      <div className="flex items-center justify-between bg-white border border-[#E5E7E5] rounded-3xl p-2 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("allShops")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "allShops" ? "bg-[#138A36] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Registered Shops ({shops.length})
          </button>
          <button
            onClick={() => setActiveTab("featuredShops")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "featuredShops" ? "bg-[#138A36] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Shops Manager ({featuredShops.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "allShops" && (
        <div className="space-y-6">
          {/* SEARCH BAR */}
          <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shop by name, category, or address..."
                className="w-full pl-10 pr-4 py-2 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
              />
            </div>
          </div>

          {/* SHOPS TABLE */}
          <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                    <th className="py-3.5 px-4">Shop</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Rating</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4">Open/Closed</th>
                    <th className="py-3.5 px-4">Featured</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7E5]">
                  {filteredShops.map((shop) => {
                    const isFeatured = featuredShops.some(fs => fs.shopId === shop.id);
                    return (
                      <tr key={shop.id} className="hover:bg-[#F7F8F7] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#111111]">
                          <div className="flex items-center gap-3">
                            <img src={shop.logoImage} alt={shop.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-gray-200" />
                            <div>
                              <p className="font-bold text-sm text-[#111111] hover:text-[#138A36] cursor-pointer" onClick={() => setSelectedShop(shop)}>{shop.name}</p>
                              <p className="text-[10px] text-gray-400">{shop.openDays}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 font-medium">{shop.category}</td>
                        <td className="py-3.5 px-4 text-gray-600 truncate max-w-xs">{shop.address}</td>
                        <td className="py-3.5 px-4 font-bold text-[#111111]">
                          <span className="flex items-center gap-1 text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {shop.rating} ({shop.reviewsCount})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-emerald-100 text-[#138A36] text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            shop.status === "Open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {shop.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onToggleFeatureShop(shop.id)}
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                              isFeatured ? "bg-amber-500 text-white shadow-xs" : "bg-gray-100 text-gray-500 hover:bg-amber-100"
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {isFeatured ? "Featured" : "+ Feature"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedShop(shop)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#EAF7EE] hover:text-[#138A36] text-gray-700 transition-colors"
                            title="View Detailed Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FEATURED SHOPS MANAGER TAB */}
      {activeTab === "featuredShops" && (
        <div className="space-y-6">
          <div className="bg-[#EAF7EE] border border-[#DDF3E3] rounded-3xl p-5 text-xs text-[#0B6B2B] leading-relaxed">
            <h3 className="font-extrabold text-sm mb-1 flex items-center gap-1.5 text-[#138A36]">
              <Sparkles className="w-4 h-4" /> Featured Shops Promotion Engine
            </h3>
            <p>Promoted shops automatically appear in the Customer Home Hero Carousel, Top Nearby Shops, and Search Results. Admin can set priority order, start date, and end date for active promotions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredShops.map((fs, idx) => {
              const shop = shops.find(s => s.id === fs.shopId) || shops[0];
              return (
                <div key={idx} className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Priority #{fs.priority}
                    </span>
                    <button onClick={() => onToggleFeatureShop(shop.id)} className="text-xs text-red-600 font-bold hover:underline">
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={shop.logoImage} alt={shop.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#111111]">{shop.name}</h4>
                      <p className="text-xs text-gray-500">{shop.category}</p>
                    </div>
                  </div>

                  <div className="bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5] space-y-1 text-xs text-gray-600">
                    <p className="flex items-center justify-between">
                      <span>Placement Target:</span>
                      <strong className="text-[#138A36]">{fs.placement || "Homepage Banner"}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Campaign Dates:</span>
                      <strong>{fs.startDate} to {fs.endDate}</strong>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED SHOP MODAL */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <img src={selectedShop.logoImage} alt={selectedShop.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#138A36]" />
                <div>
                  <h3 className="font-extrabold text-lg text-[#111111] leading-tight font-poppins">{selectedShop.name}</h3>
                  <p className="text-xs text-gray-500">{selectedShop.category} • Rating: ⭐ {selectedShop.rating}</p>
                </div>
              </div>
              <button onClick={() => setSelectedShop(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-40 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <img src={selectedShop.coverImage} alt={selectedShop.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold uppercase tracking-wider text-gray-500">Shop Profile Details</h4>
              <p className="text-gray-700 leading-relaxed">{selectedShop.about}</p>
              <div className="bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5] space-y-1 text-gray-600 mt-2">
                <p><strong>Address:</strong> {selectedShop.address}</p>
                <p><strong>Open Hours:</strong> {selectedShop.openHours} ({selectedShop.openDays})</p>
                <p><strong>Price Range:</strong> {selectedShop.priceRange}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setSelectedShop(null)} className="py-2 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
