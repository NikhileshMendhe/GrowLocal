import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './notifications.controller.js';
import { listNotificationsSchema } from './notifications.validation.js';

const router = Router();

router.get('/mine', authenticate, validate(listNotificationsSchema, 'query'), controller.listMine);
router.patch('/:id/read', authenticate, controller.markRead);
router.patch('/read-all', authenticate, controller.markAllRead);

export default router;
