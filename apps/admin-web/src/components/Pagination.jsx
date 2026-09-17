import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageCount, total, onChange, hasNextPage }) {
  const knownPages = pageCount && pageCount > 0 ? pageCount : null;
  const hasPrev = page > 1;
  const hasNext = knownPages ? page < knownPages : Boolean(hasNextPage);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[#666666]">
        {total > 0
          ? `Page ${page}${knownPages ? ` of ${knownPages}` : ''} · ${total.toLocaleString('en-IN')} record${total === 1 ? '' : 's'}`
          : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={!hasPrev}
          className="p-2 rounded-lg border border-[#E5E7E5] bg-white text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8F7]"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {buildPageList(page, knownPages).map((entry, index) =>
          entry === '…' ? (
            <span key={`gap-${index}`} className="px-2 text-xs text-[#666666]">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onChange(entry)}
              className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium ${
                entry === page
                  ? 'bg-brand text-white'
                  : 'bg-white border border-[#E5E7E5] text-[#111111] hover:bg-[#F7F8F7]'
              }`}
            >
              {entry}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={!hasNext}
          className="p-2 rounded-lg border border-[#E5E7E5] bg-white text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F7F8F7]"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function buildPageList(page, knownPages) {
  if (!knownPages) return [page];
  if (knownPages <= 7) return Array.from({ length: knownPages }, (_, i) => i + 1);
  const pages = new Set([1, knownPages, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= knownPages).sort((a, b) => a - b);
  const result = [];
  let previous = 0;
  for (const p of list) {
    if (p - previous > 1) result.push('…');
    result.push(p);
    previous = p;
  }
  return result;
}
