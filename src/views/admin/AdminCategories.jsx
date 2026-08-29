import React, { useState } from 'react';
import { 
  Grid, Plus, Edit3, Trash2, CheckCircle2, XCircle, 
  ArrowUp, ArrowDown, X, Shirt, Glasses, Watch, Smartphone, 
  Sparkles, ShoppingBag, Home, Dumbbell, Gem, Footprints 
} from 'lucide-react';

export default function AdminCategories({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onShowToast
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("Shirt");

  const iconOptions = ["Shirt", "Footprints", "Glasses", "Watch", "Smartphone", "Sparkles", "ShoppingBag", "Home", "Dumbbell", "Gem"];

  const handleSaveCategory = () => {
    if (!catName) {
      alert("Please enter a category name");
      return;
    }
    if (editingCategory) {
      onUpdateCategory(editingCategory.id, { name: catName, icon: catIcon });
      onShowToast(`Category ${catName} updated! Changes live across GrowLocal.`);
    } else {
      const newCat = {
        id: catName.toLowerCase().replace(/\s+/g, '-'),
        name: catName,
        icon: catIcon,
        count: 0
      };
      onAddCategory(newCat);
      onShowToast(`New category '${catName}' created! Available on Customer & Merchant sites.`);
    }
    setShowAddModal(false);
    setEditingCategory(null);
    setCatName("");
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#138A36]" /> Category Master Configurator ({categories.length})
          </h2>
          <p className="text-xs text-gray-500">Categories automatically populate customer homepage filters, search tags, and merchant listing forms</p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setCatName("");
            setShowAddModal(true);
          }}
          className="bg-[#138A36] hover:bg-[#0B6B2B] text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((cat, index) => (
          <div key={cat.id} className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs hover:border-[#DDF3E3] transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-gray-400">Order #{index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingCategory(cat);
                    setCatName(cat.name);
                    setCatIcon(cat.icon);
                    setShowAddModal(true);
                  }}
                  className="p-1 text-gray-400 hover:text-[#138A36]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onDeleteCategory(cat.id);
                    onShowToast(`Category ${cat.name} removed`);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF7EE] text-[#138A36] flex items-center justify-center font-bold shadow-xs">
                🌱
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#111111]">{cat.name}</h4>
                <p className="text-xs text-gray-400 font-medium">{cat.count || 0} listings</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md">Active Live</span>
              <span className="text-gray-400 font-mono">{cat.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT CATEGORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-[#111111]">
                {editingCategory ? `Edit Category — ${editingCategory.name}` : "Create New Category"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Category Name</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Traditional Wear, Toys, Handloom..."
                className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleSaveCategory} className="flex-1 py-2.5 bg-[#138A36] text-white font-bold rounded-xl text-xs shadow-xs">
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
