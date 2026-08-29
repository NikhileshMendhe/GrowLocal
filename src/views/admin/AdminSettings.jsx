import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Globe, DollarSign, Bell } from 'lucide-react';

export default function AdminSettings({
  onShowToast
}) {
  const [platformName, setPlatformName] = useState("GrowLocal");
  const [tagline, setTagline] = useState("Find Local. Buy Local. Grow Local.");
  const [currency, setCurrency] = useState("₹ (INR)");
  const [commissionRate, setCommissionRate] = useState("5%");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    onShowToast("✓ Platform global settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      
      {/* SETTINGS CARD */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-6 shadow-xs space-y-6 max-w-2xl">
        <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#138A36]" /> Global Platform Settings & Configurations
        </h2>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-500 block mb-1">Platform Brand Name</label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#138A36]"
            />
          </div>

          <div>
            <label className="font-bold text-gray-500 block mb-1">Brand Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#138A36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-500 block mb-1">Default Currency Symbol</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#138A36]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-500 block mb-1">Default Lead Commission Rate</label>
              <input
                type="text"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs font-bold text-[#111111] focus:outline-none focus:border-[#138A36]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-[#111111]">Platform Maintenance Mode</p>
              <p className="text-gray-400 text-[11px]">Temporarily show maintenance screen to non-admin visitors</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                maintenanceMode ? "bg-red-600" : "bg-gray-300"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                maintenanceMode ? "translate-x-6" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="py-3 px-6 bg-[#138A36] hover:bg-[#0B6B2B] text-white font-bold text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Platform Settings
        </button>
      </div>
    </div>
  );
}
