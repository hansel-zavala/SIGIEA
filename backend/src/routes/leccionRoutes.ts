// backend/src/routes/leccionRoutes.ts
import express from 'express';
import {
    createLeccion,
    getAllLecciones,
    getLeccionById,
    updateLeccion,
    deleteLeccion,
    activateLeccion,
    exportLecciones
} from '../controllers/leccionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

router.post('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.CREATE_LECCIONES }
]), createLeccion);
router.get('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_LECCIONES }
]), getAllLecciones);
router.get('/export/download', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_LECCIONES }
]), exportLecciones);
router.get('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_LECCIONES }
]), getLeccionById);
router.put('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EDIT_LECCIONES }
]), updateLeccion);
router.delete('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.DELETE_LECCIONES }
]), deleteLeccion);
router.patch('/:id/activate', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.DELETE_LECCIONES }
]), activateLeccion);

export default router;
