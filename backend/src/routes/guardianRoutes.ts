// backend/src/routes/guardianRoutes.ts
import express from 'express';
import {
  getAllGuardians,
  updateGuardian,
  deleteGuardian,
  getGuardianById,
  reactivateGuardian,
  exportGuardians,
} from '../controllers/guardianController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, canViewGuardians, canEditGuardians, canDeleteGuardians, canExportGuardians } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

router.get('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_GUARDIANS }
]), getAllGuardians);
router.get('/export/download', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_GUARDIANS }
]), exportGuardians);
router.get('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_GUARDIANS }
]), getGuardianById);
router.put('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EDIT_GUARDIANS }
]), updateGuardian);
router.delete('/:id', protect, authorize({ role: [Role.ADMIN], permission: PermissionType.DELETE_GUARDIANS }), deleteGuardian);
router.patch('/:id/reactivate', protect, authorize({ role: [Role.ADMIN], permission: PermissionType.DELETE_GUARDIANS }), reactivateGuardian);


export default router;
