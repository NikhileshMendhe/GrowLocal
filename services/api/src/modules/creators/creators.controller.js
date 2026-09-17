import { asyncHandler } from '../../utils/asyncHandler.js';
import { parsePagination } from '../../utils/pagination.js';
import * as creatorsService from './creators.service.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { rows, total } = await creatorsService.listCreators({
    category: req.query.category,
    q: req.query.q,
    limit,
    offset,
  });
  res.json({ creators: rows, total, limit, offset });
});

export const getById = asyncHandler(async (req, res) => {
  const creator = await creatorsService.getCreator(req.params.id);
  res.json({ creator });
});
