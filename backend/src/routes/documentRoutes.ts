// backend/src/routes/documentRoutes.ts
import express from 'express';
import {
  createDocument,
  deleteDocument,
  documentUpload,
  downloadDocument,
  listDocuments,
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

router.get('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_DOCUMENTS }
]), listDocuments);
router.post('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_DOCUMENTS }
]), documentUpload.single('file'), createDocument);
router.get('/:id/download', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_DOCUMENTS }
]), downloadDocument);
router.delete('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_DOCUMENTS }
]), deleteDocument);

export default router;
