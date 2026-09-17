import * as repository from './subscriptions.repository.js';
import { NotFoundError, ValidationError } from '../../errors/AppError.js';

const INTERVALS = { day: '1 day', week: '1 week', month: '1 month', year: '1 year' };

function withPlan(row) {
  if (!row) return null;
  const { plan_name, plan_price, plan_billing_interval, plan_features, ...subscription } = row;
  return {
    ...subscription,
    plan: {
      id: subscription.plan_id,
      name: plan_name,
      price: plan_price,
      billing_interval: plan_billing_interval,
      features: plan_features,
    },
  };
}

export async function listPlans({ limit, offset }) {
  return repository.listActivePlans({ limit, offset });
}

export async function getMySubscription(merchantId) {
  return withPlan(await repository.findCurrentByMerchantId(merchantId));
}

// No payment gateway in phase 3 — subscribing only records the state (§11).
export async function subscribe(merchantId, { planId }) {
  const plan = await repository.findPlanById(planId);
  if (!plan) throw new NotFoundError('Subscription plan not found');
  if (!plan.is_active) throw new ValidationError('Subscription plan is not active');

  await repository.replaceSubscription({
    merchantId,
    planId,
    interval: INTERVALS[plan.billing_interval] || INTERVALS.month,
  });
  return getMySubscription(merchantId);
}
