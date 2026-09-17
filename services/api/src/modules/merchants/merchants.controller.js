import { asyncHandler } from '../../utils/asyncHandler.js';
import * as merchantsService from './merchants.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const merchant = await merchantsService.getProfile(req.auth.id);
  res.json({ merchant });
});

export const updateMe = asyncHandler(async (req, res) => {
  const merchant = await merchantsService.updateProfile(req.auth.id, req.body);
  res.json({ merchant });
});

export const getMyShop = asyncHandler(async (req, res) => {
  const shop = await merchantsService.getMyShop(req.auth.id);
  res.json({ shop });
});

export const updateMyShop = asyncHandler(async (req, res) => {
  const shop = await merchantsService.updateMyShop(req.auth.id, req.body);
  res.json({ shop });
});
