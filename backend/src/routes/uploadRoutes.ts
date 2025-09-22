// backend/src/routes/uploadRoutes.ts
import express from 'express';
import { upload, uploadFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { PermissionType } from '@prisma/client';

const router = express.Router();

router.post('/', protect, authorize([{ permission: PermissionType.UPLOAD_FILES }]), upload.single('file'), uploadFile);

export default router;