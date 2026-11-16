import { ForbiddenError } from '../errors/AppError.js';

/**
 * Ownership helpers — authorization check #2 of the always-both pattern (§7.3).
 * Called from controllers/services once the target row is loaded.
 * "Whose data is this" is ALWAYS derived from req.auth (set by the verified
 * JWT), never from a client-supplied merchantId/customerId body field.
 */

export function assertOwnership(actualOwnerId, authId, message = 'You do not own this resource') {
  if (actualOwnerId !== authId) {
    throw new ForbiddenError(message);
  }
}

export function assertOwnsShop(shop, merchantId) {
  if (!shop || shop.merchant_id !== merchantId) {
    throw new ForbiddenError('You do not own this shop');
  }
}

export function assertOwnsOrder(order, auth) {
  if (!order) throw new ForbiddenError('Order not found');
  if (auth.type === 'admin') return;
  if (auth.type === 'customer' && order.customer_id !== auth.id) {
    throw new ForbiddenError('You do not own this order');
  }
  if (auth.type === 'merchant' && order.merchant_id !== auth.id) {
    throw new ForbiddenError('This order does not belong to your shop');
  }
}

export function assertOwnsConversation(conversation, auth) {
  if (!conversation) throw new ForbiddenError('Conversation not found');
  const isParticipant =
    (auth.type === 'customer' && conversation.customer_id === auth.id) ||
    (auth.type === 'merchant' && conversation.merchant_id === auth.id) ||
    auth.type === 'admin';
  if (!isParticipant) {
    throw new ForbiddenError('You are not a participant in this conversation');
  }
}
