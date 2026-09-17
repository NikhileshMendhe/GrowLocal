import { useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { Eye } from 'lucide-react';
import { Modal } from '@growlocal/ui';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatDateTime } from '../lib/format';
import { PAGE_SIZE } from '../constants/statuses';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import TableFilters from '../components/TableFilters';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState(null);

  const { loading, data, error, refetch } = useApiData(
    () =>
      api.get(ENDPOINTS.ADMIN.AUDIT_LOGS, {
        query: { q: q || undefined, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
      }),
    [page, q]
  );

  const { items, total } = normalizeList(data);
  const pageCount = total > 0 ? Math.ceil(total / PAGE_SIZE) : null;

  const columns = [
    {
      key: 'created_at',
      header: 'Time',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{formatDateTime(row?.created_at ?? row?.createdAt)}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => <span className="font-medium text-[#111111]">{row?.action || '—'}</span>,
    },
    {
      key: 'entity',
      header: 'Entity',
      render: (row) => (
        <span className="text-[#666666]">
          {row?.entity_type || row?.entityType || '—'}
          {row?.entity_id || row?.entityId ? <span className="text-[#999999]"> · {shortId(row.entity_id ?? row.entityId)}</span> : null}
        </span>
      ),
    },
    {
      key: 'admin',
      header: 'Admin',
      render: (row) => (
        <span className="text-[#666666]">
          {row?.admin_name || row?.adminName || row?.admin?.full_name || (row?.admin_id || row?.adminId ? shortId(row.admin_id ?? row.adminId) : '—')}
        </span>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{row?.ip_address || row?.ipAddress || '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setDetail(row)}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark"
        >
          <Eye className="w-4 h-4" />
          Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Logs" description="Chronological record of administrative actions" />
      <TableFilters
        searchValue={q}
        onSearchChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        searchPlaceholder="Search actions…"
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage={q ? 'No log entries match this search' : 'No audit log entries yet'}
      />
      {items.length > 0 ? (
        <Pagination page={page} pageCount={pageCount} total={total} hasNextPage={items.length === PAGE_SIZE} onChange={setPage} />
      ) : null}
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Audit log entry" maxWidth="max-w-2xl">
        {detail ? (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Field label="Time" value={formatDateTime(detail.created_at ?? detail.createdAt)} />
              <Field label="Action" value={detail.action} />
              <Field label="Entity type" value={detail.entity_type ?? detail.entityType} />
              <Field label="Entity ID" value={detail.entity_id ?? detail.entityId} />
              <Field label="Admin ID" value={detail.admin_id ?? detail.adminId} />
              <Field label="IP address" value={detail.ip_address ?? detail.ipAddress} />
            </dl>
            <JsonBlock label="Old data" value={detail.old_data ?? detail.oldData} />
            <JsonBlock label="New data" value={detail.new_data ?? detail.newData} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#666666]">{label}</dt>
      <dd className="mt-0.5 text-[#111111] break-all">{value ?? '—'}</dd>
    </div>
  );
}

function JsonBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-1.5">{label}</p>
      <pre className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl p-3 text-xs text-[#111111] overflow-x-auto max-h-64">
        {value ? JSON.stringify(value, null, 2) : '—'}
      </pre>
    </div>
  );
}

function shortId(value) {
  const text = String(value ?? '');
  return text.length > 12 ? `${text.slice(0, 8)}…` : text || '—';
}
