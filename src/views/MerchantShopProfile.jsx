import React, { useState } from 'react';
import VerifiedBadge from '../components/VerifiedBadge';
import { Store, MapPin, Clock, Phone, Save, Eye } from 'lucide-react';

export default function MerchantShopProfile({ shop, onPreviewPublic, onShowToast }) {
  const [name, setName] = useState(shop.name);
  const [category, setCategory] = useState(shop.category);
  const [address, setAddress] = useState(shop.address);
  const [hours, setHours] = useState(shop.openHours);
  const [about, setAbout] = useState(shop.about);

  const handleSave = (e) => {
    e.preventDefault();
    onShowToast("Shop Profile details updated successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] font-poppins">Edit Shop Profile</h1>
          <p className="text-xs text-[#666666]">Public business information visible to Nagpur customers</p>
        </div>

        <button
          onClick={onPreviewPublic}
          className="bg-[#EAF7EE] text-[#138A36] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#DDF3E3] transition-colors flex items-center gap-1.5"
        >
          <Eye className="w-4 h-4" />
          <span>Preview Public Profile</span>
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#E5E7E5] p-6 card-shadow space-y-4 text-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7E5]">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#E5E7E5] bg-gray-100">
            <img src={shop.logoImage || shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#111111]">{name}</span>
              <VerifiedBadge />
            </div>
            <span className="text-[11px] text-[#138A36] font-semibold">GST & Background Verified</span>
          </div>
        </div>

        <div>
          <label className="block font-bold text-[#111111] mb-1">Shop Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-[#111111] mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#111111] mb-1">Opening Hours</label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-[#111111] mb-1">Store Address (Nagpur)</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
          />
        </div>

        <div>
          <label className="block font-bold text-[#111111] mb-1">About Shop Description</label>
          <textarea
            rows={3}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full p-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-xs focus:outline-none focus:border-[#138A36]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
