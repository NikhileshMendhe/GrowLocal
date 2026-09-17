import React, { useCallback, useEffect, useState } from 'react';
import { ENDPOINTS, SOCKET_EVENTS } from '@growlocal/api-client';
import { Modal } from '@growlocal/ui';
import { BadgePercent, MessageCircle, Package, Reply, Send, Tag, XCircle } from 'lucide-react';
import { api } from '../lib/apiClient';
import { ENQUIRY_MERCHANT_TRANSITIONS, ENQUIRY_STATUS_META, formatINR } from '../lib/format';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, PageLoader, Pagination, Tabs } from '../components/ui';

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'responded', label: 'Responded' },
  { value: 'offer_sent', label: 'Offer sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
];

const OPEN_ENQUIRY_STATUSES = ['pending', 'responded', 'offer_sent'];

const inputClass =
  'px-3 py-2 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]';

function EnquiryCard({ enquiry, onRespond, onDecline, onMakeOffer }) {
  const nextStatuses = ENQUIRY_MERCHANT_TRANSITIONS[enquiry.status] || [];
  const canOffer = OPEN_ENQUIRY_STATUSES.includes(enquiry.status) && enquiry.product_id;

  return (
    <article className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#111111] truncate">{enquiry.enquiry_code}</p>
          <p className="text-xs text-[#666666] mt-0.5">
            {enquiry.customer_name} · {new Date(enquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <StatusBadge meta={ENQUIRY_STATUS_META[enquiry.status]} />
      </div>

      <div className="flex items-center gap-2 text-xs text-[#666666] flex-wrap">
        {enquiry.product_name ? (
          <span className="inline-flex items-center gap-1 bg-[#F7F8F7] border border-[#E5E7E5] px-2 py-1 rounded-lg">
            <Package className="w-3 h-3" /> {enquiry.product_name}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-[#F7F8F7] border border-[#E5E7E5] px-2 py-1 rounded-lg">
            <MessageCircle className="w-3 h-3" /> General enquiry
          </span>
        )}
        {enquiry.requested_size && (
          <span className="bg-[#F7F8F7] border border-[#E5E7E5] px-2 py-1 rounded-lg">Size: {enquiry.requested_size}</span>
        )}
        {enquiry.requested_color && (
          <span className="bg-[#F7F8F7] border border-[#E5E7E5] px-2 py-1 rounded-lg">Colour: {enquiry.requested_color}</span>
        )}
        {enquiry.budget && (
          <span className="inline-flex items-center gap-1 bg-[#F7F8F7] border border-[#E5E7E5] px-2 py-1 rounded-lg">
            <Tag className="w-3 h-3" /> Budget: {enquiry.budget}
          </span>
        )}
      </div>

      {enquiry.message && (
        <p className="text-sm text-[#111111] bg-[#F7F8F7] rounded-xl px-3.5 py-2.5 border border-[#E5E7E5] break-words">
          {enquiry.message}
        </p>
      )}

      {(nextStatuses.length > 0 || canOffer) && (
        <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
          {nextStatuses.includes('responded') && (
            <button
              onClick={() => onRespond(enquiry)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover"
            >
              <Reply className="w-3.5 h-3.5" /> Mark responded
            </button>
          )}
          {canOffer && (
            <button
              onClick={() => onMakeOffer(enquiry)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand text-brand text-xs font-semibold hover:bg-brand-light"
            >
              <BadgePercent className="w-3.5 h-3.5" />
              {enquiry.status === 'offer_sent' ? 'Send another offer' : 'Make offer'}
            </button>
          )}
          {nextStatuses.includes('declined') && (
            <button
              onClick={() => onDecline(enquiry)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 ml-auto"
            >
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default function Enquiries() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerTarget, setOfferTarget] = useState(null);
  const [offerForm, setOfferForm] = useState({ price: '', originalPrice: '', discount: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [actionBusy, setActionBusy] = useState(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await api.get(ENDPOINTS.ENQUIRIES.SHOP, {
          query: { status: statusFilter || undefined, limit: PAGE_SIZE, offset },
        });
        setRows(data.enquiries);
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

  const applyEnquiry = useCallback(
    (enquiry) => {
      setRows((prev) => {
        if (!prev) return prev;
        const exists = prev.some((item) => item.id === enquiry.id);
        if (exists) {
          return matchesFilter(enquiry.status)
            ? prev.map((item) => (item.id === enquiry.id ? { ...item, ...enquiry } : item))
            : prev.filter((item) => item.id !== enquiry.id);
        }
        if (matchesFilter(enquiry.status) && offset === 0) return [enquiry, ...prev];
        return prev;
      });
    },
    [matchesFilter, offset]
  );

  useSocketEvent(SOCKET_EVENTS.ENQUIRY_CREATED, (enquiry) => {
    applyEnquiry(enquiry);
    setTotal((prev) => prev + 1);
    toast(`New enquiry from ${enquiry.customer_name}`);
  });

  useSocketEvent(SOCKET_EVENTS.ENQUIRY_STATUS_CHANGED, (payload) => {
    applyEnquiry(payload);
  });

  useSocketEvent(SOCKET_EVENTS.OFFER_CREATED, (offer) => {
    setRows((prev) =>
      prev
        ? prev.map((item) => (item.id === offer.enquiry_id ? { ...item, status: 'offer_sent' } : item))
        : prev
    );
  });

  async function handleStatus(enquiry, status, successMessage) {
    setActionBusy(enquiry.id);
    try {
      const data = await api.patch(ENDPOINTS.ENQUIRIES.STATUS(enquiry.id), { status });
      applyEnquiry({ ...enquiry, ...data.enquiry });
      toast(successMessage);
    } catch (err) {
      toast(err.message || 'Could not update the enquiry', 'error');
      if (err.status === 409 || err.code === 'INVALID_TRANSITION') load(true);
    } finally {
      setActionBusy(null);
    }
  }

  function openOffer(enquiry) {
    setOfferForm({ price: '', originalPrice: '', discount: '', message: '' });
    setOfferTarget(enquiry);
  }

  async function submitOffer(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.post(ENDPOINTS.OFFERS.CREATE, {
        enquiryId: offerTarget.id,
        price: Number(offerForm.price),
        originalPrice: offerForm.originalPrice === '' ? undefined : Number(offerForm.originalPrice),
        discount: offerForm.discount.trim() || undefined,
        message: offerForm.message.trim() || undefined,
      });
      applyEnquiry({ ...offerTarget, ...data.enquiry });
      setOfferTarget(null);
      toast(`Offer of ${formatINR(data.offer.price)} sent to ${offerTarget.customer_name}`);
    } catch (err) {
      toast(err.message || 'Could not send the offer', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">Enquiries</h1>
        <p className="text-sm text-[#666666] mt-0.5">
          Customer enquiries on your shop — respond, send offers, or decline.
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
        <PageLoader label="Loading enquiries…" />
      ) : error ? (
        <ErrorState error={error} onRetry={() => load()} />
      ) : !rows || rows.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title={statusFilter ? `No ${ENQUIRY_STATUS_META[statusFilter]?.label || statusFilter} enquiries` : 'No enquiries yet'}
          description="When a customer asks about a product, the thread lands here instantly."
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rows.map((enquiry) => (
              <EnquiryCard
                key={enquiry.id}
                enquiry={enquiry}
                onRespond={(item) =>
                  actionBusy !== item.id &&
                  handleStatus(item, 'responded', `Enquiry ${item.enquiry_code} marked as responded`)
                }
                onDecline={(item) =>
                  actionBusy !== item.id && handleStatus(item, 'declined', `Enquiry ${item.enquiry_code} declined`)
                }
                onMakeOffer={openOffer}
              />
            ))}
          </div>
          <Pagination offset={offset} limit={PAGE_SIZE} total={total} onOffset={setOffset} />
        </div>
      )}

      <Modal
        open={Boolean(offerTarget)}
        onClose={() => setOfferTarget(null)}
        title={`Make an offer — ${offerTarget?.product_name || ''}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOfferTarget(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#666666] hover:bg-[#F7F8F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="offer-form"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Sending…' : 'Send offer'}
            </button>
          </>
        }
      >
        <form id="offer-form" onSubmit={submitOffer} className="flex flex-col gap-3.5">
          <p className="text-xs text-[#666666] bg-[#F7F8F7] border border-[#E5E7E5] rounded-xl px-3.5 py-2.5">
            To {offerTarget?.customer_name}
            {offerTarget?.budget ? ` · their budget: ${offerTarget.budget}` : ''}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#111111]">Offer price (₹)</span>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={offerForm.price}
                onChange={(event) => setOfferForm((prev) => ({ ...prev, price: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#111111]">Original price (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={offerForm.originalPrice}
                onChange={(event) => setOfferForm((prev) => ({ ...prev, originalPrice: event.target.value }))}
                placeholder="optional"
                className={inputClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Discount label</span>
            <input
              maxLength={50}
              value={offerForm.discount}
              onChange={(event) => setOfferForm((prev) => ({ ...prev, discount: event.target.value }))}
              placeholder="e.g. 15% off"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Message to the customer</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={offerForm.message}
              onChange={(event) => setOfferForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="Anything you want to say with this offer…"
              className={inputClass}
            />
          </label>
          <p className="text-[11px] text-[#666666]">Offers expire after 7 days unless accepted.</p>
        </form>
      </Modal>
    </div>
  );
}
