import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as notificationsService from './notifications.service.js';

export const listMine = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await notificationsService.listForRecipient(req.auth, {
    unreadOnly: req.query.unreadOnly === true,
    limit,
    offset,
  });
  res.json({ notifications: rows, total, limit, offset });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markRead(req.params.id, req.auth);
  res.json({ notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await notificationsService.markAllRead(req.auth);
  res.json(result);
});
