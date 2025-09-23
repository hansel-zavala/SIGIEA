import express from 'express';
import {
    getAllTherapists,
    createTherapist,
    getTherapistById,
    updateTherapist,
    deleteTherapist,
    reactivateTherapist,
    exportTherapists,
    exportAssignedStudents
} from '../controllers/therapistController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, isParentOfTherapistsAssignedToChild } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

router.get('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_THERAPISTS }
]), getAllTherapists);
router.get('/export/download', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_THERAPISTS }
]), exportTherapists);
router.get('/:id/export-students', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_THERAPISTS }
]), exportAssignedStudents);
router.post('/', protect, authorize({ role: [Role.ADMIN], permission: PermissionType.CREATE_THERAPISTS }), createTherapist);
router.get('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_THERAPISTS },
  // Allow PARENT only if the therapist is assigned to at least one of their children
  { role: [Role.PARENT], resourceOwnerCheck: isParentOfTherapistsAssignedToChild }
]), getTherapistById);
router.put('/:id', protect, authorize({ role: [Role.ADMIN], permission: PermissionType.EDIT_THERAPISTS }), updateTherapist);
router.delete('/:id', protect, authorize({ role: [Role.ADMIN], permission: PermissionType.DELETE_THERAPISTS }), deleteTherapist);
router.patch('/:id/reactivate', protect, authorize({ role: [Role.ADMIN], permission: PermissionType.DELETE_THERAPISTS }), reactivateTherapist);

export default router;
