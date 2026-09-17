import React, { useState } from 'react';
import { ENDPOINTS } from '@growlocal/api-client';
import { Check, Crown, Sparkles } from 'lucide-react';
import { api } from '../lib/apiClient';
import { formatDate, formatINR, SUBSCRIPTION_STATUS_META } from '../lib/format';
import { useAsync } from '../hooks/useAsync';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, PageLoader } from '../components/ui';

export default function Subscription() {
  const toast = useToast();
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);

  const subscriptionQuery = useAsync(() => api.get(ENDPOINTS.SUBSCRIPTIONS.ME), []);
  const plansQuery = useAsync(() => api.get(ENDPOINTS.SUBSCRIPTIONS.PLANS, { query: { limit: 50 } }), []);

  const subscription = subscriptionQuery.data?.subscription ?? null;
  const plans = plansQuery.data?.plans ?? [];

  async function subscribe(planId, planName) {
    setSubscribingPlanId(planId);
    try {
      await api.post(ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, { planId });
      toast(`Subscribed to the ${planName} plan`);
      subscriptionQuery.reload();
    } catch (err) {
      toast(err.message || 'Could not change your subscription', 'error');
    } finally {
      setSubscribingPlanId(null);
    }
  }

  if (subscriptionQuery.loading || plansQuery.loading) return <PageLoader label="Loading subscription…" />;
  if (subscriptionQuery.error) return <ErrorState error={subscriptionQuery.error} onRetry={subscriptionQuery.reload} />;
  if (plansQuery.error) return <ErrorState error={plansQuery.error} onRetry={plansQuery.reload} />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">Subscription</h1>
        <p className="text-sm text-[#666666] mt-0.5">Your GrowLocal merchant plan and available upgrades.</p>
      </div>

      {subscription ? (
        <section className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-[#111111] font-[Poppins,sans-serif]">
                  {subscription.plan?.name || 'Current plan'}
                </h2>
                <StatusBadge meta={SUBSCRIPTION_STATUS_META[subscription.status]} />
              </div>
              <p className="text-sm text-[#666666] mt-1">
                {formatINR(subscription.plan?.price)} per {subscription.plan?.billing_interval || 'month'}
                {subscription.expires_at ? ` · renews or expires ${formatDate(subscription.expires_at)}` : ''}
              </p>
              {Array.isArray(subscription.plan?.features) && subscription.plan.features.length > 0 && (
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[#111111]">
                      <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white border border-[#E5E7E5] rounded-2xl card-shadow">
          <EmptyState
            icon={Sparkles}
            title="No active subscription"
            description="Pick a plan below to unlock GrowLocal merchant features."
          />
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-[#111111] mb-3">Available plans</h2>
        {plans.length === 0 ? (
          <EmptyState
            icon={Crown}
            title="No plans available"
            description="Plans will appear here once the GrowLocal team publishes them."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((plan) => {
              const isCurrent = subscription?.plan?.id === plan.id;
              return (
                <article
                  key={plan.id}
                  className={`bg-white border rounded-2xl card-shadow p-5 flex flex-col gap-3 ${
                    isCurrent ? 'border-brand ring-2 ring-[#EAF7EE]' : 'border-[#E5E7E5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-[#111111] font-[Poppins,sans-serif]">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-brand bg-brand-light px-2 py-0.5 rounded-full">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-[#111111]">
                    {formatINR(plan.price)}
                    <span className="text-xs font-medium text-[#666666]"> / {plan.billing_interval || 'month'}</span>
                  </p>
                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <ul className="flex flex-col gap-1.5 flex-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-[#666666]">
                          <Check className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={() => subscribe(plan.id, plan.name)}
                    disabled={isCurrent || subscribingPlanId !== null}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-brand-light text-brand cursor-default'
                        : 'bg-brand text-white hover:bg-brand-hover disabled:opacity-60'
                    }`}
                  >
                    {isCurrent
                      ? 'Your current plan'
                      : subscribingPlanId === plan.id
                        ? 'Subscribing…'
                        : 'Choose this plan'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
