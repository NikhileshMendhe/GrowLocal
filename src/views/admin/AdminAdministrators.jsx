import React from 'react';
import { UserCheck, Lock, ShieldCheck, Key, ShieldAlert } from 'lucide-react';

export default function AdminAdministrators({
  adminUsers = []
}) {
  const superAdmin = adminUsers[0] || {
    id: "superadmin-master-07",
    name: "Nikhilesh Mendhe",
    email: "nikhileshmendhe07@gmail.com",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    phone: "+91 98230 11223",
    status: "Active",
    lastLogin: "Active Session",
    permissions: ["all"]
  };

  return (
    <div className="space-y-6">
      {/* HERO BANNER & SECURITY NOTICE */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#111111] font-poppins flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#138A36]" /> Super Administrator Identity & Access Control
            </h2>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Single SuperAdmin Locked
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Master authority over entire platform, database, verified merchant shops, revenue, and system security.
          </p>
        </div>

        <div className="bg-[#EAF7EE] border border-[#DDF3E3] px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs text-[#138A36] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#138A36] shrink-0" />
          <span>New Admin Account Creation Disabled</span>
        </div>
      </div>

      {/* SECURITY LOCKDOWN CARD */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 shadow-xs flex items-start gap-3.5">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900">
            Designated Super Admin Policy
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            By system policy, <strong className="text-amber-950 font-black">nikhileshmendhe07@gmail.com</strong> is the sole designated Super Administrator. Registration and creation of additional administrative accounts have been permanently restricted to prevent unauthorized platform control.
          </p>
        </div>
      </div>

      {/* SUPER ADMIN DETAILS CARD */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={superAdmin.avatar} 
                alt={superAdmin.name} 
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#138A36] shadow-sm" 
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#111111] font-poppins">{superAdmin.name}</h3>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  Super Administrator
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-500">{superAdmin.email}</p>
              <p className="text-[11px] text-[#138A36] font-bold mt-0.5">Master Owner Authority (All Permissions Enabled)</p>
            </div>
          </div>

          <div className="bg-[#F8FAF8] border border-[#E5E7E5] px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-700">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Status</p>
            <p className="text-green-700 font-extrabold flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              {superAdmin.status} ({superAdmin.lastLogin})
            </p>
          </div>
        </div>

        {/* PERMISSIONS MATRIX */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider font-mono">
            Active Super Admin Privileges
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              "Database & Cloud Storage Direct Access",
              "Merchant Store Verification & KYC Approval",
              "Catalog & Product Approval Control",
              "Financial Transactions & Payouts Log",
              "Realtime Customer & Merchant Inquiries",
              "Platform Audit Logs & Security Tracing",
              "System Health & Realtime Performance",
              "Customer Review & Chat Moderation",
              "Platform-Wide Notifications & Campaigns"
            ].map((perm, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 bg-[#F8FAF8] rounded-xl border border-gray-100 text-xs font-bold text-gray-800">
                <ShieldCheck className="w-4 h-4 text-[#138A36] shrink-0" />
                <span className="truncate">{perm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
