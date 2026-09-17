import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './shops.controller.js';
import {
  createShopSchema,
  updateShopSchema,
  listShopsSchema,
  listShopProductsSchema,
  idParamSchema,
} from './shops.validation.js';

// §6.3 — public shop browsing routes (no auth) + merchant/admin writes.
const router = Router();

router.get('/', validate(listShopsSchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.getById);
router.get(
  '/:id/products',
  validate(idParamSchema, 'params'),
  validate(listShopProductsSchema, 'query'),
  controller.listProducts
);

// §6.3 POST /shops — merchant creates their own shop.
router.post(
  '/',
  authenticate,
  requireRole('merchant'),
  validate(createShopSchema),
  controller.create
);

// §6.3 PATCH /shops/:id — merchant (owner); ownership is checked in the service.
router.patch(
  '/:id',
  authenticate,
  requireRole('merchant'),
  validate(idParamSchema, 'params'),
  validate(updateShopSchema),
  controller.update
);

// §6.3 DELETE /shops/:id — admin only.
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(idParamSchema, 'params'),
  controller.remove
);

export default router;
