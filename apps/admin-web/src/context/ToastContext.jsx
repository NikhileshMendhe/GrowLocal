import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast } from '@growlocal/ui';

const ToastContext = createContext(() => {});

let nextId = 0;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setToast({ id: ++nextId, message, type });
  }, []);

  const close = useCallback(() => setToast(null), []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <Toast key={toast.id} message={toast.message} type={toast.type} onClose={close} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
