import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import * as controller from './auth.controller.js';
import {
  customerSignupSchema,
  merchantSignupSchema,
  loginSchema,
} from './auth.validation.js';

/**
 * Only router.get/post/patch/delete(path, [middleware...], controllerFn).
 * No logic here (§4.1).
 */
const router = Router();

router.use(authLimiter);

router.post('/customer/signup', validate(customerSignupSchema), controller.customerSignup);
router.post('/customer/login', validate(loginSchema), controller.customerLogin);
router.post('/merchant/signup', validate(merchantSignupSchema), controller.merchantSignup);
router.post('/merchant/login', validate(loginSchema), controller.merchantLogin);
router.post('/admin/login', validate(loginSchema), controller.adminLogin);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

export default router;
