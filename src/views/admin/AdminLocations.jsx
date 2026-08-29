import React, { useState } from 'react';
import { MapPin, Plus, CheckCircle2, Globe, Building2, Navigation, Compass, X } from 'lucide-react';

export default function AdminLocations({
  locations,
  onAddLocation,
  onToggleLocationActive,
  onShowToast
}) {
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");

  const handleAddCity = () => {
    if (!cityName || !stateName) {
      alert("Please enter both city and state name");
      return;
    }
    const newLoc = {
      city: cityName,
      state: stateName,
      active: true,
      radiusDefault: "5 km",
      localitiesCount: 12,
      pinCodes: ["400001"]
    };
    onAddLocation(newLoc);
    onShowToast(`City ${cityName} added to GrowLocal service coverage!`);
    setShowAddCityModal(false);
    setCityName("");
    setStateName("");
  };

  return (
    <div className="space-y-6">
      
      {/* HERO BANNER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#138A36]" /> Regional Location & Radius Management
          </h2>
          <p className="text-xs text-gray-500">Configure operational cities, local neighborhood clusters, PIN code boundaries, and radius limits</p>
        </div>

        <button
          onClick={() => setShowAddCityModal(true)}
          className="bg-[#138A36] hover:bg-[#0B6B2B] text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New City Coverage</span>
        </button>
      </div>

      {/* CITIES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc, idx) => (
          <div key={idx} className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#138A36] bg-[#EAF7EE] px-2.5 py-1 rounded-md border border-[#DDF3E3]">
                  {loc.state}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  loc.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                }`}>
                  {loc.active ? "Operational" : "Coming Soon"}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-[#111111] font-poppins">{loc.city}</h3>
                <p className="text-xs text-gray-500 font-medium">{loc.localitiesCount} Active Local Areas • Default Radius: {loc.radiusDefault}</p>
              </div>

              <div className="bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5] space-y-1 text-xs">
                <span className="text-gray-400 font-bold text-[10px] uppercase block">Covered Localities (Nagpur Cluster)</span>
                <p className="text-gray-700 font-medium leading-relaxed">
                  Butibori, Sitabuldi, Civil Lines, Wardha Road, Model Town, Sadar, Dharampeth
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7E5] flex items-center justify-between text-xs">
              <span className="font-mono text-gray-400 text-[11px]">{loc.pinCodes.length} PIN Codes</span>
              <button
                onClick={() => {
                  onToggleLocationActive(loc.city);
                  onShowToast(`Toggled ${loc.city} active status`);
                }}
                className={`font-bold hover:underline ${loc.active ? "text-amber-700" : "text-[#138A36]"}`}
              >
                {loc.active ? "Pause City" : "Activate City"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CITY MODAL */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-[#111111]">Expand GrowLocal City Coverage</h3>
              <button onClick={() => setShowAddCityModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">City Name</label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Mumbai, Pune, Nashik..."
                className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">State Name</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddCityModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleAddCity} className="flex-1 py-2.5 bg-[#138A36] text-white font-bold rounded-xl text-xs shadow-xs">
                Add City
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
