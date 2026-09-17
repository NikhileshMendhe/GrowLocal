import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './payments.controller.js';
import { createPaymentSchema, listPaymentsSchema } from './payments.validation.js';

const router = Router();

router.get('/mine', authenticate, requireRole('customer', 'merchant'), validate(listPaymentsSchema, 'query'), controller.listMine);
router.post('/', authenticate, requireRole('customer', 'merchant'), validate(createPaymentSchema), controller.create);

export default router;
