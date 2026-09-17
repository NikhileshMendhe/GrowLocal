import { useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { Eye } from 'lucide-react';
import { Modal } from '@growlocal/ui';
import { api } from '../lib/api';
import { useApiData } from '../hooks/useApiData';
import { normalizeList, unwrapEnvelope } from '../lib/normalize';
import { formatDate } from '../lib/format';
import { PAGE_SIZE } from '../constants/statuses';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import TableFilters from '../components/TableFilters';

export default function Creators() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [detailId, setDetailId] = useState(null);

  const list = useApiData(
    () =>
      api.get(ENDPOINTS.CREATORS.LIST, {
        query: { q: q || undefined, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
      }),
    [page, q]
  );

  const detail = useApiData(
    () => (detailId ? api.get(ENDPOINTS.CREATORS.DETAIL(detailId)) : Promise.resolve(null)),
    [detailId]
  );

  const { items, total } = normalizeList(list.data);
  const pageCount = total > 0 ? Math.ceil(total / PAGE_SIZE) : null;
  const profile = detailId ? unwrapEnvelope(detail.data) : null;

  const columns = [
    {
      key: 'name',
      header: 'Creator',
      render: (row) => <span className="font-medium text-[#111111]">{row?.name || '—'}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span className="text-[#666666]">{row?.category || '—'}</span>,
    },
    {
      key: 'followers',
      header: 'Followers',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{row?.followers || '—'}</span>,
    },
    {
      key: 'engagement',
      header: 'Engagement',
      render: (row) => <span className="text-[#666666] whitespace-nowrap">{row?.engagement_rate || row?.engagementRate || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row?.status} />,
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
          onClick={() => setDetailId(row?.id)}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Creators" description="Creator profiles registered on the platform" />
      <TableFilters
        searchValue={q}
        onSearchChange={(value) => {
          setQ(value);
          setPage(1);
        }}
        searchPlaceholder="Search creators…"
      />
      <DataTable
        columns={columns}
        rows={items}
        loading={list.loading}
        error={list.error}
        onRetry={list.refetch}
        emptyMessage={q ? 'No creators match this search' : 'No creators yet'}
      />
      {items.length > 0 ? (
        <Pagination page={page} pageCount={pageCount} total={total} hasNextPage={items.length === PAGE_SIZE} onChange={setPage} />
      ) : null}
      <Modal open={Boolean(detailId)} onClose={() => setDetailId(null)} title="Creator profile" maxWidth="max-w-lg">
        {detail.loading ? (
          <p className="text-sm text-[#666666]">Loading…</p>
        ) : detail.error ? (
          <p className="text-sm text-red-600">{detail.error.message}</p>
        ) : profile ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              {profile.profile_image || profile.profileImage ? (
                <img
                  src={profile.profile_image || profile.profileImage}
                  alt={profile.name || 'Creator'}
                  className="w-14 h-14 rounded-full object-cover border border-[#E5E7E5]"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand-light text-brand-dark flex items-center justify-center text-lg font-semibold">
                  {(profile.name || '?')[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-[#111111]">{profile.name || '—'}</p>
                <StatusBadge status={profile.status} />
              </div>
            </div>
            {profile.bio ? <p className="text-[#666666] whitespace-pre-wrap">{profile.bio}</p> : null}
            <dl className="grid grid-cols-2 gap-3">
              <Field label="Category" value={profile.category} />
              <Field label="Location" value={profile.location || profile.location_name || profile.locationName} />
              <Field label="Followers" value={profile.followers} />
              <Field label="Engagement rate" value={profile.engagement_rate ?? profile.engagementRate} />
              <Field label="Joined" value={formatDate(profile.created_at ?? profile.createdAt)} />
            </dl>
            <SocialLinks links={profile.social_links ?? profile.socialLinks} />
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
      <dd className="mt-0.5 text-[#111111]">{value ?? '—'}</dd>
    </div>
  );
}

function SocialLinks({ links }) {
  const entries = Object.entries(links ?? {}).filter(([, value]) => Boolean(value));
  if (entries.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-1.5">Social</p>
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, value]) => {
          const url = String(value);
          const href = /^(https?:\/\/|www\.)/i.test(url) ? (url.startsWith('www.') ? `https://${url}` : url) : null;
          return href ? (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#F7F8F7] border border-[#E5E7E5] text-sm text-brand hover:bg-brand-light"
            >
              {key}
            </a>
          ) : (
            <span key={key} className="px-3 py-1.5 rounded-lg bg-[#F7F8F7] border border-[#E5E7E5] text-sm text-[#666666]">
              {key}: {url}
            </span>
          );
        })}
      </div>
    </div>
  );
}
