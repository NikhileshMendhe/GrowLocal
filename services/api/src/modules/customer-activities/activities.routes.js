import { Router } from 'express';
import { optionalAuthenticate, authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';
import * as controller from './activities.controller.js';

const router = Router();

// Public / customer activity logging endpoint
router.post('/', optionalAuthenticate, controller.log);

// Admin-only listing endpoint
router.get('/admin', authenticate, requireRole('admin'), controller.listAdmin);

export default router;
