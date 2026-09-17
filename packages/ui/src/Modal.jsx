import React from 'react';

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} p-6 max-h-[85vh] overflow-y-auto`}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? <h3 className="text-lg font-semibold text-[#111111] mb-4">{title}</h3> : null}
        {children}
        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
