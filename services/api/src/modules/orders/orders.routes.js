import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './orders.controller.js';
import {
  idParamSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersSchema,
} from './orders.validation.js';

/**
 * Only router.get/post/patch/delete(path, [middleware...], controllerFn).
 * No logic here (§4.1). Paths per packages/api-client/src/endpoints.js (§6.5).
 */
const router = Router();

router.post('/', authenticate, requireRole('customer'), validate(createOrderSchema), controller.create);
router.get('/mine', authenticate, requireRole('customer'), validate(listOrdersSchema, 'query'), controller.listMine);
router.get('/shop', authenticate, requireRole('merchant'), validate(listOrdersSchema, 'query'), controller.listForShop);
router.get('/:id', authenticate, requireRole('customer', 'merchant'), validate(idParamSchema, 'params'), controller.getOrder);
router.patch('/:id/status', authenticate, requireRole('merchant'), validate(idParamSchema, 'params'), validate(updateOrderStatusSchema), controller.updateStatus);
// §6.5 documents PATCH cancel; POST is also accepted so both client shapes work
router.post('/:id/cancel', authenticate, requireRole('customer'), validate(idParamSchema, 'params'), controller.cancel);
router.patch('/:id/cancel', authenticate, requireRole('customer'), validate(idParamSchema, 'params'), controller.cancel);

export default router;
