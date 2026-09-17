import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as demandRequestsService from './demandRequests.service.js';

export const createDemandRequest = asyncHandler(async (req, res) => {
  const demandRequest = await demandRequestsService.createDemandRequest(req.auth, req.body);
  res.status(201).json({ demandRequest });
});

export const listMine = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await demandRequestsService.listMine(req.auth, {
    status: req.query.status,
    limit,
    offset,
  });
  res.json({ demandRequests: rows, total, limit, offset });
});

export const listNearby = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await demandRequestsService.listNearby({
    lat: req.query.lat,
    lng: req.query.lng,
    radiusKm: req.query.radiusKm,
    limit,
    offset,
  });
  res.json({ demandRequests: rows, total, limit, offset });
});

export const getDemandRequest = asyncHandler(async (req, res) => {
  const demandRequest = await demandRequestsService.getDemandRequest(req.params.id, req.auth);
  res.json({ demandRequest });
});

export const listResponses = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await demandRequestsService.listResponses(req.params.id, req.auth, {
    limit,
    offset,
  });
  res.json({ responses: rows, total, limit, offset });
});
