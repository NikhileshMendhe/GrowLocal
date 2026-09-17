import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './conversations.controller.js';
import {
  createConversationSchema,
  listConversationsSchema,
  listMessagesSchema,
  postMessageSchema,
  idParamSchema,
} from './conversations.validation.js';

// §6.7 — participant-scoped threads; MESSAGE_CREATED to conversation:{id} (§7.5)
const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('customer', 'merchant'),
  validate(createConversationSchema),
  controller.createConversation
);
router.get(
  '/',
  authenticate,
  requireRole('customer', 'merchant'),
  validate(listConversationsSchema, 'query'),
  controller.listConversations
);
router.get(
  '/:id',
  authenticate,
  requireRole('customer', 'merchant', 'admin'),
  validate(idParamSchema, 'params'),
  controller.getConversation
);
router.get(
  '/:id/messages',
  authenticate,
  requireRole('customer', 'merchant', 'admin'),
  validate(idParamSchema, 'params'),
  validate(listMessagesSchema, 'query'),
  controller.listMessages
);
router.post(
  '/:id/messages',
  authenticate,
  requireRole('customer', 'merchant'),
  validate(idParamSchema, 'params'),
  validate(postMessageSchema),
  controller.postMessage
);

export default router;
