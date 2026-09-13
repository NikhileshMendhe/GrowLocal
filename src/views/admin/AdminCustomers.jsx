import React, { useState } from 'react';
import { 
  Users, Search, Filter, Download, MoreVertical, Edit3, ShieldAlert, 
  CheckCircle, XCircle, RefreshCw, MessageSquare, ShoppingBag, Eye, X, Save, Trash2 
} from 'lucide-react';

export default function AdminCustomers({
  customers,
  onUpdateCustomerStatus,
  onSaveInternalNote,
  onDeleteCustomer,
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editNoteModal, setEditNoteModal] = useState(null);
  const [internalNoteText, setInternalNoteText] = useState("");
  const [confirmModal, setConfirmModal] = useState(null); // { type, customerId, action }
  const [deleteModal, setDeleteModal] = useState(null); // { cust }
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtering
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.phone && c.phone.includes(searchQuery)) || 
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    onShowToast("Exporting customers data to CSV format...");
  };

  const handleExecuteStatusChange = (cust, newStatus) => {
    onUpdateCustomerStatus(cust.id, newStatus);
    onShowToast(`Customer ${cust.name} status updated to ${newStatus}`);
    setConfirmModal(null);
    if (selectedCustomer?.id === cust.id) {
      setSelectedCustomer({ ...selectedCustomer, status: newStatus });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal?.cust) return;
    setIsDeleting(true);
    try {
      if (onDeleteCustomer) {
        await onDeleteCustomer(deleteModal.cust);
      }
      if (selectedCustomer?.id === deleteModal.cust.id) {
        setSelectedCustomer(null);
      }
      setDeleteModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyId = (idText) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(idText);
      onShowToast(`✓ Auth User ID copied: ${idText}`);
    } else {
      onShowToast(`Auth User ID: ${idText}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* FILTER & SEARCH HEADER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer by name, Auth User ID, email, phone, location..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 bg-[#F7F8F7] p-1 rounded-2xl border border-[#E5E7E5] text-xs font-bold">
            {["All", "Active", "Suspended", "Blocked", "Pending Verification"].map((status) => (
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

          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-gray-100 border border-[#E5E7E5] text-[#111111] text-xs font-bold px-3 py-2 rounded-2xl flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Supabase Auth User ID</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4">Enquiries</th>
                <th className="py-3.5 px-4">Reservations</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500 text-sm">
                    No matching customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#F7F8F7] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#111111]">
                      <div className="flex items-center gap-3">
                        <img src={cust.avatar} alt={cust.name} className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200" />
                        <div>
                          <p className="font-bold text-sm text-[#111111] hover:text-[#138A36] cursor-pointer" onClick={() => setSelectedCustomer(cust)}>{cust.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Prof: {cust.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200 font-semibold select-all">
                          {cust.auth_user_id || cust.id}
                        </span>
                        <button
                          onClick={() => handleCopyId(cust.auth_user_id || cust.id)}
                          className="p-1 text-gray-400 hover:text-[#138A36] rounded hover:bg-gray-200 transition-colors"
                          title="Copy Supabase Auth User ID"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">{cust.email}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-mono">{cust.phone || "—"}</td>
                    <td className="py-3.5 px-4 text-gray-600">{cust.location}</td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium">{cust.lastActive || "Recently"}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        {cust.enquiriesCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        {cust.reservationsCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        cust.status === "Active" ? "bg-green-100 text-green-700" :
                        cust.status === "Suspended" ? "bg-amber-100 text-amber-800" :
                        cust.status === "Blocked" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#EAF7EE] hover:text-[#138A36] text-gray-700 transition-colors"
                          title="View Detailed Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {cust.status === "Active" ? (
                          <button
                            onClick={() => setConfirmModal({ type: "suspend", cust })}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                            title="Suspend Account"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleExecuteStatusChange(cust, "Active")}
                            className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                            title="Reactivate Account"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ cust })}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                          title="Delete User from Supabase & Platform"
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

      {/* CUSTOMER DETAILED PROFILE DRAWER / MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-[#138A36]" />
                <div>
                  <h3 className="font-extrabold text-lg text-[#111111] leading-tight">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500">{selectedCustomer.email}{selectedCustomer.phone ? ` • ${selectedCustomer.phone}` : ''}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Supabase Auth UUID Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-1.5 shadow-sm">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Supabase Auth User ID</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-green-400 font-bold select-all break-all">
                  {selectedCustomer.auth_user_id || selectedCustomer.id}
                </span>
                <button
                  onClick={() => handleCopyId(selectedCustomer.auth_user_id || selectedCustomer.id)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>Copy ID</span>
                  <span>📋</span>
                </button>
              </div>
            </div>

            {/* Profile ID & Metadata */}
            <div className="bg-[#F7F8F7] rounded-2xl p-4 border border-[#E5E7E5] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Profile ID</span>
                <span className="font-mono text-gray-800 font-bold">{selectedCustomer.id}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Account Status</span>
                <span className="font-black text-[#138A36]">{selectedCustomer.status}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Registered Location</span>
                <span className="font-semibold text-[#111111]">{selectedCustomer.city || selectedCustomer.location}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Joined Platform</span>
                <span className="font-semibold text-[#111111]">{selectedCustomer.registeredDate}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Last Active</span>
                <span className="font-semibold text-[#138A36]">{selectedCustomer.lastActive || "Just now"}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Phone Number</span>
                <span className="font-semibold text-[#111111]">{selectedCustomer.phone || "Not provided"}</span>
              </div>
            </div>

            {/* Activity Overview */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Customer Platform Activity</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                  <span className="text-xl font-black text-amber-900 block">{selectedCustomer.enquiriesCount}</span>
                  <span className="text-[10px] font-bold text-amber-700">Enquiries Sent</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
                  <span className="text-xl font-black text-blue-900 block">{selectedCustomer.reservationsCount}</span>
                  <span className="text-[10px] font-bold text-blue-700">Reservations</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-center">
                  <span className="text-xl font-black text-purple-900 block">{selectedCustomer.reviewsCount || 1}</span>
                  <span className="text-[10px] font-bold text-purple-700">Reviews Left</span>
                </div>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Internal Admin Note</h4>
                <button
                  onClick={() => {
                    setEditNoteModal(selectedCustomer);
                    setInternalNoteText(selectedCustomer.internalNotes || "");
                  }}
                  className="text-xs font-bold text-[#138A36] hover:underline"
                >
                  Edit Note
                </button>
              </div>
              <div className="p-3 bg-[#EAF7EE] border border-[#DDF3E3] rounded-2xl text-xs text-[#0B6B2B] font-medium leading-relaxed">
                {selectedCustomer.internalNotes || "No internal note added yet."}
              </div>
            </div>

            {/* Admin Actions Bar */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Admin Account Controls</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {selectedCustomer.status === "Active" ? (
                  <button
                    onClick={() => setConfirmModal({ type: "suspend", cust: selectedCustomer })}
                    className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 transition-colors"
                  >
                    Suspend Account
                  </button>
                ) : (
                  <button
                    onClick={() => handleExecuteStatusChange(selectedCustomer, "Active")}
                    className="py-2.5 bg-green-50 hover:bg-green-100 text-green-800 rounded-xl border border-green-200 transition-colors"
                  >
                    Reactivate Account
                  </button>
                )}

                {selectedCustomer.status === "Blocked" ? (
                  <button
                    onClick={() => handleExecuteStatusChange(selectedCustomer, "Active")}
                    className="py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200 transition-colors"
                  >
                    Unblock User
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmModal({ type: "block", cust: selectedCustomer })}
                    className="py-2.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl border border-red-200 transition-colors"
                  >
                    Block User
                  </button>
                )}

                <button
                  onClick={() => onShowToast(`Reset access link sent to ${selectedCustomer.email}`)}
                  className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors col-span-2"
                >
                  Reset Access & Send Password Reset Email
                </button>

                <button
                  onClick={() => setDeleteModal({ cust: selectedCustomer })}
                  className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors col-span-2 flex items-center justify-center gap-2 font-bold cursor-pointer shadow-sm shadow-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User Permanently from Supabase & Platform
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CUSTOMER PERMANENT CONFIRMATION MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-[#111111] font-poppins">
                Permanently Delete User?
              </h3>
              <p className="text-xs text-gray-500">
                You are deleting <strong className="text-gray-800">{deleteModal.cust.name}</strong> ({deleteModal.cust.email})
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-800 space-y-1.5 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-red-900">
                <ShieldAlert className="w-4 h-4 shrink-0" /> Irreversible Supabase Auth Deletion
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-red-700">
                <li>User account will be deleted from the Supabase <code>auth.users</code> database.</li>
                <li>This user will <strong>NOT</strong> be able to log in with this account anymore.</li>
                <li>All active tokens and sessions will be revoked immediately.</li>
                <li>If the user wishes to use GrowLocal in the future, they will have to <strong>make a brand new account</strong>.</li>
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

      {/* DANGEROUS ACTION CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Confirm Admin Action
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to <strong>{confirmModal.type}</strong> account for <strong>{confirmModal.cust.name}</strong>?
              This will update their access permissions immediately across GrowLocal.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteStatusChange(confirmModal.cust, confirmModal.type === "suspend" ? "Suspended" : "Blocked")}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Confirm {confirmModal.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INTERNAL NOTE MODAL */}
      {editNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#111111]">Internal Admin Note — {editNoteModal.name}</h3>
            <textarea
              value={internalNoteText}
              onChange={(e) => setInternalNoteText(e.target.value)}
              rows={4}
              placeholder="Add internal operational note for this customer..."
              className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs focus:outline-none focus:border-[#138A36]"
            />
            <div className="flex items-center gap-3">
              <button onClick={() => setEditNoteModal(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  onSaveInternalNote(editNoteModal.id, internalNoteText);
                  onShowToast("Internal note updated");
                  setEditNoteModal(null);
                  if (selectedCustomer) setSelectedCustomer({ ...selectedCustomer, internalNotes: internalNoteText });
                }}
                className="flex-1 py-2 bg-[#138A36] text-white font-bold rounded-xl text-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
