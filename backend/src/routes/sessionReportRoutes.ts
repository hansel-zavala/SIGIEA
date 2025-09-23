// backend/src/routes/sessionReportRoutes.ts
import express from 'express';
import { getSessionReport } from '../controllers/sessionReportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

// Permit roles and permissions; resource ownership is enforced inside the controller
router.get(
  '/',
  protect,
  authorize([
    { role: [Role.ADMIN] },
    { role: [Role.THERAPIST], permission: PermissionType.VIEW_REPORTS },
    { role: [Role.THERAPIST], permission: PermissionType.MANAGE_SESSIONS },
    { role: [Role.PARENT] },
  ]),
  getSessionReport
);

export default router;