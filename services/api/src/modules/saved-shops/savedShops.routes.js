import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './savedShops.controller.js';
import { listSavedShopsSchema, shopIdParamSchema } from './savedShops.validation.js';

// §6.8
const router = Router();

router.get(
  '/mine',
  authenticate,
  requireRole('customer'),
  validate(listSavedShopsSchema, 'query'),
  controller.listMine
);
router.put(
  '/:shopId',
  authenticate,
  requireRole('customer'),
  validate(shopIdParamSchema, 'params'),
  controller.saveShop
);
router.delete(
  '/:shopId',
  authenticate,
  requireRole('customer'),
  validate(shopIdParamSchema, 'params'),
  controller.removeShop
);

export default router;
