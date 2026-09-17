import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import * as controller from './creators.controller.js';
import { listCreatorsSchema } from './creators.validation.js';

const router = Router();

router.get('/', validate(listCreatorsSchema, 'query'), controller.list);
router.get('/:id', controller.getById);

export default router;
