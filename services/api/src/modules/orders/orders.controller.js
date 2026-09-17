import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as ordersService from './orders.service.js';

/**
 * Controllers pull data off req, call exactly ONE service method, and send
 * the HTTP response (§4.1). No SQL, no business rules.
 */

export const create = asyncHandler(async (req, res) => {
  const order = await ordersService.createOrder(req.auth.id, req.body);
  res.status(201).json({ order });
});

export const listMine = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await ordersService.listMine(req.auth.id, {
    status: req.query.status,
    limit,
    offset,
  });
  res.json({ orders: rows, total, limit, offset });
});

export const listForShop = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await ordersService.listForMerchant(req.auth.id, {
    status: req.query.status,
    limit,
    offset,
  });
  res.json({ orders: rows, total, limit, offset });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await ordersService.getOrder(req.params.id, req.auth);
  res.json({ order });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await ordersService.updateStatus(req.params.id, req.auth.id, req.body.status);
  res.json({ order });
});

export const cancel = asyncHandler(async (req, res) => {
  const order = await ordersService.cancelOrder(req.params.id, req.auth.id);
  res.json({ order });
});
