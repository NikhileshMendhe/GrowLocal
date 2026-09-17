export default function StatusBadge({ meta, className = '' }) {
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${meta.className} ${className}`}
    >
      {meta.label}
    </span>
  );
}
