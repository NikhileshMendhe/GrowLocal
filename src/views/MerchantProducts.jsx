import React, { useState } from 'react';
import { Plus, Edit2, EyeOff, Trash2, Package, Search } from 'lucide-react';

export default function MerchantProducts({ products, onAddProduct, onShowToast }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Clothes");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [stock, setStock] = useState("20");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProduct({
      id: `prod-${Date.now()}`,
      shopId: "shop-1",
      shopName: "Trendy Wear",
      shopVerified: true,
      shopDistance: "1.2 km away",
      name,
      category,
      price: parseFloat(price) || 699,
      originalPrice: parseFloat(originalPrice) || 899,
      sizes: sizes.split(',').map(s => s.trim()),
      availability: "In Stock",
      stockCount: parseInt(stock) || 15,
      enquiriesCount: 0,
      description: "Added by shop merchant for local customer availability.",
      images: [image]
    });
    setShowAddModal(false);
    onShowToast(`Product "${name}" added to shop inventory!`);
    setName("");
    setPrice("");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">Product Inventory</h1>
          <p className="text-xs text-[#666666]">Manage local store inventory & availability status</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#138A36] hover:bg-[#0F752C] text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => (
          <div key={prod.id} className="bg-white rounded-2xl border border-[#E5E7E5] overflow-hidden card-shadow p-4 space-y-3">
            <div className="flex gap-4">
              <img src={prod.images[0]} alt={prod.name} className="w-20 h-20 rounded-xl object-cover border border-[#E5E7E5]" />
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-[#138A36] bg-[#EAF7EE] px-2 py-0.5 rounded">
                  {prod.availability} ({prod.stockCount} in stock)
                </span>
                <h3 className="font-bold text-sm text-[#111111]">{prod.name}</h3>
                <p className="text-xs font-bold text-[#111111]">₹{prod.price}</p>
                <p className="text-[11px] text-[#666666]">Sizes: {prod.sizes.join(', ')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E5E7E5] text-xs">
              <span className="text-[#666666]">{prod.enquiriesCount} Enquiries</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onShowToast(`Product ${prod.name} updated`)}
                  className="p-1.5 text-[#138A36] hover:bg-[#EAF7EE] rounded-lg"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onShowToast(`Product hidden from search`)}
                  className="p-1.5 text-[#666666] hover:bg-gray-100 rounded-lg"
                  title="Hide"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E5E7E5]">
            <h3 className="text-lg font-bold text-[#111111]">Add Product to Store</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111111] mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black Oversized T-Shirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#111111] mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="699"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#111111] mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="899"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111111] mb-1">Available Sizes (comma separated)</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] mb-1">Stock Quantity</label>
                <input
                  type="number"
                  placeholder="20"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-[#111111] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#138A36] text-white font-bold rounded-xl hover:bg-[#0F752C]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
