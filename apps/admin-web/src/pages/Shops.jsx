import { useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatDate } from '../lib/format';
import { PAGE_SIZE, SHOP_STATUSES } from '../constants/statuses';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import TableFilters from '../components/TableFilters';
import StatusChangeModal from '../components/StatusChangeModal';
import { useToast } from '../context/ToastContext';
import { BadgeCheck } from 'lucide-react';

export default function Shops() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);

  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get(ENDPOINTS.ADMIN.SHOPS, {
        query: {
          status: status === 'all' ? undefined : status,
          q: q || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        },
      }),
    [page, status, q]
  );

  const { items, total } = normalizeList(data);
  const pageCount = total > 0 ? Math.ceil(total / PAGE_SIZE) : null;

  async function handleChangeStatus(newStatus) {
    await api.patch(ENDPOINTS.ADMIN.SHOP_STATUS(target.id), { status: newStatus });
    toast(`Shop status updated to ${newStatus.replace(/_/g, ' ')}`);
    setTarget(null);
    refetch();
  }

  const columns = [
    {
      key: 'name',
      header: 'Shop',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-[#111111] truncate">{row?.name || '—'}</p>
          <p className="text-xs text-[#666666] truncate">
            {[row?.city, row?.state].filter(Boolean).join(', ') || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (row) => (
        <span className="text-[#666666]">{row?.phone || row?.email || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row?.status} />,
    },
    {
      key: 'is_verified',
      header: 'Verified',
      render: (row) =>
        row?.is_verified || row?.isVerified ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark">
            <BadgeCheck className="w-4 h-4" />
            Verified
          </span>
        ) : (
          <span className="text-sm text-[#666666]">—</span>
        ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => (
        <span className="text-[#666666] whitespace-nowrap">
          {row?.rating != null ? `${Number(row.rating).toFixed(1)} ★ (${row?.review_count ?? row?.reviewCount ?? 0})` : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{formatDate(row?.created_at ?? row?.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setTarget(row)}
          className="text-sm font-medium text-brand hover:text-brand-dark"
        >
          Change status
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Shops" description="All shops on the platform — update lifecycle status" />
      <TableFilters
        searchValue={q}
        onSearchChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        searchPlaceholder="Search shops…"
        statusValue={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={SHOP_STATUSES}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage={q || status !== 'all' ? 'No shops match these filters' : 'No shops yet'}
      />
      {items.length > 0 ? (
        <Pagination page={page} pageCount={pageCount} total={total} hasNextPage={items.length === PAGE_SIZE} onChange={setPage} />
      ) : null}
      <StatusChangeModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Change shop status"
        description={target ? `Update the lifecycle status of “${target.name || 'this shop'}”.` : ''}
        currentStatus={target?.status}
        options={SHOP_STATUSES.filter((option) => option !== target?.status)}
        onSubmit={handleChangeStatus}
      />
    </div>
  );
}
