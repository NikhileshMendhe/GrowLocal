import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './merchants.controller.js';
import { updateMerchantSchema, updateShopSchema } from './merchants.validation.js';

const router = Router();

router.get('/me', authenticate, requireRole('merchant'), controller.getMe);
router.patch('/me', authenticate, requireRole('merchant'), validate(updateMerchantSchema), controller.updateMe);
router.get('/me/shop', authenticate, requireRole('merchant'), controller.getMyShop);
router.patch('/me/shop', authenticate, requireRole('merchant'), validate(updateShopSchema), controller.updateMyShop);

export default router;
