import React, { useCallback, useEffect, useState } from 'react';
import { ENDPOINTS, SOCKET_EVENTS } from '@growlocal/api-client';
import { BadgePercent, CheckCircle2, Clock, Package, Tag, XCircle } from 'lucide-react';
import { api } from '../lib/apiClient';
import { formatDateTime, formatINR, OFFER_STATUS_META, timeAgo } from '../lib/format';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, PageLoader, Pagination, Tabs } from '../components/ui';

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Offers() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await api.get(ENDPOINTS.OFFERS.CREATE, {
          query: { status: statusFilter || undefined, limit: PAGE_SIZE, offset },
        });
        setRows(data.offers);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, offset]
  );

  useEffect(() => {
    load();
  }, [load]);

  const matchesFilter = useCallback((status) => !statusFilter || status === statusFilter, [statusFilter]);

  const applyOffer = useCallback(
    (offer) => {
      setRows((prev) => {
        if (!prev) return prev;
        const exists = prev.some((item) => item.id === offer.id);
        if (exists) {
          return matchesFilter(offer.status)
            ? prev.map((item) => (item.id === offer.id ? offer : item))
            : prev.filter((item) => item.id !== offer.id);
        }
        if (matchesFilter(offer.status) && offset === 0) return [offer, ...prev];
        return prev;
      });
    },
    [matchesFilter, offset]
  );

  useSocketEvent(SOCKET_EVENTS.OFFER_CREATED, (offer) => {
    applyOffer(offer);
  });

  useSocketEvent(SOCKET_EVENTS.OFFER_STATUS_CHANGED, (offer) => {
    applyOffer(offer);
    if (offer.status === 'accepted') toast(`Offer accepted — ${formatINR(offer.price)} on ${offer.product_name}`);
    if (offer.status === 'rejected') toast(`Offer declined on ${offer.product_name}`, 'error');
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">Offers</h1>
        <p className="text-sm text-[#666666] mt-0.5">
          Prices you have quoted on customer enquiries, and how each one landed.
        </p>
      </div>

      <Tabs
        tabs={STATUS_TABS}
        value={statusFilter}
        onChange={(value) => {
          setStatusFilter(value);
          setOffset(0);
        }}
      />

      {loading ? (
        <PageLoader label="Loading offers…" />
      ) : error ? (
        <ErrorState error={error} onRetry={() => load()} />
      ) : !rows || rows.length === 0 ? (
        <EmptyState
          icon={BadgePercent}
          title={statusFilter ? `No ${OFFER_STATUS_META[statusFilter]?.label || statusFilter} offers` : 'No offers sent yet'}
          description="Send an offer from the Enquiries page and track its status here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rows.map((offer) => {
              const expired =
                offer.status === 'sent' && offer.expires_at && new Date(offer.expires_at) < new Date();
              return (
                <article
                  key={offer.id}
                  className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111111] truncate inline-flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#666666] shrink-0" />
                        {offer.product_name || 'Product'}
                      </p>
                      <p className="text-xs text-[#666666] mt-0.5">
                        {offer.shop_name} · sent {timeAgo(offer.created_at)}
                      </p>
                    </div>
                    <StatusBadge meta={OFFER_STATUS_META[offer.status]} />
                  </div>

                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-xl font-bold text-brand-dark">{formatINR(offer.price)}</p>
                    {offer.original_price !== null && offer.original_price > offer.price && (
                      <>
                        <p className="text-xs text-[#666666] line-through">{formatINR(offer.original_price)}</p>
                        {offer.discount && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
                            <Tag className="w-3 h-3" /> {offer.discount}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {offer.message && (
                    <p className="text-sm text-[#111111] bg-[#F7F8F7] rounded-xl px-3.5 py-2.5 border border-[#E5E7E5] break-words">
                      {offer.message}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#666666] flex-wrap">
                    {offer.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1 font-medium text-[#138A36]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Customer accepted — became an order
                      </span>
                    )}
                    {offer.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 font-medium text-red-600">
                        <XCircle className="w-3.5 h-3.5" /> Customer declined
                      </span>
                    )}
                    {offer.expires_at && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {expired ? 'Expired' : 'Expires'} {formatDateTime(offer.expires_at)}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination offset={offset} limit={PAGE_SIZE} total={total} onOffset={setOffset} />
        </div>
      )}
    </div>
  );
}
