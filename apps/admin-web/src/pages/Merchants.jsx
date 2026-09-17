import { useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatDate } from '../lib/format';
import { PAGE_SIZE, MERCHANT_STATUSES } from '../constants/statuses';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import TableFilters from '../components/TableFilters';
import StatusChangeModal from '../components/StatusChangeModal';
import { useToast } from '../context/ToastContext';

export default function Merchants() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);

  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get(ENDPOINTS.ADMIN.MERCHANTS, {
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
    await api.patch(ENDPOINTS.ADMIN.MERCHANT_STATUS(target.id), { status: newStatus });
    toast(`Merchant status updated to ${newStatus}`);
    setTarget(null);
    refetch();
  }

  const columns = [
    {
      key: 'business',
      header: 'Merchant',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-[#111111] truncate">{row?.business_name || row?.businessName || '—'}</p>
          <p className="text-xs text-[#666666] truncate">{row?.owner_name || row?.ownerName || ''}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (row) => (
        <div className="min-w-0">
          <p className="text-[#666666] truncate">{row?.email || '—'}</p>
          <p className="text-xs text-[#999999] truncate">{row?.phone || ''}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row?.status} />,
    },
    {
      key: 'verification',
      header: 'Verification',
      render: (row) => <StatusBadge status={row?.verification_status ?? row?.verificationStatus} />,
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
      <PageHeader title="Merchants" description="All merchant accounts and their platform status" />
      <TableFilters
        searchValue={q}
        onSearchChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        searchPlaceholder="Search merchants…"
        statusValue={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={MERCHANT_STATUSES}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage={q || status !== 'all' ? 'No merchants match these filters' : 'No merchants yet'}
      />
      {items.length > 0 ? (
        <Pagination page={page} pageCount={pageCount} total={total} hasNextPage={items.length === PAGE_SIZE} onChange={setPage} />
      ) : null}
      <StatusChangeModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Change merchant status"
        description={target ? `Update the platform status of “${target.business_name || target.businessName || 'this merchant'}”.` : ''}
        currentStatus={target?.status}
        options={MERCHANT_STATUSES.filter((option) => option !== target?.status)}
        onSubmit={handleChangeStatus}
      />
    </div>
  );
}
