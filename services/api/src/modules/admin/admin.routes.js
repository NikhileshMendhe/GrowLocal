import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './admin.controller.js';
import {
  listAuditLogsSchema,
  listShopsSchema,
  listMerchantsSchema,
  listCustomersSchema,
  listProductsSchema,
  listVerificationsSchema,
  shopStatusSchema,
  merchantStatusSchema,
  customerStatusSchema,
  productApprovalSchema,
  verificationReviewSchema,
} from './admin.validation.js';

const router = Router();

// Every admin route requires the admin role (§7.3 check #1).
const guard = [authenticate, requireRole('admin')];

router.get('/dashboard', ...guard, controller.dashboard);
router.get('/audit-logs', ...guard, validate(listAuditLogsSchema, 'query'), controller.listAuditLogs);
router.get('/shops', ...guard, validate(listShopsSchema, 'query'), controller.listShops);
router.patch('/shops/:id/status', ...guard, validate(shopStatusSchema), controller.setShopStatus);
router.get('/shop-verifications', ...guard, validate(listVerificationsSchema, 'query'), controller.listVerifications);
router.patch('/shop-verifications/:id', ...guard, validate(verificationReviewSchema), controller.reviewVerification);
router.get('/products', ...guard, validate(listProductsSchema, 'query'), controller.listProducts);
router.patch('/products/:id/approval', ...guard, validate(productApprovalSchema), controller.setProductApproval);
router.get('/merchants', ...guard, validate(listMerchantsSchema, 'query'), controller.listMerchants);
router.patch('/merchants/:id/status', ...guard, validate(merchantStatusSchema), controller.setMerchantStatus);
router.get('/customers', ...guard, validate(listCustomersSchema, 'query'), controller.listCustomers);
router.patch('/customers/:id/status', ...guard, validate(customerStatusSchema), controller.setCustomerStatus);

export default router;
