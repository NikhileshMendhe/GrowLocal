import React, { useState } from 'react';
import { 
  Store, Search, Filter, Download, ShieldCheck, Eye, Edit, Plus, 
  Trash2, X, CheckCircle2, DollarSign, Package, MessageSquare, ShoppingBag 
} from 'lucide-react';

export default function AdminMerchants({
  merchants,
  shops,
  products,
  enquiries,
  onNavigate,
  onDeleteMerchant,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // { merchant }
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMerchants = merchants.filter(m => {
    const matchesSearch = (m.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = planFilter === "All" || (m.plan || '').toLowerCase().includes(planFilter.toLowerCase());
    return matchesSearch && matchesPlan;
  });

  const handleConfirmDelete = async () => {
    if (!deleteModal?.merchant) return;
    setIsDeleting(true);
    try {
      if (onDeleteMerchant) {
        await onDeleteMerchant(deleteModal.merchant);
      }
      if (selectedMerchant?.id === deleteModal.merchant.id) {
        setSelectedMerchant(null);
      }
      setDeleteModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & FILTERS */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant by business, owner name, email, city..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 bg-[#F7F8F7] p-1 rounded-2xl border border-[#E5E7E5] text-xs font-bold">
            {["All", "Free", "Grow", "Pro"].map((plan) => (
              <button
                key={plan}
                onClick={() => setPlanFilter(plan)}
                className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                  planFilter === plan ? "bg-[#138A36] text-white" : "text-gray-600 hover:text-[#111111]"
                }`}
              >
                {plan} Plan
              </button>
            ))}
          </div>

          <button
            onClick={() => onShowToast("Exporting merchants dataset to CSV...")}
            className="bg-white hover:bg-gray-100 border border-[#E5E7E5] text-[#111111] text-xs font-bold px-3 py-2 rounded-2xl flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* MERCHANTS MASTER TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Merchant Business</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Enquiries</th>
                <th className="py-3.5 px-4">Revenue</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500 text-sm">
                    No matching merchants found.
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F7F8F7] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#111111]">
                      <div>
                        <p className="font-bold text-sm text-[#111111] hover:text-[#138A36] cursor-pointer" onClick={() => setSelectedMerchant(m)}>{m.businessName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{m.id}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">{m.ownerName}</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <p className="font-mono text-[11px]">{m.phone}</p>
                      <p className="text-[10px] text-gray-400">{m.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{m.city}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#138A36]" />
                        {m.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{m.productsCount}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">{m.enquiriesCount}</td>
                    <td className="py-3.5 px-4 font-black text-[#138A36] font-mono">{m.revenue}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {m.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedMerchant(m)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#EAF7EE] hover:text-[#138A36] text-gray-700 transition-colors"
                          title="View Detailed Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ merchant: m })}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                          title="Delete Merchant & User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED MERCHANT PROFILE MODAL */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="bg-emerald-100 text-[#138A36] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ✓ {selectedMerchant.verificationStatus} Shop
                </span>
                <h3 className="font-extrabold text-xl text-[#111111] mt-1 font-poppins">{selectedMerchant.businessName}</h3>
                <p className="text-xs text-gray-500">Owner: {selectedMerchant.ownerName} • Joined: {selectedMerchant.registeredDate ? new Date(selectedMerchant.registeredDate).toLocaleDateString('en-GB') : "Recently"}</p>
              </div>
              <button onClick={() => setSelectedMerchant(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl p-3">
                <span className="text-xl font-black text-[#111111] block font-poppins">{selectedMerchant.productsCount || 0}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Products</span>
              </div>
              <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl p-3">
                <span className="text-xl font-black text-amber-700 block font-poppins">{selectedMerchant.enquiriesCount || 0}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Enquiries</span>
              </div>
              <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl p-3">
                <span className="text-xl font-black text-[#138A36] block font-poppins font-mono">{selectedMerchant.revenue || "₹0"}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Revenue</span>
              </div>
              <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl p-3">
                <span className="text-xl font-black text-blue-700 block font-poppins">{selectedMerchant.plan || "Free"}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Plan Tier</span>
              </div>
            </div>

            {/* Merchant Information */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold uppercase tracking-wider text-gray-500">Business & Legal Credentials</h4>
              <div className="bg-[#F7F8F7] p-4 rounded-2xl border border-[#E5E7E5] space-y-2">
                <p><strong>Store Address:</strong> {selectedMerchant.address || "Nagpur, Maharashtra"}</p>
                <p><strong>GSTIN Number:</strong> <span className="font-mono text-[#138A36] font-bold">{selectedMerchant.gstin || "Not provided"}</span></p>
                <p><strong>Owner Contact:</strong> {selectedMerchant.phone || "No phone"} | {selectedMerchant.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => { setSelectedMerchant(null); onNavigate("shops"); }}
                className="py-2.5 px-4 bg-[#EAF7EE] text-[#138A36] font-bold rounded-xl text-xs hover:bg-[#DDF3E3] transition-colors cursor-pointer"
              >
                Manage Shop Profile & Products
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteModal({ merchant: selectedMerchant })}
                  className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Merchant & User
                </button>
                <button
                  onClick={() => setSelectedMerchant(null)}
                  className="py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MERCHANT CONFIRMATION MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-[#111111] font-poppins">
                Delete Merchant Account?
              </h3>
              <p className="text-xs text-gray-500">
                You are deleting <strong className="text-gray-800">{deleteModal.merchant.businessName}</strong> ({deleteModal.merchant.email})
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-800 space-y-1.5 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-red-900">
                ⚠️ Permanent Supabase Auth & Shop Cascade
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-red-700">
                <li>The user account will be completely removed from Supabase <code>auth.users</code>.</li>
                <li>All linked shops, products, photos, and verifications will be deleted.</li>
                <li>The merchant will <strong>NOT</strong> be able to log in with this ID anymore.</li>
                <li>To use the portal again, they must create a new merchant account.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-red-200"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
