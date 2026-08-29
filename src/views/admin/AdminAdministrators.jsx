import React, { useState } from 'react';
import { UserCheck, Lock, ShieldCheck, Plus, Edit3, Trash2, X } from 'lucide-react';

export default function AdminAdministrators({
  adminUsers,
  onAddAdminUser,
  onShowToast
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Operations Admin");

  const handleAddAdmin = () => {
    if (!name || !email) {
      alert("Please enter admin name and email");
      return;
    }
    const newAdmin = {
      id: `admin-${Date.now()}`,
      name,
      email,
      role,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      phone: "+91 98230 00000",
      status: "Active",
      lastLogin: "Just Now",
      permissions: [role.toLowerCase().split(' ')[0]]
    };
    onAddAdminUser(newAdmin);
    onShowToast(`New admin user '${name}' created with role: ${role}`);
    setShowAddModal(false);
    setName("");
    setEmail("");
  };

  return (
    <div className="space-y-6">
      
      {/* HERO BANNER */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] font-poppins flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#138A36]" /> Administrators & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-gray-500">Super Admin, Operations Admin, Content Admin, Finance Admin, Moderation Admin, Analytics Admin</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#138A36] hover:bg-[#0B6B2B] text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin User</span>
        </button>
      </div>

      {/* ADMIN USERS TABLE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F8F7] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#E5E7E5]">
                <th className="py-3.5 px-4">Admin Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {adminUsers.map((adm) => (
                <tr key={adm.id} className="hover:bg-[#F7F8F7]">
                  <td className="py-3.5 px-4 font-bold text-[#111111]">
                    <div className="flex items-center gap-3">
                      <img src={adm.avatar} alt={adm.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-[#138A36]" />
                      <div>
                        <p className="font-bold text-sm text-[#111111]">{adm.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{adm.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-medium">{adm.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      adm.role === "Super Admin" ? "bg-purple-100 text-purple-800" : "bg-[#EAF7EE] text-[#138A36]"
                    }`}>
                      {adm.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{adm.lastLogin}</td>
                  <td className="py-3.5 px-4 font-bold text-green-700">{adm.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ADMIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-[#111111]">Add New Platform Administrator</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Deshmukh"
                className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikram@growlocal.in"
                className="w-full p-3 border border-[#E5E7E5] rounded-2xl text-xs text-[#111111] focus:outline-none focus:border-[#138A36] font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Admin Role Assignment</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl text-xs font-bold text-[#111111]"
              >
                <option value="Super Admin">Super Admin (Full Access)</option>
                <option value="Operations Admin">Operations Admin (Users, Merchants, Enquiries)</option>
                <option value="Content Admin">Content Admin (Homepage, Banners, CMS)</option>
                <option value="Finance Admin">Finance Admin (Subscriptions, Payments, Revenue)</option>
                <option value="Moderation Admin">Moderation Admin (Reviews, Reports, Chats)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleAddAdmin} className="flex-1 py-2.5 bg-[#138A36] text-white font-bold rounded-xl text-xs shadow-xs">
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
