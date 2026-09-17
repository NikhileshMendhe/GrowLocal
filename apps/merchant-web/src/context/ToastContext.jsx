import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Toast } from '@growlocal/ui';

const ToastContext = createContext(null);
let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((message, type = 'success') => {
    const id = nextToastId++;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="flex flex-col gap-2">
        {toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            message={toastItem.message}
            type={toastItem.type}
            onClose={() => dismiss(toastItem.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used within ToastProvider');
  return toast;
}

export function useToastRef() {
  const toast = useToast();
  const ref = useRef(toast);
  ref.current = toast;
  return ref;
}
