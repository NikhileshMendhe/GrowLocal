import { EmptyState, ErrorState, LoadingState } from './StateViews';

export default function DataTable({ columns, rows, loading, error, onRetry, emptyMessage, rowKey }) {
  const getKey = rowKey || ((row, index) => row?.id ?? index);

  return (
    <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-[#F7F8F7] border-b border-[#E5E7E5]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#666666] whitespace-nowrap ${column.headerClassName ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              if (loading) {
                return (
                  <tr>
                    <td colSpan={columns.length}>
                      <LoadingState />
                    </td>
                  </tr>
                );
              }
              if (error) {
                return (
                  <tr>
                    <td colSpan={columns.length}>
                      <ErrorState message={error.message} onRetry={onRetry} />
                    </td>
                  </tr>
                );
              }
              if (!rows || rows.length === 0) {
                return (
                  <tr>
                    <td colSpan={columns.length}>
                      <EmptyState message={emptyMessage} />
                    </td>
                  </tr>
                );
              }
              return rows.map((row, index) => (
                <tr
                  key={getKey(row, index)}
                  className="border-b border-[#E5E7E5] last:border-0 hover:bg-[#FAFBFA]"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 align-middle ${column.className ?? ''}`}>
                      {column.render ? column.render(row) : row?.[column.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
