import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SOCKET_EVENTS } from '@growlocal/api-client';
import { Check, Clock, Loader2, MessageSquare, Tag, X } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, formatMoney } from '../lib/format';

export default function Enquiries() {
  const navigate = useNavigate();
  const toast = useToast();
  const { socket } = useSocket();
  const [enquiries, setEnquiries] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyOfferId, setBusyOfferId] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(ENDPOINTS.ENQUIRIES.MINE, { query: { limit: 50 } }).catch((err) => {
        throw err;
      }),
      api.get(ENDPOINTS.OFFERS.LIST, { query: { limit: 100 } }).catch(() => ({ offers: [] })),
    ])
      .then(([enquiryData, offerData]) => {
        setEnquiries(enquiryData.enquiries || []);
        setOffers(offerData.offers || []);
        setError('');
      })
      .catch((err) => setError(err.message || 'Could not load enquiries'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const onOfferCreated = (offer) => {
      if (!offer?.id) return;
      setOffers((prev) =>
        prev.some((item) => item.id === offer.id) ? prev : [offer, ...prev]
      );
      toast(`New offer from ${offer.shop_name || 'a shop'}: ${formatMoney(offer.price)}`);
    };
    const onOfferStatus = (offer) => {
      if (!offer?.id) return;
      setOffers((prev) => prev.map((item) => (item.id === offer.id ? { ...item, ...offer } : item)));
    };
    const onEnquiryStatus = (enquiry) => {
      if (!enquiry?.id) return;
      setEnquiries((prev) =>
        prev.map((item) => (item.id === enquiry.id ? { ...item, ...enquiry } : item))
      );
    };
    socket.on(SOCKET_EVENTS.OFFER_CREATED, onOfferCreated);
    socket.on(SOCKET_EVENTS.OFFER_STATUS_CHANGED, onOfferStatus);
    socket.on(SOCKET_EVENTS.ENQUIRY_STATUS_CHANGED, onEnquiryStatus);
    return () => {
      socket.off(SOCKET_EVENTS.OFFER_CREATED, onOfferCreated);
      socket.off(SOCKET_EVENTS.OFFER_STATUS_CHANGED, onOfferStatus);
      socket.off(SOCKET_EVENTS.ENQUIRY_STATUS_CHANGED, onEnquiryStatus);
    };
  }, [socket, toast]);

  async function acceptOffer(offer) {
    setBusyOfferId(offer.id);
    try {
      const data = await api.post(ENDPOINTS.OFFERS.ACCEPT(offer.id), {});
      toast('Offer accepted — your order is placed!');
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      toast(err.message || 'Could not accept this offer', 'error');
    } finally {
      setBusyOfferId(null);
    }
  }

  async function rejectOffer(offer) {
    setBusyOfferId(offer.id);
    try {
      const data = await api.post(ENDPOINTS.OFFERS.REJECT(offer.id));
      setOffers((prev) => prev.map((item) => (item.id === offer.id ? data.offer : item)));
      toast('Offer rejected.');
    } catch (err) {
      toast(err.message || 'Could not reject this offer', 'error');
    } finally {
      setBusyOfferId(null);
    }
  }

  const offersByEnquiry = offers.reduce((map, offer) => {
    if (!offer.enquiry_id) return map;
    const list = map.get(offer.enquiry_id) || [];
    list.push(offer);
    map.set(offer.enquiry_id, list);
    return map;
  }, new Map());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">Enquiries & offers</h1>
        <p className="text-sm text-[#666666] mt-1">
          Negotiate before you buy — when a shop responds, accept the offer to place your order.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : error ? (
        <EmptyState title="Something went wrong" subtitle={error} />
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries yet"
          subtitle="Found something you like? Send an enquiry and let the shop make you an offer."
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry) => {
            const enquiryOffers = (offersByEnquiry.get(enquiry.id) || []).sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            return (
              <div key={enquiry.id} className="bg-white border border-[#E5E7E5] rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={enquiry.status} />
                  <span className="text-xs text-[#999999] font-mono">
                    {enquiry.enquiry_code || ''}
                  </span>
                  <span className="ml-auto text-xs text-[#666666]">
                    {formatDate(enquiry.created_at)}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-semibold text-[#111111]">
                    {enquiry.product_name || 'General enquiry'}
                  </p>
                  <p className="text-xs text-[#666666]">
                    at{' '}
                    <Link
                      to={`/shops/${enquiry.shop_id}`}
                      className="text-brand font-medium hover:underline"
                    >
                      {enquiry.shop_name}
                    </Link>
                  </p>
                  {enquiry.message ? (
                    <p className="text-sm text-[#666666] mt-2 bg-[#F7F8F7] rounded-lg px-3 py-2">
                      {enquiry.message}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-[#666666]">
                    {enquiry.budget ? (
                      <span className="bg-white border border-[#E5E7E5] rounded-full px-2.5 py-1">
                        Budget {enquiry.budget}
                      </span>
                    ) : null}
                    {enquiry.requested_size ? (
                      <span className="bg-white border border-[#E5E7E5] rounded-full px-2.5 py-1">
                        Size {enquiry.requested_size}
                      </span>
                    ) : null}
                    {enquiry.requested_color ? (
                      <span className="bg-white border border-[#E5E7E5] rounded-full px-2.5 py-1">
                        Color {enquiry.requested_color}
                      </span>
                    ) : null}
                  </div>
                </div>

                {enquiryOffers.length > 0 ? (
                  <div className="mt-4 space-y-3 border-t border-[#E5E7E5] pt-4">
                    {enquiryOffers.map((offer) => {
                      const active = offer.status === 'sent';
                      const expired =
                        offer.expires_at && new Date(offer.expires_at).getTime() <= Date.now();
                      return (
                        <div
                          key={offer.id}
                          className={`rounded-xl border p-4 ${
                            active && !expired
                              ? 'border-brand/30 bg-brand-light/40'
                              : 'border-[#E5E7E5] bg-[#F7F8F7]'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Tag className="w-4 h-4 text-brand" />
                            <span className="text-sm font-bold text-[#111111]">
                              Offer: {formatMoney(offer.price)}
                            </span>
                            {offer.original_price &&
                            Number(offer.original_price) > Number(offer.price) ? (
                              <span className="text-xs text-[#666666] line-through">
                                {formatMoney(offer.original_price)}
                              </span>
                            ) : null}
                            {offer.discount ? (
                              <span className="text-xs font-bold text-brand">{offer.discount}</span>
                            ) : null}
                            <StatusBadge status={offer.status} />
                            {offer.expires_at ? (
                              <span className="ml-auto inline-flex items-center gap-1 text-xs text-[#666666]">
                                <Clock className="w-3 h-3" /> till {formatDate(offer.expires_at)}
                              </span>
                            ) : null}
                          </div>
                          {offer.message ? (
                            <p className="text-sm text-[#666666] mt-2">{offer.message}</p>
                          ) : null}
                          {active && !expired ? (
                            <div className="flex gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() => acceptOffer(offer)}
                                disabled={busyOfferId === offer.id}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg disabled:opacity-50"
                              >
                                {busyOfferId === offer.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                Accept & order
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectOffer(offer)}
                                disabled={busyOfferId === offer.id}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-[#666666] bg-white border border-[#E5E7E5] hover:border-red-300 hover:text-red-600 rounded-lg disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          ) : null}
                          {active && expired ? (
                            <p className="text-xs text-amber-700 mt-2">This offer has expired.</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#999999] mt-3 border-t border-[#E5E7E5] pt-3">
                    No offer yet — the shop will respond here.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
