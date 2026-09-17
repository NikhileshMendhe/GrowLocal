import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as enquiriesService from './enquiries.service.js';

/**
 * Controllers pull data off req, call exactly ONE service method, and send
 * the HTTP response (§4.1). No SQL, no business rules.
 */

export const create = asyncHandler(async (req, res) => {
  const enquiry = await enquiriesService.create(req.auth.id, req.body);
  res.status(201).json({ enquiry });
});

export const listMine = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await enquiriesService.listMine(req.auth.id, {
    status: req.query.status,
    limit,
    offset,
  });
  res.json({ enquiries: rows, total, limit, offset });
});

export const listForShop = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await enquiriesService.listForMerchant(req.auth.id, {
    status: req.query.status,
    limit,
    offset,
  });
  res.json({ enquiries: rows, total, limit, offset });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const enquiry = await enquiriesService.updateStatus(req.params.id, req.auth, req.body.status);
  res.json({ enquiry });
});
