import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as reviewsService from './reviews.service.js';

export const createReview = asyncHandler(async (req, res) => {
  const { review, shop } = await reviewsService.createReview(req.auth, req.body);
  res.status(201).json({ review, shop });
});

export const listReviews = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await reviewsService.listReviews({
    shopId: req.query.shopId,
    limit,
    offset,
  });
  res.json({ reviews: rows, total, limit, offset });
});

export const listMine = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await reviewsService.listMine(req.auth, { limit, offset });
  res.json({ reviews: rows, total, limit, offset });
});

export const reportReview = asyncHandler(async (req, res) => {
  const report = await reviewsService.reportReview(req.params.id, req.auth, req.body);
  res.status(201).json({ report });
});
