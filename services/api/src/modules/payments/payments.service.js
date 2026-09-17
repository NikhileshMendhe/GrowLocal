import * as repository from './payments.repository.js';
import { ForbiddenError, NotFoundError } from '../../errors/AppError.js';

// §7.3: "whose data is this" always derives from req.auth, never from the body.
export async function recordPayment(auth, input) {
  const customerId = auth.type === 'customer' ? auth.id : null;
  const merchantId = auth.type === 'merchant' ? auth.id : null;

  if (input.orderId) {
    const order = await repository.findOrderRef(input.orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (customerId ? order.customer_id !== customerId : order.merchant_id !== merchantId) {
      throw new ForbiddenError('This order is not yours');
    }
  }
  if (input.subscriptionId) {
    const subscription = await repository.findSubscriptionRef(input.subscriptionId);
    if (!subscription) throw new NotFoundError('Subscription not found');
    if (subscription.merchant_id !== merchantId) {
      throw new ForbiddenError('This subscription is not yours');
    }
  }
  if (input.campaignId) {
    const campaign = await repository.findCampaignRef(input.campaignId);
    if (!campaign) throw new NotFoundError('Campaign not found');
    if (campaign.merchant_id !== merchantId) {
      throw new ForbiddenError('This campaign is not yours');
    }
  }

  return repository.insert({ customerId, merchantId, ...input });
}

export async function listMine(auth, { limit, offset }) {
  return repository.listForCaller({ type: auth.type, id: auth.id, limit, offset });
}
