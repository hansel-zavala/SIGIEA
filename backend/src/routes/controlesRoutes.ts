// backend/src/routes/controlesRoutes.ts

import express from 'express';
import {
  getTherapistsWithPermissions,
  updateTherapistPermissions,
  getDefaultPermissions
} from '../controllers/controlesController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role } from '@prisma/client';

const router = express.Router();

// All routes require admin
router.use(protect);
router.use(authorize({ role: [Role.ADMIN] }));

router.get('/therapists', getTherapistsWithPermissions);
router.put('/therapists/:therapistId/permissions', updateTherapistPermissions);
router.get('/permissions/default', getDefaultPermissions);

export default router;