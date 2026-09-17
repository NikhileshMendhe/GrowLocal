import { Search } from 'lucide-react';
import { humanize } from '../lib/format';

export default function TableFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  statusValue = 'all',
  onStatusChange,
  statusOptions = [],
  children,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {onSearchChange ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSearchChange(event.currentTarget.elements.search.value.trim());
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input
              name="search"
              type="text"
              defaultValue={searchValue}
              key={searchValue}
              placeholder={searchPlaceholder}
              className="w-full sm:w-64 h-10 pl-9 pr-3 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#138A36] focus:border-brand"
            />
          </form>
        ) : null}
        {onStatusChange && statusOptions.length > 0 ? (
          <select
            value={statusValue}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-10 px-3 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#138A36] focus:border-brand"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {humanize(option)}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
