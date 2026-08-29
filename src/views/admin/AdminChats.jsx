import React, { useState } from 'react';
import { 
  MessagesSquare, Lock, Eye, AlertTriangle, ShieldCheck, 
  UserX, Store, CheckCircle2, History, X 
} from 'lucide-react';

export default function AdminChats({
  reportedChats,
  messages,
  onLogAuditAction,
  onShowToast
}) {
  const [unlockedChat, setUnlockedChat] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(null);

  const handleUnlockChatContent = (chatThread) => {
    // Record audit log for accessing private chat content
    onLogAuditAction({
      admin: "Siddhant Shinde",
      role: "Super Admin",
      action: "Accessed Private Chat Content",
      entity: `Chat between ${chatThread.customerName} & ${chatThread.merchantName}`,
      timestamp: new Date().toLocaleString(),
      ip: "103.44.112.5"
    });
    setUnlockedChat(chatThread);
    setShowPermissionModal(null);
    onShowToast("Private chat unlocked. Audit Log entry recorded!");
  };

  return (
    <div className="space-y-6">
      
      {/* PRIVACY & AUDIT LOG NOTICE */}
      <div className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-3xl p-5 text-xs text-gray-700 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-[#111111] flex items-center gap-2">
            Permission-Gated Privacy Architecture
          </h3>
          <p className="leading-relaxed text-gray-600">
            GrowLocal protects private user and merchant conversations. Admins can view conversation metadata by default. Viewing actual message transcript content requires admin clearance and automatically registers a permanent entry in the <strong>Security Audit Logs</strong>.
          </p>
        </div>
      </div>

      {/* REPORTED CHATS INBOX */}
      <div className="bg-white border border-[#E5E7E5] rounded-3xl p-5 shadow-xs">
        <h3 className="font-extrabold text-base text-[#111111] mb-4 font-poppins flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Reported Conversations ({reportedChats.length})
        </h3>

        <div className="space-y-3">
          {reportedChats.map((chat) => (
            <div key={chat.id} className="p-4 bg-[#F7F8F7] border border-[#E5E7E5] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full uppercase">
                    {chat.reason}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Reported by: {chat.reportedBy}</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#111111]">
                  {chat.customerName} ↔ {chat.merchantName}
                </h4>
                <p className="text-xs text-gray-500 italic">"Last Message: {chat.lastMessage}"</p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowPermissionModal(chat)}
                  className="flex-1 md:flex-none py-2 px-3 bg-[#138A36] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Unlock Transcript
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PERMISSION MODAL BEFORE UNLOCKING */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#111111] flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" /> Permission & Audit Log Trigger
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              You are about to access message content between <strong>{showPermissionModal.customerName}</strong> and <strong>{showPermissionModal.merchantName}</strong>. 
              This action will be logged in the Audit Log under your admin account.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setShowPermissionModal(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={() => handleUnlockChatContent(showPermissionModal)} className="flex-1 py-2 bg-[#138A36] text-white font-bold rounded-xl text-xs">
                Confirm & Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNLOCKED CHAT TRANSCRIPT MODAL */}
      {unlockedChat && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Unlocked Audit Session #9812
                </span>
                <h3 className="font-extrabold text-base text-[#111111] mt-1">
                  Chat Log: {unlockedChat.customerName} & {unlockedChat.merchantName}
                </h3>
              </div>
              <button onClick={() => setUnlockedChat(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#F7F8F7] p-4 rounded-2xl border border-[#E5E7E5] max-h-64 overflow-y-auto">
              {messages.map((m) => (
                <div key={m.id} className={`p-2.5 rounded-xl text-xs ${
                  m.sender === "customer" ? "bg-white border border-gray-200 text-gray-800" : "bg-[#EAF7EE] text-[#0B6B2B] font-medium"
                }`}>
                  <p className="font-bold text-[10px] text-gray-400 uppercase">{m.sender}</p>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onShowToast("Warning issued to reported user.");
                  setUnlockedChat(null);
                }}
                className="py-2 px-3 bg-amber-100 text-amber-900 font-bold rounded-xl text-xs"
              >
                Issue Formal Warning
              </button>
              <button onClick={() => setUnlockedChat(null)} className="py-2 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
