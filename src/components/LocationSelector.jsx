import React, { useState } from 'react';
import { MapPin, Navigation, Check, X, Search } from 'lucide-react';

export default function LocationSelector({ currentLocation, onSelectLocation, onClose }) {
  const [selectedCity, setSelectedCity] = useState(currentLocation.city || "Nagpur");
  const [selectedArea, setSelectedArea] = useState(currentLocation.area || "Butibori, Nagpur");
  const [selectedRadius, setSelectedRadius] = useState(currentLocation.radius || "3 km");
  const [searchQuery, setSearchQuery] = useState("");

  const NAGPUR_AREAS = [
    "Butibori, Nagpur",
    "Sitabuldi, Nagpur",
    "Wardha Road, Nagpur",
    "Civil Lines, Nagpur",
    "Dharampeth, Nagpur",
    "Mankapur, Nagpur",
    "Hingna Road, Nagpur",
    "Sadara, Nagpur"
  ];

  const RADIUS_OPTIONS = ["1 km", "3 km", "5 km", "10 km", "25 km"];

  const handleSave = () => {
    onSelectLocation({
      city: selectedCity,
      area: selectedArea,
      radius: selectedRadius
    });
    onClose();
  };

  const filteredAreas = NAGPUR_AREAS.filter(area => 
    area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#E5E7E5]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7E5] mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#138A36]" />
            <h3 className="text-lg font-bold text-[#111111]">Select Location</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#666666] hover:text-[#111111] rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Auto Location Button */}
        <button 
          onClick={() => {
            setSelectedArea("Butibori, Nagpur");
            setSelectedCity("Nagpur");
          }}
          className="w-full bg-[#EAF7EE] hover:bg-[#DDF3E3] text-[#138A36] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 transition-colors"
        >
          <Navigation className="w-4 h-4 fill-[#138A36]" />
          <span>Use Current Location (GPS)</span>
        </button>

        {/* Search area input */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search city or area in Nagpur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl text-sm focus:outline-none focus:border-[#138A36]"
          />
        </div>

        {/* Area List */}
        <div className="mb-4 max-h-40 overflow-y-auto no-scrollbar space-y-1 pr-1">
          <p className="text-xs font-semibold text-[#666666] uppercase mb-2">Popular Nearby Areas</p>
          {filteredAreas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                selectedArea === area ? 'bg-[#EAF7EE] text-[#138A36] font-semibold' : 'hover:bg-gray-50 text-[#111111]'
              }`}
            >
              <span>{area}</span>
              {selectedArea === area && <Check className="w-4 h-4 text-[#138A36]" />}
            </button>
          ))}
        </div>

        {/* Radius Selector */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#666666] uppercase mb-2">Search Radius</p>
          <div className="grid grid-cols-5 gap-1.5">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  selectedRadius === r
                    ? 'bg-[#138A36] text-white border-[#138A36]'
                    : 'bg-[#F7F8F7] text-[#111111] border-[#E5E7E5] hover:border-gray-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <button
          onClick={handleSave}
          className="w-full bg-[#138A36] hover:bg-[#0F752C] text-white font-semibold py-3 rounded-xl transition-colors shadow-md text-sm"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
