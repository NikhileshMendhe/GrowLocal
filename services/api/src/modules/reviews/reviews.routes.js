import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './reviews.controller.js';
import {
  createReviewSchema,
  listReviewsSchema,
  reportReviewSchema,
  idParamSchema,
} from './reviews.validation.js';

// §6.8
const router = Router();

router.get('/', validate(listReviewsSchema, 'query'), controller.listReviews);
router.post(
  '/',
  authenticate,
  requireRole('customer'),
  validate(createReviewSchema),
  controller.createReview
);
router.get(
  '/mine',
  authenticate,
  requireRole('customer'),
  validate(listReviewsSchema, 'query'),
  controller.listMine
);
router.post(
  '/:id/report',
  authenticate,
  requireRole('customer'),
  validate(idParamSchema, 'params'),
  validate(reportReviewSchema),
  controller.reportReview
);

export default router;
