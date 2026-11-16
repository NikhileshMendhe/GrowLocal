import { useState } from 'react';
import { Modal } from '@growlocal/ui';
import { Spinner } from './StateViews';

export default function ConfirmModal({
  open,
  isOpen,
  onClose,
  title,
  message,
  description,
  confirmLabel = 'Confirm',
  tone = 'brand',
  danger,
  onConfirm,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const effectiveOpen = Boolean(open ?? isOpen);
  const effectiveMessage = message ?? description;
  const effectiveTone = danger ? 'danger' : tone;

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  const confirmClass =
    effectiveTone === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-brand text-white hover:bg-[#0F752C]';

  return (
    <Modal
      open={effectiveOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[#E5E7E5] bg-white text-[#111111] hover:bg-[#F7F8F7]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ${confirmClass}`}
          >
            {submitting ? <Spinner className="w-4 h-4" /> : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-[#666666]">{effectiveMessage}</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </Modal>
  );
}
