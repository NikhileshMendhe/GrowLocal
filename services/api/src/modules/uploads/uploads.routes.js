import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './uploads.controller.js';
import { presignSchema } from './uploads.validation.js';

const router = Router();

router.post('/presign', authenticate, validate(presignSchema), controller.presign);

export default router;
