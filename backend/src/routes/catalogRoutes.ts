// backend/src/routes/controlesRoutes.ts
import express from 'express';
import { getAllControls } from '../services/catalogService.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

const auth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_CONTROLS }
]);

router.get('/', protect, auth, getAllControls);

export default router;