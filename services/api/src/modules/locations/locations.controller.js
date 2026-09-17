import { asyncHandler } from '../../utils/asyncHandler.js';
import * as locationsService from './locations.service.js';

export const list = asyncHandler(async (req, res) => {
  const locations = await locationsService.list(req.auth);
  res.json({ locations });
});

export const getById = asyncHandler(async (req, res) => {
  const location = await locationsService.getById(req.params.id);
  res.json({ location });
});

export const create = asyncHandler(async (req, res) => {
  const location = await locationsService.create(req.body);
  res.status(201).json({ location });
});

export const update = asyncHandler(async (req, res) => {
  const location = await locationsService.update(req.params.id, req.body);
  res.json({ location });
});

export const remove = asyncHandler(async (req, res) => {
  await locationsService.remove(req.params.id);
  res.status(204).send();
});
