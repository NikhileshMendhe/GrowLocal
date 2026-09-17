import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Megaphone, Plus, Store } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useToast } from '../context/ToastContext.jsx';
import DemandRequestModal from '../components/DemandRequestModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, formatMoney } from '../lib/format';

export default function DemandRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [responses, setResponses] = useState({});
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    reload();
    api
      .get(ENDPOINTS.CATEGORIES.LIST)
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  function reload() {
    setLoading(true);
    api
      .get(ENDPOINTS.DEMAND_REQUESTS.MINE, { query: { limit: 50 } })
      .then((data) => setRequests(data.demandRequests || []))
      .catch((err) => setError(err.message || 'Could not load demand requests'))
      .finally(() => setLoading(false));
  }

  async function toggleResponses(id) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (responses[id]) return;
    setLoadingResponses(true);
    try {
      const data = await api.get(ENDPOINTS.DEMAND_REQUESTS.RESPONSES(id));
      setResponses((prev) => ({ ...prev, [id]: data.responses || [] }));
    } catch (err) {
      toast(err.message || 'Could not load responses', 'error');
    } finally {
      setLoadingResponses(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Demand requests</h1>
          <p className="text-sm text-[#666666] mt-1">
            Tell nearby shops what you're looking for — they respond with stock and prices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-xl"
        >
          <Plus className="w-4 h-4" /> New request
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : error ? (
        <EmptyState title="Something went wrong" subtitle={error} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No demand requests yet"
          subtitle="Can't find something? Broadcast it to shops around you."
          action={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg"
            >
              <Megaphone className="w-4 h-4" /> Post a request
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const requestResponses = responses[request.id] || [];
            return (
              <div key={request.id} className="bg-white border border-[#E5E7E5] rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={request.status} />
                  <span className="text-xs text-[#999999]">{formatDate(request.created_at)}</span>
                  <button
                    type="button"
                    onClick={() => toggleResponses(request.id)}
                    className="ml-auto text-xs font-semibold text-brand hover:underline"
                  >
                    {expandedId === request.id ? 'Hide responses' : 'View responses'}
                  </button>
                </div>
                <p className="text-sm font-semibold text-[#111111] mt-2.5">{request.product_name}</p>
                {request.description ? (
                  <p className="text-sm text-[#666666] mt-1">{request.description}</p>
                ) : null}
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-[#666666]">
                  {request.budget ? (
                    <span className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-full px-2.5 py-1">
                      Budget {request.budget}
                    </span>
                  ) : null}
                  {request.size ? (
                    <span className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-full px-2.5 py-1">
                      Size {request.size}
                    </span>
                  ) : null}
                  {request.color ? (
                    <span className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-full px-2.5 py-1">
                      Color {request.color}
                    </span>
                  ) : null}
                  {request.radius_km ? (
                    <span className="bg-[#F7F8F7] border border-[#E5E7E5] rounded-full px-2.5 py-1">
                      Within {request.radius_km} km
                    </span>
                  ) : null}
                </div>

                {expandedId === request.id ? (
                  <div className="mt-4 border-t border-[#E5E7E5] pt-4">
                    {loadingResponses && !responses[request.id] ? (
                      <div className="py-6 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-brand animate-spin" />
                      </div>
                    ) : requestResponses.length === 0 ? (
                      <p className="text-sm text-[#999999]">
                        No shop responses yet — shops near you have been notified.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {requestResponses.map((response) => (
                          <div
                            key={response.id}
                            className="rounded-xl border border-[#E5E7E5] bg-[#F7F8F7] p-3.5"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <Store className="w-4 h-4 text-brand" />
                              <Link
                                to={`/shops/${response.shop_id}`}
                                className="text-sm font-semibold text-brand hover:underline"
                              >
                                {response.shop_name || 'A nearby shop'}
                              </Link>
                              {response.price ? (
                                <span className="text-sm font-bold text-[#111111]">
                                  {formatMoney(response.price)}
                                </span>
                              ) : null}
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  response.availability === 'available'
                                    ? 'text-brand bg-brand-light'
                                    : 'text-amber-700 bg-amber-50'
                                }`}
                              >
                                {response.availability}
                              </span>
                            </div>
                            {response.message ? (
                              <p className="text-sm text-[#666666] mt-1.5">{response.message}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <DemandRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        onCreated={reload}
      />
    </div>
  );
}
