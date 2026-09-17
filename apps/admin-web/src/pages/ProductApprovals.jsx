import { useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { Check, X } from 'lucide-react';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatDate, formatCurrency } from '../lib/format';
import { PAGE_SIZE, PRODUCT_APPROVAL_STATUSES } from '../constants/statuses';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import TableFilters from '../components/TableFilters';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function ProductApprovals() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending');
  const [q, setQ] = useState('');
  const [target, setTarget] = useState(null);

  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get(ENDPOINTS.ADMIN.PRODUCTS, {
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

  async function setApproval(newStatus) {
    await api.patch(ENDPOINTS.ADMIN.PRODUCT_APPROVAL(target.row.id), { status: newStatus });
    toast(`Product ${newStatus}`);
    setTarget(null);
    refetch();
  }

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-[#111111] truncate">{row?.name || row?.title || '—'}</p>
          <p className="text-xs text-[#666666] truncate">{row?.shop_name || row?.shopName || row?.shop?.name || ''}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => (
        <span className="whitespace-nowrap text-[#111111]">
          {formatCurrency(row?.price)}
          {row?.original_price || row?.originalPrice ? (
            <span className="ml-1.5 text-xs text-[#666666] line-through">{formatCurrency(row?.original_price ?? row?.originalPrice)}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'availability',
      header: 'Availability',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{row?.availability_status || row?.availabilityStatus || '—'}</span>,
    },
    {
      key: 'approval_status',
      header: 'Approval',
      render: (row) => <StatusBadge status={row?.approval_status ?? row?.approvalStatus ?? row?.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{formatDate(row?.created_at ?? row?.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (row) => {
        const current = row?.approval_status ?? row?.approvalStatus ?? row?.status;
        if (current === 'pending' || current === 'draft' || current === 'rejected' || current === 'hidden') {
          return (
            <div className="inline-flex items-center gap-2">
              {current !== 'approved' ? (
                <button
                  type="button"
                  onClick={() => setTarget({ row, status: 'approved' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-brand-light text-brand-dark hover:bg-[#DDF3E3]"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              ) : null}
              {current !== 'rejected' ? (
                <button
                  type="button"
                  onClick={() => setTarget({ row, status: 'rejected' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              ) : null}
            </div>
          );
        }
        return (
          <button
            type="button"
            onClick={() => setTarget({ row, status: 'hidden' })}
            className="text-sm font-medium text-[#666666] hover:text-[#111111]"
          >
            Hide
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Product Approvals"
        description="Moderate products submitted by merchants — approved products appear in the customer catalog"
      />
      <TableFilters
        searchValue={q}
        onSearchChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        searchPlaceholder="Search products…"
        statusValue={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={PRODUCT_APPROVAL_STATUSES}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage={status !== 'all' ? 'No products in this state' : 'No products yet'}
      />
      {items.length > 0 ? (
        <Pagination page={page} pageCount={pageCount} total={total} hasNextPage={items.length === PAGE_SIZE} onChange={setPage} />
      ) : null}
      <ConfirmModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={target?.status === 'approved' ? 'Approve product' : target?.status === 'rejected' ? 'Reject product' : 'Hide product'}
        message={`Confirm that “${target?.row?.name || 'this product'}” should be marked as ${target?.status}?`}
        confirmLabel={target?.status === 'approved' ? 'Approve' : target?.status === 'rejected' ? 'Reject' : 'Hide'}
        tone={target?.status === 'rejected' ? 'danger' : 'brand'}
        onConfirm={() => setApproval(target.status)}
      />
    </div>
  );
}
