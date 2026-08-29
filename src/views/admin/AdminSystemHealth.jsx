import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminSystemHealth({
  systemHealthServices,
  onShowToast
}) {
  return (
    <div className="space-y-6">
      
      {/* SYSTEM HEALTH BANNER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#138A36]" /> GrowLocal Platform System Health & API Status
          </h2>
          <p className="text-xs text-gray-500">Real-time status monitoring for databases, authentication, search indexing, payment gateways, and geocoding</p>
        </div>

        <button
          onClick={() => onShowToast("Refreshed all system health diagnostics")}
          className="bg-gray-100 hover:bg-[#EAF7EE] text-[#111111] hover:text-[#138A36] text-xs font-bold px-3 py-2 rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh System Diagnostic</span>
        </button>
      </div>

      {/* HEALTH SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemHealthServices.map((svc, idx) => (
          <div key={idx} className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-gray-400 font-mono">{svc.category}</span>
              <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {svc.status}
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-[#111111]">{svc.name}</h3>

            <div className="pt-2 border-t border-[#E5E7E5] flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>Uptime: {svc.uptime}</span>
              <span className="text-[#138A36] font-bold">{svc.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
