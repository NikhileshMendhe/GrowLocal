import React from 'react';
import { X, LogOut, AlertCircle } from 'lucide-react';

export default function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  role = 'customer',
  hasUnsavedChanges = false
}) {
  if (!isOpen) return null;

  // Determine role-specific one-line copy
  let message = "You'll need to sign in again to access your account.";
  if (hasUnsavedChanges) {
    message = "You have unsaved changes to this product. Log out anyway?";
  } else if (role === 'customer') {
    message = "You'll need to sign in again to see your enquiries and reservations.";
  } else if (role === 'merchant') {
    message = "You'll need to sign in again to manage your shop.";
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Cancel and close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3.5 ${
          hasUnsavedChanges ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-700'
        }`}>
          {hasUnsavedChanges ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <LogOut className="w-6 h-6" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-[#111111] font-poppins">
          Are you sure you want to log out?
        </h3>

        {/* Single Line Copy */}
        <p className={`text-xs mt-1.5 mb-6 px-2 leading-relaxed ${
          hasUnsavedChanges ? 'text-amber-700 font-semibold' : 'text-gray-600'
        }`}>
          {message}
        </p>

        {/* Action Buttons: Equal size, clearly separated */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:flex-1 py-3 px-4 bg-[#262626] hover:bg-[#111111] text-white text-xs font-bold rounded-xl transition-colors shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
