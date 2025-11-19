// backend/src/routes/sessionReportRoutes.ts
import express from 'express';
import { getSessionReport } from '../controllers/sessionReportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';
import { validate } from '../middleware/validationMiddleware.js';
import { validateSessionReportQuery } from '../validators/sessionReportValidator.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize([
    { role: [Role.ADMIN] },
    { role: [Role.THERAPIST], permission: PermissionType.VIEW_REPORTS },
    { role: [Role.THERAPIST], permission: PermissionType.MANAGE_SESSIONS },
    { role: [Role.PARENT] },
  ]),
  validateSessionReportQuery,
  validate,
  getSessionReport
);

export default router;