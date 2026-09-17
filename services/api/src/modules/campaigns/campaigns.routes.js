import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './campaigns.controller.js';
import {
  createCampaignSchema,
  addCreatorSchema,
  listCampaignsSchema,
} from './campaigns.validation.js';

const router = Router();

router.get('/mine', authenticate, requireRole('merchant'), validate(listCampaignsSchema, 'query'), controller.listMine);
router.post('/', authenticate, requireRole('merchant'), validate(createCampaignSchema), controller.create);
router.get('/:id', authenticate, requireRole('merchant'), controller.getById);
router.get('/:id/creators', authenticate, requireRole('merchant'), controller.listCreators);
router.post('/:id/creators', authenticate, requireRole('merchant'), validate(addCreatorSchema), controller.addCreator);
router.get('/:id/metrics', authenticate, requireRole('merchant'), controller.getMetrics);

export default router;
