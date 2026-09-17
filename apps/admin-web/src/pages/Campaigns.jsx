import { useState } from 'react';
import { ApiError, ENDPOINTS } from '@growlocal/api-client';
import { Info, Users2 } from 'lucide-react';
import { Modal } from '@growlocal/ui';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList } from '../lib/normalize';
import { formatDate, formatCurrency, formatNumber, humanize } from '../lib/format';
import { PAGE_SIZE, CAMPAIGN_STATUSES } from '../constants/statuses';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import TableFilters from '../components/TableFilters';

export default function Campaigns() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [detailId, setDetailId] = useState(null);

  const list = useApiData(
    () =>
      api.get(ENDPOINTS.CAMPAIGNS.MINE, {
        query: {
          status: status === 'all' ? undefined : status,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        },
      }),
    [page, status]
  );

  const { items, total } = normalizeList(list.data);
  const pageCount = total > 0 ? Math.ceil(total / PAGE_SIZE) : null;
  const forbidden = list.error instanceof ApiError && (list.error.status === 401 || list.error.status === 403);

  const detail = useApiData(
    () =>
      detailId
        ? Promise.all([
            api.get(ENDPOINTS.CAMPAIGNS.CREATORS(detailId)).catch(() => null),
            api.get(ENDPOINTS.CAMPAIGNS.METRICS(detailId)).catch(() => null),
          ])
        : Promise.resolve(null),
    [detailId]
  );

  const columns = [
    {
      key: 'name',
      header: 'Campaign',
      render: (row) => <span className="font-medium text-[#111111]">{row?.name || '—'}</span>,
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (row) => <span className="text-[#111111] whitespace-nowrap">{formatCurrency(row?.budget)}</span>,
    },
    {
      key: 'start_date',
      header: 'Start',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{formatDate(row?.start_date ?? row?.startDate)}</span>,
    },
    {
      key: 'end_date',
      header: 'End',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{formatDate(row?.end_date ?? row?.endDate)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row?.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setDetailId(row?.id)}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark"
        >
          <Users2 className="w-4 h-4" />
          Creators & metrics
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Campaigns" description="Creator campaigns run by merchants on the platform" />
      {forbidden ? (
        <div className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-brand" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#111111]">Campaigns are not available for admin accounts yet</p>
              <p className="text-sm text-[#666666] max-w-2xl">
                The current API contract exposes campaign listing only through the merchant-scoped
                <code className="mx-1 px-1.5 py-0.5 rounded bg-[#F7F8F7] border border-[#E5E7E5] text-xs">GET /campaigns/mine</code>
                endpoint, which requires a merchant session. An admin-wide campaigns endpoint needs to be added to
                <code className="mx-1 px-1.5 py-0.5 rounded bg-[#F7F8F7] border border-[#E5E7E5] text-xs">packages/api-client/src/endpoints.js</code>
                before this view can list all campaigns.
              </p>
              <p className="text-xs text-[#999999]">API response: {list.error.message}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <TableFilters
            statusValue={status}
            onStatusChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            statusOptions={CAMPAIGN_STATUSES}
          />
          <DataTable
            columns={columns}
            rows={items}
            loading={list.loading}
            error={list.error}
            onRetry={list.refetch}
            emptyMessage={status !== 'all' ? `No ${humanize(status)} campaigns` : 'No campaigns yet'}
          />
          {items.length > 0 ? (
            <Pagination page={page} pageCount={pageCount} total={total} hasNextPage={items.length === PAGE_SIZE} onChange={setPage} />
          ) : null}
        </>
      )}
      <Modal open={Boolean(detailId)} onClose={() => setDetailId(null)} title="Campaign creators & metrics" maxWidth="max-w-2xl">
        {detail.loading ? (
          <p className="text-sm text-[#666666]">Loading…</p>
        ) : detail.error ? (
          <p className="text-sm text-red-600">{detail.error.message}</p>
        ) : (
          <CampaignDetail payload={detail.data} />
        )}
      </Modal>
    </div>
  );
}

function CampaignDetail({ payload }) {
  const [creatorsRaw, metricsRaw] = payload ?? [];
  const creators = normalizeList(creatorsRaw).items;
  const metrics = normalizeList(metricsRaw).items;

  if (creators.length === 0 && metrics.length === 0) {
    return <p className="text-sm text-[#666666]">No creators or metrics recorded for this campaign yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">Creators</p>
        {creators.length === 0 ? (
          <p className="text-sm text-[#666666]">—</p>
        ) : (
          <ul className="divide-y divide-[#E5E7E5] border border-[#E5E7E5] rounded-xl">
            {creators.map((creator, index) => (
              <li key={creator?.id ?? index} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium text-[#111111] truncate">
                  {creator?.creator_name || creator?.creatorName || creator?.name || 'Creator'}
                </span>
                <span className="flex items-center gap-3 shrink-0">
                  {creator?.agreed_amount || creator?.agreedAmount ? (
                    <span className="text-[#666666]">{formatCurrency(creator.agreed_amount ?? creator.agreedAmount)}</span>
                  ) : null}
                  <StatusBadge status={creator?.status || 'accepted'} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">Metrics</p>
        {metrics.length === 0 ? (
          <p className="text-sm text-[#666666]">—</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metrics.slice(0, 6).map((metric, index) => (
              <div key={metric?.id ?? index} className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl p-3">
                <p className="text-xs text-[#666666]">
                  {metric?.creator_name || metric?.creatorName || `Creator ${index + 1}`}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#111111]">
                  <span>Reach {formatNumber(metric?.reach)}</span>
                  <span>Clicks {formatNumber(metric?.clicks)}</span>
                  <span>Enquiries {formatNumber(metric?.enquiries)}</span>
                  <span>Orders {formatNumber(metric?.orders)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
