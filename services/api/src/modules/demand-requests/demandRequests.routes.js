import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './demandRequests.controller.js';
import {
  createDemandRequestSchema,
  listMineSchema,
  nearbySchema,
  idParamSchema,
} from './demandRequests.validation.js';

// §6.8
const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('customer'),
  validate(createDemandRequestSchema),
  controller.createDemandRequest
);
router.get(
  '/mine',
  authenticate,
  requireRole('customer'),
  validate(listMineSchema, 'query'),
  controller.listMine
);
router.get(
  '/nearby',
  authenticate,
  validate(nearbySchema, 'query'),
  controller.listNearby
);
router.get(
  '/:id',
  authenticate,
  validate(idParamSchema, 'params'),
  controller.getDemandRequest
);
router.get(
  '/:id/responses',
  authenticate,
  validate(idParamSchema, 'params'),
  controller.listResponses
);

export default router;
