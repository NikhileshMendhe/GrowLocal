import { asyncHandler } from '../../utils/asyncHandler.js';
import * as uploadsService from './uploads.service.js';

export const presign = asyncHandler(async (req, res) => {
  const upload = await uploadsService.presign(req.auth, req.body);
  res.json({ upload });
});
