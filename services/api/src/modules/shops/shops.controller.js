import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as shopsService from './shops.service.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await shopsService.listShops(req.query, { limit, offset });
  res.json({ shops: rows, total, limit, offset });
});

export const getById = asyncHandler(async (req, res) => {
  const shop = await shopsService.getShop(req.params.id);
  res.json({ shop });
});

export const listProducts = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await shopsService.listShopProducts(req.params.id, req.query, {
    limit,
    offset,
  });
  res.json({ products: rows, total, limit, offset });
});

export const create = asyncHandler(async (req, res) => {
  const shop = await shopsService.createShop(req.auth.id, req.body);
  res.status(201).json({ shop });
});

export const update = asyncHandler(async (req, res) => {
  const shop = await shopsService.updateShop(req.auth.id, req.params.id, req.body);
  res.json({ shop });
});

export const remove = asyncHandler(async (req, res) => {
  await shopsService.deleteShop(req.params.id);
  res.status(204).send();
});
