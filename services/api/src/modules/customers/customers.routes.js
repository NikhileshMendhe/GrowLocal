import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './customers.controller.js';
import { updateCustomerSchema } from './customers.validation.js';

const router = Router();

router.get('/me', authenticate, requireRole('customer'), controller.getMe);
router.patch('/me', authenticate, requireRole('customer'), validate(updateCustomerSchema), controller.updateMe);

export default router;
