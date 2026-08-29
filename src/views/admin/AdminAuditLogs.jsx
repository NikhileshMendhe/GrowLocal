import React from 'react';
import { History, ShieldCheck, Lock, Search } from 'lucide-react';

export default function AdminAuditLogs({
  auditLogs,
  onShowToast
}) {
  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <History className="w-5 h-5 text-[#138A36]" /> Security Audit Logs ({auditLogs.length})
          </h2>
          <p className="text-xs text-gray-500">Immutable real-time audit log of sensitive admin operations, merchant approvals, price updates, and chat transcript views</p>
        </div>
      </div>

      {/* AUDIT LOGS TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4 font-sans">Log ID</th>
                <th className="py-3.5 px-4 font-sans">Admin Name</th>
                <th className="py-3.5 px-4 font-sans">Role</th>
                <th className="py-3.5 px-4 font-sans">Action Executed</th>
                <th className="py-3.5 px-4 font-sans">Target Entity</th>
                <th className="py-3.5 px-4 font-sans">Timestamp</th>
                <th className="py-3.5 px-4 font-sans">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F8F7]">
                  <td className="py-3.5 px-4 text-[#138A36] font-bold">{log.id}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-[#111111]">{log.admin}</td>
                  <td className="py-3.5 px-4 font-sans text-gray-600">{log.role}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-[#138A36]">{log.action}</td>
                  <td className="py-3.5 px-4 font-sans text-gray-800">{log.entity}</td>
                  <td className="py-3.5 px-4 text-gray-500">{log.timestamp}</td>
                  <td className="py-3.5 px-4 text-gray-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
