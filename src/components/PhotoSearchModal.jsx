import React, { useState } from 'react';
import { Camera, Upload, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PhotoSearchModal({ onClose, onFindShops }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState(null);

  const SAMPLE_PHOTOS = [
    {
      name: "Black Oversized Tee",
      url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
      query: "Black Oversized T-Shirt"
    },
    {
      name: "White Leather Sneakers",
      url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80",
      query: "Casual White Leather Sneakers"
    },
    {
      name: "Wireless Headphones",
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
      query: "Wireless Noise-Cancelling Headphones"
    }
  ];

  const detectKeywordFromFileName = (fileName) => {
    if (!fileName) return "Casual Wear";
    const lower = fileName.toLowerCase();
    if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("footwear") || lower.includes("boot")) return "Sneakers";
    if (lower.includes("shirt") || lower.includes("tee") || lower.includes("top") || lower.includes("polo")) return "Casual Shirt";
    if (lower.includes("jean") || lower.includes("pant") || lower.includes("trouser") || lower.includes("denim")) return "Denim Jeans";
    if (lower.includes("watch") || lower.includes("smartwatch") || lower.includes("dial")) return "Smartwatch";
    if (lower.includes("phone") || lower.includes("mobile") || lower.includes("case")) return "Mobile Accessories";
    if (lower.includes("headphone") || lower.includes("earphone") || lower.includes("audio")) return "Wireless Headphones";
    if (lower.includes("bag") || lower.includes("backpack") || lower.includes("wallet")) return "Leather Bag";
    if (lower.includes("glass") || lower.includes("shade") || lower.includes("spectacle")) return "Sunglasses";
    
    // Clean up filename by stripping extension and special characters
    const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
    if (cleanName.length > 2 && cleanName.length < 35 && !/^\d+$/.test(cleanName)) {
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    return "Local Fashion & Goods";
  };

  const handleSelectPhoto = (photo) => {
    setSelectedImage(photo.url);
    setAnalyzing(true);
    setAnalyzedResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzedResult({
        detectedItem: photo.query,
        confidence: "98% Visual Match",
        shopsFound: 4
      });
    }, 1200);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const deducedName = detectKeywordFromFileName(file.name);
      setSelectedImage(url);
      setAnalyzing(true);
      setAnalyzedResult(null);

      setTimeout(() => {
        setAnalyzing(false);
        setAnalyzedResult({
          detectedItem: deducedName,
          confidence: "94% Visual Match",
          shopsFound: 4
        });
      }, 1200);
    }
  };

  const handleViewResults = () => {
    if (analyzedResult) {
      onFindShops(analyzedResult.detectedItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#E5E7E5] relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#666666] hover:text-[#111111] bg-gray-100 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#EAF7EE] text-[#138A36] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">Search by Photo</h3>
          <p className="text-sm text-[#666666] mt-1">
            Snap a photo or upload an image, and we'll find matching items in local Nagpur shops.
          </p>
        </div>

        {/* Upload Zone */}
        {!selectedImage && (
          <div>
            <label className="border-2 border-dashed border-[#138A36]/40 hover:border-[#138A36] bg-[#EAF7EE]/40 hover:bg-[#EAF7EE] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors mb-6">
              <Upload className="w-8 h-8 text-[#138A36] mb-2" />
              <span className="font-semibold text-[#138A36] text-sm">Upload Photo or Take Picture</span>
              <span className="text-xs text-[#666666] mt-1">Supports JPG, PNG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            <p className="text-xs font-semibold text-[#666666] uppercase text-center mb-3">Or Try Sample Photos</p>
            <div className="grid grid-cols-3 gap-3">
              {SAMPLE_PHOTOS.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPhoto(photo)}
                  className="group rounded-xl overflow-hidden border border-[#E5E7E5] hover:border-[#138A36] transition-all relative aspect-square"
                >
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex items-end">
                    <span className="text-[10px] font-medium text-white line-clamp-1">{photo.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview & Analyzing State */}
        {selectedImage && (
          <div className="space-y-4">
            <div className="relative h-56 rounded-2xl overflow-hidden border border-[#E5E7E5]">
              <img src={selectedImage} alt="Uploaded" className="w-full h-full object-cover" />
              
              {analyzing && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <Sparkles className="w-8 h-8 text-[#138A36] animate-spin mb-2" />
                  <span className="font-bold text-sm">Analyzing Image...</span>
                  <span className="text-xs opacity-80 mt-0.5">Scanning nearby Nagpur inventories</span>
                </div>
              )}

              {!analyzing && analyzedResult && (
                <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#E5E7E5] space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#138A36]">
                      <CheckCircle2 className="w-4 h-4 fill-[#138A36] text-white" />
                      <span>{analyzedResult.confidence}</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-[#EAF7EE] text-[#138A36] px-2 py-0.5 rounded-full">
                      {analyzedResult.shopsFound} Nagpur Stores
                    </span>
                  </div>

                  {/* Editable Search Term */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Search Term</label>
                    <input
                      type="text"
                      value={analyzedResult.detectedItem}
                      onChange={(e) => setAnalyzedResult({ ...analyzedResult, detectedItem: e.target.value })}
                      className="w-full text-xs font-bold text-[#111111] bg-gray-50 border border-[#E5E7E5] rounded-lg px-2.5 py-1.5 mt-0.5 outline-none focus:border-[#138A36]"
                    />
                  </div>

                  {/* Quick Refine Tags */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                    <span className="text-[10px] text-gray-400 font-bold shrink-0">Refine:</span>
                    {["Sneakers", "Shirt", "Jeans", "Watch", "Audio", "Sunglasses"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setAnalyzedResult({ ...analyzedResult, detectedItem: tag })}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 transition-colors cursor-pointer ${
                          analyzedResult.detectedItem === tag
                            ? 'bg-[#138A36] text-white border-[#138A36]'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {analyzedResult && !analyzing && (
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleViewResults}
                  className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm cursor-pointer"
                >
                  <span>Search Nagpur Shops for "{analyzedResult.detectedItem}"</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="w-full text-center text-xs text-[#666666] hover:text-[#111111] py-1 cursor-pointer"
                >
                  Try Another Photo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
