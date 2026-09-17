import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './subscriptions.controller.js';
import { subscribeSchema, listPlansSchema } from './subscriptions.validation.js';

const router = Router();

router.get('/plans', validate(listPlansSchema, 'query'), controller.listPlans);
router.get('/me', authenticate, requireRole('merchant'), controller.getMySubscription);
router.post('/', authenticate, requireRole('merchant'), validate(subscribeSchema), controller.subscribe);

export default router;
