import React, { useState } from 'react';
import { 
  Package, Search, Filter, Eye, Edit3, Trash2, Tag, 
  CheckCircle2, AlertTriangle, Plus, X, Sparkles 
} from 'lucide-react';

export default function AdminProducts({
  products,
  shops,
  onUpdateProductPrice,
  onUpdateProductStock,
  onToggleHideProduct,
  onDeleteProduct,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingPriceModal, setEditingPriceModal] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [deleteModal, setDeleteModal] = useState(null); // { product }
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.shopName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleConfirmDelete = async () => {
    if (!deleteModal?.product) return;
    setIsDeleting(true);
    try {
      if (onDeleteProduct) {
        await onDeleteProduct(deleteModal.product.id);
      }
      if (selectedProduct?.id === deleteModal.product.id) {
        setSelectedProduct(null);
      }
      setDeleteModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavePrice = () => {
    if (!newPrice || isNaN(newPrice)) {
      alert("Please enter a valid price");
      return;
    }
    onUpdateProductPrice(editingPriceModal.id, Number(newPrice));
    onShowToast(`Price for ${editingPriceModal.name} updated to ₹${newPrice}! Changes live on Customer Website.`);
    setEditingPriceModal(null);
  };

  return (
    <div className="space-y-6">
      
      {/* FILTER & SEARCH */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product by name, shop, category..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {["All", "Clothes", "Footwear", "Electronics", "Beauty", "Grocery"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                categoryFilter === cat ? "bg-[#138A36] text-white" : "bg-[#F7F8F7] text-gray-600 hover:text-[#111111]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Shop</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F7F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#111111]">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-gray-200" />
                      <div>
                        <p className="font-bold text-sm text-[#111111] hover:text-[#138A36] cursor-pointer" onClick={() => setSelectedProduct(p)}>{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">{p.shopName}</td>
                  <td className="py-3.5 px-4 text-gray-600">{p.category}</td>
                  <td className="py-3.5 px-4 font-black text-[#138A36] text-sm">
                    ₹{p.price}
                    {p.originalPrice && <span className="text-[10px] text-gray-400 line-through ml-1 font-normal">₹{p.originalPrice}</span>}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{p.stockCount || 10} pcs</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      p.availability === "In Stock" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"
                    }`}>
                      {p.availability}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPriceModal(p);
                          setNewPrice(p.price.toString());
                        }}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                        title="Edit Product Price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#EAF7EE] hover:text-[#138A36] text-gray-700 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ product: p })}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PRICE MODAL */}
      {editingPriceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#111111]">Update Product Price — {editingPriceModal.name}</h3>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">New Price (₹)</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-sm font-bold text-[#138A36] focus:outline-none focus:border-[#138A36]"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setEditingPriceModal(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleSavePrice} className="flex-1 py-2 bg-[#138A36] text-white font-bold rounded-xl text-xs">
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#138A36] uppercase tracking-wider bg-[#EAF7EE] px-2 py-0.5 rounded-md">
                  {selectedProduct.category}
                </span>
                <h3 className="font-extrabold text-base text-[#111111] mt-1">{selectedProduct.name}</h3>
                <p className="text-xs text-gray-500">{selectedProduct.shopName}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-48 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <img src={selectedProduct.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80"} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-gray-700">{selectedProduct.description || "No description provided."}</p>
              <div className="bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5] space-y-1">
                <p><strong>Current Price:</strong> ₹{selectedProduct.price} {selectedProduct.originalPrice ? `(MRP: ₹${selectedProduct.originalPrice})` : ''}</p>
                <p><strong>Available Sizes:</strong> {selectedProduct.sizes && selectedProduct.sizes.length ? selectedProduct.sizes.join(", ") : "Standard"}</p>
                <p><strong>Stock Count:</strong> {selectedProduct.stockCount || 0} pcs</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setDeleteModal({ product: selectedProduct })}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Product
              </button>
              <button onClick={() => setSelectedProduct(null)} className="py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors cursor-pointer">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-[#111111] font-poppins">
                Delete Product?
              </h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently delete <strong className="text-gray-800">{deleteModal.product.name}</strong> from the database?
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800 space-y-1 leading-relaxed">
              <p className="font-bold flex items-center gap-1 text-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Immediate Marketplace Effect
              </p>
              <p>This product will be removed from Supabase and will immediately vanish from search results and customer feeds.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-red-200"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
