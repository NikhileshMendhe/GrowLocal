import React, { useState } from 'react';
import { 
  MessageSquare, Search, Filter, Eye, CheckCircle2, 
  Clock, AlertTriangle, X, Tag, User, Store, ArrowRight 
} from 'lucide-react';

export default function AdminEnquiries({
  enquiries,
  onUpdateEnquiryStatus,
  onShowToast
}) {
  const [activeStatusTab, setActiveStatusTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = e.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.shopName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeStatusTab === "All" || e.status.toLowerCase().includes(activeStatusTab.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enquiry ID, customer name, shop name, product..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#F7F8F7] p-1 rounded-2xl border border-[#E5E7E5] text-xs font-bold overflow-x-auto no-scrollbar w-full sm:w-auto">
          {["All", "Pending", "Offer Sent", "Interested", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatusTab(status)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                activeStatusTab === status ? "bg-[#138A36] text-white" : "text-gray-600 hover:text-[#111111]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ENQUIRIES MASTER TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Enquiry ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Shop</th>
                <th className="py-3.5 px-4">Product Requested</th>
                <th className="py-3.5 px-4">Budget</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {filteredEnquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-[#F7F8F7] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#138A36]">{enq.id}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{enq.customerName}</td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">{enq.shopName}</td>
                  <td className="py-3.5 px-4 text-gray-600 truncate max-w-xs">{enq.productName} ({enq.size})</td>
                  <td className="py-3.5 px-4 font-black text-[#111111]">{enq.budget}</td>
                  <td className="py-3.5 px-4 text-gray-500">{enq.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      enq.status === "Completed" ? "bg-green-100 text-green-800" :
                      enq.status === "Offer Received" || enq.status === "Interested" ? "bg-blue-100 text-blue-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {enq.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedEnquiry(enq)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#EAF7EE] hover:text-[#138A36] text-gray-700 transition-colors"
                      title="View Detailed Enquiry Timeline"
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

      {/* DETAILED ENQUIRY MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono font-bold text-xs text-[#138A36]">{selectedEnquiry.id}</span>
                <h3 className="font-extrabold text-base text-[#111111] mt-0.5">{selectedEnquiry.productName}</h3>
                <p className="text-xs text-gray-500">{selectedEnquiry.size} • Budget: {selectedEnquiry.budget}</p>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F7F8F7] p-3 rounded-2xl border border-[#E5E7E5]">
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Customer</span>
                <span className="font-bold text-[#111111]">{selectedEnquiry.customerName}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Target Shop</span>
                <span className="font-bold text-[#111111]">{selectedEnquiry.shopName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Last Conversation Snippet</h4>
              <div className="p-3 bg-[#EAF7EE] border border-[#DDF3E3] rounded-2xl text-xs text-[#0B6B2B] italic">
                "{selectedEnquiry.lastMessage}"
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setSelectedEnquiry(null)} className="py-2 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
