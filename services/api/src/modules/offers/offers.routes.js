import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './offers.controller.js';
import {
  idParamSchema,
  createOfferSchema,
  acceptOfferSchema,
  listOffersSchema,
} from './offers.validation.js';

/**
 * Only router.get/post/patch/delete(path, [middleware...], controllerFn).
 * No logic here (§4.1). Paths per packages/api-client/src/endpoints.js (§6.6);
 * GET /offers (role-aware list, mirroring GET /conversations §6.7) is extra.
 */
const router = Router();

router.post('/', authenticate, requireRole('merchant'), validate(createOfferSchema), controller.create);
router.get('/', authenticate, requireRole('customer', 'merchant'), validate(listOffersSchema, 'query'), controller.list);
router.get('/:id', authenticate, requireRole('customer', 'merchant'), validate(idParamSchema, 'params'), controller.getOffer);
router.post('/:id/accept', authenticate, requireRole('customer'), validate(idParamSchema, 'params'), validate(acceptOfferSchema), controller.accept);
router.post('/:id/reject', authenticate, requireRole('customer'), validate(idParamSchema, 'params'), controller.reject);

export default router;
