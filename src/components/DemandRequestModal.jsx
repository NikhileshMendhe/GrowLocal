import React, { useState } from 'react';
import { Send, Sparkles, X, CheckCircle2, MapPin } from 'lucide-react';

export default function DemandRequestModal({ onClose, onSubmitDemand }) {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Clothes");
  const [size, setSize] = useState("M");
  const [budget, setBudget] = useState("1500");
  const [radius, setRadius] = useState("3 km");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSubmitDemand({
        productName,
        category,
        size,
        budget: `₹${budget}`,
        radius,
        details
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#E5E7E5] relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#666666] hover:text-[#111111] bg-gray-100 rounded-full">
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#138A36] bg-[#EAF7EE] px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customer Demand Broadcast</span>
              </span>
              <h3 className="text-xl font-bold text-[#111111]">Tell Shops What You Need</h3>
              <p className="text-xs text-[#666666] mt-1">
                Can't find exact availability? Send your requirement directly to nearby Nagpur merchants.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">Product You're Looking For *</label>
              <input
                type="text"
                required
                placeholder="e.g. Black Formal Shirt"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
                >
                  <option value="Clothes">Clothes</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Eyewear">Eyewear</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Home">Home</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">Size / Variant</label>
                <input
                  type="text"
                  placeholder="e.g. M / UK 9"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">Budget (₹ max)</label>
                <input
                  type="number"
                  placeholder="1500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">Search Radius</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
                >
                  <option value="1 km">Within 1 km</option>
                  <option value="3 km">Within 3 km</option>
                  <option value="5 km">Within 5 km</option>
                  <option value="10 km">Within 10 km</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">Additional Details</label>
              <textarea
                rows={2}
                placeholder="e.g. Need it urgently by this evening for an interview."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm mt-2"
            >
              <Send className="w-4 h-4 fill-white" />
              <span>Broadcast Demand to Nearby Shops</span>
            </button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#EAF7EE] text-[#138A36] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10 fill-[#138A36] text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#111111]">Demand Request Sent!</h3>
            <p className="text-sm text-[#666666] max-w-xs mx-auto">
              Your request for <span className="font-semibold text-[#111111]">"{productName || 'Product'}"</span> has been broadcasted to <span className="font-semibold text-[#138A36]">5 verified nearby shops</span> in Butibori, Nagpur.
            </p>
            <div className="p-3 bg-[#F7F8F7] rounded-xl border border-[#E5E7E5] text-xs text-[#666666] flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-[#138A36]" />
              <span>Shops will reply with live stock & price quotes in your Enquiries tab.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
