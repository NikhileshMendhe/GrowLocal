import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm w-full bg-white border border-[#E5E7E5] rounded-xl shadow-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-[#138A36] shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
      )}
      <p className="text-sm font-medium text-[#111111] flex-1">{message}</p>
      <button onClick={onClose} className="text-[#666666] hover:text-[#111111] p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
