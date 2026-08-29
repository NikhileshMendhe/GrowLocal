import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, Eye, X } from 'lucide-react';

export default function AdminReports({
  reports,
  onResolveReport,
  onShowToast
}) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const handleResolve = () => {
    onResolveReport(selectedReport.id);
    onShowToast(`Report ${selectedReport.id} resolved successfully!`);
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Platform Reports & Complaints Inbox ({reports.length})
          </h2>
          <p className="text-xs text-gray-500">Investigate complaints regarding shops, products, chats, fake listings, or reviews</p>
        </div>
      </div>

      {/* REPORTS LIST */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Report ID</th>
                <th className="py-3.5 px-4">Reporter</th>
                <th className="py-3.5 px-4">Reported Entity</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Reason / Issue</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-[#F7F8F7]">
                  <td className="py-3.5 px-4 font-mono font-bold text-red-600">{rep.id}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{rep.reporter}</td>
                  <td className="py-3.5 px-4 font-medium text-gray-700">{rep.reportedEntity}</td>
                  <td className="py-3.5 px-4 text-gray-500">{rep.entityType}</td>
                  <td className="py-3.5 px-4 text-gray-700 max-w-xs leading-relaxed">{rep.reason}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      rep.priority === "High" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {rep.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-700">{rep.status}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedReport(rep)}
                      className="px-3 py-1.5 bg-[#138A36] text-white text-xs font-bold rounded-xl hover:bg-[#0B6B2B]"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVESTIGATION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono font-bold text-xs text-red-600">{selectedReport.id}</span>
                <h3 className="font-extrabold text-base text-[#111111] mt-0.5">Report on {selectedReport.reportedEntity}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-xs text-red-900 leading-relaxed">
              <strong>Complaint Reason:</strong> {selectedReport.reason}
            </div>

            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
              placeholder="Admin investigation notes / action taken..."
              className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs focus:outline-none focus:border-[#138A36]"
            />

            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedReport(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleResolve} className="flex-1 py-2 bg-[#138A36] text-white font-bold rounded-xl text-xs">
                Resolve Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
