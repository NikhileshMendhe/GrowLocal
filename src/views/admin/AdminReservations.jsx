import React, { useState } from 'react';
import { ShoppingBag, Search, Filter, Eye, CheckCircle2, XCircle, Clock, QrCode, X } from 'lucide-react';

export default function AdminReservations({
  reservations,
  onUpdateReservationStatus,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRes, setSelectedRes] = useState(null);

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.shopName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* SEARCH & FILTERS */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reservation ID, customer, shop, product..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#F7F8F7] p-1 rounded-2xl border border-[#E5E7E5] text-xs font-bold overflow-x-auto no-scrollbar w-full sm:w-auto">
          {["All", "Confirmed", "Visited", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                statusFilter === status ? "bg-[#138A36] text-white" : "text-gray-600 hover:text-[#111111]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* RESERVATIONS TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Reservation ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Shop</th>
                <th className="py-3.5 px-4">Product Reserved</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Pickup Window</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-[#F7F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#138A36]">{res.id}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{res.customerName}</td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">{res.shopName}</td>
                  <td className="py-3.5 px-4 text-gray-600 truncate max-w-xs">{res.productName} ({res.size})</td>
                  <td className="py-3.5 px-4 font-black text-[#138A36]">₹{res.price}</td>
                  <td className="py-3.5 px-4 text-gray-500">{res.pickupTime}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      res.status === "Completed" || res.status === "Visited" ? "bg-green-100 text-green-800" :
                      res.status === "Confirmed" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedRes(res)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#EAF7EE] hover:text-[#138A36] text-gray-700 transition-colors"
                      title="View Reservation QR & Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESERVATION DETAIL MODAL */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono font-bold text-xs text-[#138A36]">{selectedRes.id}</span>
                <h3 className="font-extrabold text-base text-[#111111] mt-0.5">{selectedRes.productName}</h3>
                <p className="text-xs text-gray-500">{selectedRes.shopName}</p>
              </div>
              <button onClick={() => setSelectedRes(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F7F8F7] rounded-2xl border border-[#E5E7E5] text-center space-y-2">
              <div className="w-24 h-24 bg-white border border-gray-300 rounded-2xl mx-auto flex items-center justify-center text-gray-700 shadow-xs">
                <QrCode className="w-16 h-16 text-[#138A36]" />
              </div>
              <p className="font-mono text-xs font-bold text-gray-600">{selectedRes.qrCode || "GL-RES-8901-NGP"}</p>
              <p className="text-xs text-gray-500 font-medium">Customer Pickup Verification Code</p>
            </div>

            <button onClick={() => setSelectedRes(null)} className="w-full py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
              Close View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
