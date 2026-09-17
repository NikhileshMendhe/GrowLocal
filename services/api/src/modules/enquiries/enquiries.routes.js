import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './enquiries.controller.js';
import {
  idParamSchema,
  createEnquirySchema,
  updateEnquiryStatusSchema,
  listEnquiriesSchema,
} from './enquiries.validation.js';

/**
 * Only router.get/post/patch/delete(path, [middleware...], controllerFn).
 * No logic here (§4.1). Paths per packages/api-client/src/endpoints.js (§6.6).
 */
const router = Router();

router.post('/', authenticate, requireRole('customer'), validate(createEnquirySchema), controller.create);
router.get('/mine', authenticate, requireRole('customer'), validate(listEnquiriesSchema, 'query'), controller.listMine);
router.get('/shop', authenticate, requireRole('merchant'), validate(listEnquiriesSchema, 'query'), controller.listForShop);
router.patch('/:id/status', authenticate, requireRole('customer', 'merchant'), validate(idParamSchema, 'params'), validate(updateEnquiryStatusSchema), controller.updateStatus);

export default router;
