import * as repository from './reviews.repository.js';
import { emitToRooms } from '../../realtime/socket.js';
import { EVENTS } from '../../realtime/events.js';
import { shopRoom } from '../../realtime/rooms.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../../errors/AppError.js';

// §6.8 — one review per customer per shop, only after a delivered order.
// REVIEW_CREATED is emitted to the shop room only AFTER the DB transaction
// commits (§7.5).

export async function createReview(auth, input) {
  const shop = await repository.findShopById(input.shopId);
  if (!shop) throw new NotFoundError('Shop not found');

  if (!(await repository.hasDeliveredOrder(auth.id, input.shopId))) {
    throw new ForbiddenError('You can only review shops where you have a delivered order');
  }
  if (await repository.findExistingReview(auth.id, input.shopId)) {
    throw new ConflictError('You have already reviewed this shop');
  }

  const { review, shop: aggregates } = await repository.createWithShopAggregates({
    customerId: auth.id,
    shopId: input.shopId,
    rating: input.rating,
    reviewText: input.reviewText,
    productId: input.productId,
    orderId: input.orderId,
  });

  emitToRooms(shopRoom(input.shopId), EVENTS.REVIEW_CREATED, review);
  return { review, shop: aggregates };
}

export async function listReviews({ shopId, limit, offset }) {
  return repository.listPublished({ shopId, limit, offset });
}

export async function listMine(auth, { limit, offset }) {
  return repository.listByCustomer({ customerId: auth.id, limit, offset });
}

export async function reportReview(reviewId, auth, { reason }) {
  const review = await repository.findById(reviewId);
  if (!review) throw new NotFoundError('Review not found');
  if (review.customer_id === auth.id) {
    throw new ForbiddenError('You cannot report your own review');
  }
  if (await repository.findReportByReviewAndCustomer(reviewId, auth.id)) {
    throw new ConflictError('You have already reported this review');
  }
  const report = await repository.insertReport({ reviewId, customerId: auth.id, reason });
  return report;
}
