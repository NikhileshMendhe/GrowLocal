import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as paymentsService from './payments.service.js';

export const create = asyncHandler(async (req, res) => {
  const payment = await paymentsService.recordPayment(req.auth, req.body);
  res.status(201).json({ payment });
});

export const listMine = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await paymentsService.listMine(req.auth, { limit, offset });
  res.json({ payments: rows, total, limit, offset });
});
