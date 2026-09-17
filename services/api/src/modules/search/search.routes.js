import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import * as controller from './search.controller.js';
import {
  runSearchSchema,
  popularSearchesSchema,
  demandGapsSchema,
} from './search.validation.js';

// §6.8
const router = Router();

router.post('/', validate(runSearchSchema), controller.run);
router.get('/popular', validate(popularSearchesSchema, 'query'), controller.popular);
router.get('/demand-gaps', validate(demandGapsSchema, 'query'), controller.demandGaps);

export default router;
