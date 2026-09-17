import { useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { Check, Eye, FileText, X } from 'lucide-react';
import { Modal } from '@growlocal/ui';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatDate, formatValue, humanize } from '../lib/format';
import { PAGE_SIZE, VERIFICATION_STATUSES } from '../constants/statuses';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import TableFilters from '../components/TableFilters';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

export default function ShopVerifications() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('pending');
  const [target, setTarget] = useState(null);
  const [detail, setDetail] = useState(null);

  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get(ENDPOINTS.ADMIN.SHOP_VERIFICATIONS, {
        query: {
          status: status === 'all' ? undefined : status,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        },
      }),
    [page, status]
  );

  const { items, total } = normalizeList(data);
  const pageCount = total > 0 ? Math.ceil(total / PAGE_SIZE) : null;

  async function review(newStatus) {
    await api.patch(ENDPOINTS.ADMIN.REVIEW_VERIFICATION(target.row.id), { status: newStatus });
    toast(`Verification request ${newStatus}`);
    setTarget(null);
    refetch();
  }

  const columns = [
    {
      key: 'shop',
      header: 'Shop',
      render: (row) => (
        <div className="min-w-0">
          <p className="font-medium text-[#111111] truncate">{row?.shop_name || row?.shopName || row?.shop?.name || '—'}</p>
          <p className="text-xs text-[#666666] truncate">{row?.merchant_name || row?.merchantName || row?.merchant?.business_name || row?.merchant?.owner_name || ''}</p>
        </div>
      ),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{formatDate(row?.created_at ?? row?.createdAt)}</span>,
    },
    {
      key: 'documents',
      header: 'Documents',
      render: (row) => {
        const documents = row?.documents;
        const count = Array.isArray(documents) ? documents.length : documents ? 1 : 0;
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-[#666666]">
            <FileText className="w-4 h-4" />
            {count}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row?.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDetail(row)}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#666666] hover:text-[#111111]"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          {row?.status === 'pending' || row?.status === 'under_review' ? (
            <>
              <button
                type="button"
                onClick={() => setTarget({ row, status: 'approved' })}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-brand-light text-brand-dark hover:bg-[#DDF3E3]"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setTarget({ row, status: 'rejected' })}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Shop Verifications"
        description="Review merchant-submitted verification requests — approving marks the shop as verified"
      />
      <TableFilters
        statusValue={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={VERIFICATION_STATUSES}
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage={status !== 'all' ? `No ${humanize(status)} verification requests` : 'No verification requests yet'}
      />
      {items.length > 0 ? (
        <Pagination page={page} pageCount={pageCount} total={total} hasNextPage={items.length === PAGE_SIZE} onChange={setPage} />
      ) : null}
      <ConfirmModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={target?.status === 'approved' ? 'Approve verification' : 'Reject verification'}
        message={
          target?.status === 'approved'
            ? `Approve “${target?.row?.shop_name || target?.row?.shopName || 'this shop'}”? The shop will be marked as verified and the merchant as approved.`
            : `Reject the verification request from “${target?.row?.shop_name || target?.row?.shopName || 'this shop'}”? The merchant will be able to resubmit.`
        }
        confirmLabel={target?.status === 'approved' ? 'Approve' : 'Reject'}
        tone={target?.status === 'approved' ? 'brand' : 'danger'}
        onConfirm={() => review(target.status)}
      />
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Verification details" maxWidth="max-w-lg">
        {detail ? (
          <div className="space-y-4 text-sm">
            <Detail label="Shop" value={detail.shop_name || detail.shopName || detail.shop?.name} />
            <Detail label="Merchant" value={detail.merchant_name || detail.merchantName || detail.merchant?.business_name} />
            <Detail label="Status" value={<StatusBadge status={detail.status} />} />
            <Detail label="Submitted" value={formatDate(detail.created_at ?? detail.createdAt)} />
            <Detail label="Reviewed at" value={formatDate(detail.reviewed_at ?? detail.reviewedAt)} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">Notes</p>
              <p className="text-[#111111] whitespace-pre-wrap">{detail.verification_notes || detail.verificationNotes || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">Documents</p>
              <DocumentList documents={detail.documents} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] pt-0.5">{label}</p>
      <div className="text-[#111111] text-right">{value ?? '—'}</div>
    </div>
  );
}

function DocumentList({ documents }) {
  if (!documents) return <p className="text-[#111111]">—</p>;
  if (typeof documents === 'string') return <p className="text-[#111111]">{documents}</p>;
  if (!Array.isArray(documents) || documents.length === 0) return <p className="text-[#111111]">—</p>;
  return (
    <ul className="space-y-2">
      {documents.map((doc, index) => {
        const name = doc?.name || doc?.label || doc?.type || `Document ${index + 1}`;
        const url = doc?.url || doc?.link || (typeof doc === 'string' ? doc : null);
        return (
          <li key={index}>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand hover:text-brand-dark underline"
              >
                <FileText className="w-4 h-4" />
                {formatValue(name)}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#111111]">
                <FileText className="w-4 h-4" />
                {formatValue(name)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
