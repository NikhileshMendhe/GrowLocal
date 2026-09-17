import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './products.controller.js';
import { authenticateOptional } from './products.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  stockUpdateSchema,
  listProductsSchema,
  idParamSchema,
} from './products.validation.js';

// §6.4 — reads are public (owner-aware via optional auth), writes are
// merchant-only. PUT and PATCH both update (contract uses PATCH, task lists PUT).
const router = Router();

router.get('/', authenticateOptional, validate(listProductsSchema, 'query'), controller.list);
router.get('/:id', authenticateOptional, validate(idParamSchema, 'params'), controller.getById);

router.post(
  '/',
  authenticate,
  requireRole('merchant'),
  validate(createProductSchema),
  controller.create
);

router.patch(
  '/:id/stock',
  authenticate,
  requireRole('merchant'),
  validate(idParamSchema, 'params'),
  validate(stockUpdateSchema),
  controller.updateStock
);

const update = [
  authenticate,
  requireRole('merchant'),
  validate(idParamSchema, 'params'),
  validate(updateProductSchema),
  controller.update,
];
router.put('/:id', ...update);
router.patch('/:id', ...update);

router.delete(
  '/:id',
  authenticate,
  requireRole('merchant'),
  validate(idParamSchema, 'params'),
  controller.remove
);

export default router;
