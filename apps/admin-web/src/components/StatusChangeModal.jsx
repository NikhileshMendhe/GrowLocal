import { useState } from 'react';
import { Modal } from '@growlocal/ui';
import { humanize } from '../lib/format';
import { Spinner } from './StateViews';

export default function StatusChangeModal({
  open,
  onClose,
  title,
  description,
  currentStatus,
  options,
  actionLabel = 'Save changes',
  onSubmit,
}) {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleOpenChange(isOpening) {
    if (!isOpening) onClose();
    setSelected(null);
    setError(null);
  }

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(selected);
      handleOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => handleOpenChange(false)}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[#E5E7E5] bg-white text-[#111111] hover:bg-[#F7F8F7]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-brand text-white hover:bg-[#0F752C] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {submitting ? <Spinner className="w-4 h-4" /> : null}
            {actionLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {description ? <p className="text-sm text-[#666666]">{description}</p> : null}
        {currentStatus ? (
          <p className="text-sm text-[#111111]">
            Current status: <span className="font-medium">{humanize(currentStatus)}</span>
          </p>
        ) : null}
        <div>
          <label htmlFor="status-select" className="block text-sm font-medium text-[#111111] mb-1">
            New status
          </label>
          <select
            id="status-select"
            value={selected ?? ''}
            onChange={(event) => setSelected(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#E5E7E5] bg-white text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#138A36] focus:border-brand"
          >
            <option value="" disabled>
              Select a status…
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {humanize(option)}
              </option>
            ))}
          </select>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </Modal>
  );
}
