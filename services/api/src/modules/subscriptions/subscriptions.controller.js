import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as subscriptionsService from './subscriptions.service.js';

export const listPlans = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await subscriptionsService.listPlans({ limit, offset });
  res.json({ plans: rows, total, limit, offset });
});

export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionsService.getMySubscription(req.auth.id);
  res.json({ subscription });
});

export const subscribe = asyncHandler(async (req, res) => {
  const subscription = await subscriptionsService.subscribe(req.auth.id, req.body);
  res.status(201).json({ subscription });
});
