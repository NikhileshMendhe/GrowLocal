import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as savedShopsService from './savedShops.service.js';

export const listMine = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await savedShopsService.listMine(req.auth, { limit, offset });
  res.json({ savedShops: rows, total, limit, offset });
});

export const saveShop = asyncHandler(async (req, res) => {
  const { savedShop, created } = await savedShopsService.saveShop(req.auth, req.params.shopId);
  if (created) return res.status(201).json({ savedShop });
  return res.json({ savedShop });
});

export const removeShop = asyncHandler(async (req, res) => {
  await savedShopsService.removeShop(req.auth, req.params.shopId);
  res.status(204).send();
});
