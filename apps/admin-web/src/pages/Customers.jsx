import { useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatDate } from '../lib/format';
import { PAGE_SIZE, CUSTOMER_STATUSES } from '../constants/statuses';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import TableFilters from '../components/TableFilters';
import StatusChangeModal from '../components/StatusChangeModal';
import { useToast } from '../context/ToastContext';

export default function Customers() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);

  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get(ENDPOINTS.ADMIN.CUSTOMERS, {
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
    await api.patch(ENDPOINTS.ADMIN.CUSTOMER_STATUS(target.id), { status: newStatus });
    toast(`Customer status updated to ${newStatus}`);
    setTarget(null);
    refetch();
  }

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-[#111111] truncate">{row?.full_name || row?.fullName || row?.name || '—'}</p>
          <p className="text-xs text-[#666666] truncate">{row?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{row?.phone || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row?.status} />,
    },
    {
      key: 'last_active',
      header: 'Last active',
      render: (row) => (
        <span className="text-[#666666] whitespace-nowrap">{formatDate(row?.last_active_at ?? row?.lastActiveAt ?? row?.updated_at ?? row?.updatedAt)}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
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
      <PageHeader title="Customers" description="All customer accounts and their platform status" />
      <TableFilters
        searchValue={q}
        onSearchChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        searchPlaceholder="Search customers…"
        statusValue={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={CUSTOMER_STATUSES}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage={q || status !== 'all' ? 'No customers match these filters' : 'No customers yet'}
      />
      {items.length > 0 ? (
        <Pagination page={page} pageCount={pageCount} total={total} hasNextPage={items.length === PAGE_SIZE} onChange={setPage} />
      ) : null}
      <StatusChangeModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Change customer status"
        description={target ? `Update the platform status of “${target.full_name || target.fullName || 'this customer'}”.` : ''}
        currentStatus={target?.status}
        options={CUSTOMER_STATUSES.filter((option) => option !== target?.status)}
        onSubmit={handleChangeStatus}
      />
    </div>
  );
}
