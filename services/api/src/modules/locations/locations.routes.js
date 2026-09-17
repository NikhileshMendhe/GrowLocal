import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './locations.controller.js';
import { createLocationSchema, updateLocationSchema } from './locations.validation.js';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authenticate, requireRole('admin'), validate(createLocationSchema), controller.create);
router.patch('/:id', authenticate, requireRole('admin'), validate(updateLocationSchema), controller.update);
router.delete('/:id', authenticate, requireRole('admin'), controller.remove);

export default router;
