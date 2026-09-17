import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as campaignsService from './campaigns.service.js';

export const listMine = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await campaignsService.listMine(req.auth.id, { limit, offset });
  res.json({ campaigns: rows, total, limit, offset });
});

export const create = asyncHandler(async (req, res) => {
  const campaign = await campaignsService.createCampaign(req.auth.id, req.body);
  res.status(201).json({ campaign });
});

export const getById = asyncHandler(async (req, res) => {
  const campaign = await campaignsService.getCampaign(req.params.id, req.auth.id);
  res.json({ campaign });
});

export const listCreators = asyncHandler(async (req, res) => {
  const creators = await campaignsService.listCreators(req.params.id, req.auth.id);
  res.json({ creators });
});

export const addCreator = asyncHandler(async (req, res) => {
  const campaignCreator = await campaignsService.addCreator(req.params.id, req.auth.id, req.body);
  res.status(201).json({ campaignCreator });
});

export const getMetrics = asyncHandler(async (req, res) => {
  const metrics = await campaignsService.getMetrics(req.params.id, req.auth.id);
  res.json({ metrics });
});
