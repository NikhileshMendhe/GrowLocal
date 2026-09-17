import { asyncHandler } from '../../utils/asyncHandler.js';
import * as categoriesService from './categories.service.js';

export const list = asyncHandler(async (req, res) => {
  const categories = await categoriesService.list(req.auth);
  res.json({ categories });
});

export const getById = asyncHandler(async (req, res) => {
  const category = await categoriesService.getById(req.params.id);
  res.json({ category });
});

export const create = asyncHandler(async (req, res) => {
  const category = await categoriesService.create(req.body);
  res.status(201).json({ category });
});

export const update = asyncHandler(async (req, res) => {
  const category = await categoriesService.update(req.params.id, req.body);
  res.json({ category });
});

export const remove = asyncHandler(async (req, res) => {
  await categoriesService.remove(req.params.id);
  res.status(204).send();
});
