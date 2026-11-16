import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as service from './activities.service.js';

export const log = asyncHandler(async (req, res) => {
  const activity = await service.logActivity(req.auth, req.body);
  res.status(201).json({ activity });
});

export const listAdmin = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const result = await service.listAdminActivities({
    limit,
    offset,
    activityType: req.query.activityType || undefined,
    customerId: req.query.customerId || undefined,
  });
  res.json({ activities: result.rows, total: result.total, limit, offset });
});
