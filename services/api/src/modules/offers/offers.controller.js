import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as offersService from './offers.service.js';

/**
 * Controllers pull data off req, call exactly ONE service method, and send
 * the HTTP response (§4.1). No SQL, no business rules.
 */

export const create = asyncHandler(async (req, res) => {
  const { offer, enquiry } = await offersService.create(req.auth.id, req.body);
  res.status(201).json({ offer, enquiry });
});

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await offersService.list(req.auth, {
    status: req.query.status,
    limit,
    offset,
  });
  res.json({ offers: rows, total, limit, offset });
});

export const getOffer = asyncHandler(async (req, res) => {
  const offer = await offersService.getOffer(req.params.id, req.auth);
  res.json({ offer });
});

export const accept = asyncHandler(async (req, res) => {
  const result = await offersService.acceptOffer(req.auth.id, req.params.id, req.body);
  res.status(201).json(result);
});

export const reject = asyncHandler(async (req, res) => {
  const result = await offersService.rejectOffer(req.auth.id, req.params.id);
  res.json(result);
});
