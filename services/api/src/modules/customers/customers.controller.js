import { asyncHandler } from '../../utils/asyncHandler.js';
import * as customersService from './customers.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const customer = await customersService.getProfile(req.auth.id);
  res.json({ customer });
});

export const updateMe = asyncHandler(async (req, res) => {
  const customer = await customersService.updateProfile(req.auth.id, req.body);
  res.json({ customer });
});
