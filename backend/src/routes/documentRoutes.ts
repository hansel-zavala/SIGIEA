// src/routes/documentRoutes.ts
import express from 'express';
import {
  listDocuments,
  createDocument,
  downloadDocument,
  deleteDocument,
  documentUpload
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

import { validate } from '../middleware/validationMiddleware.js';
import {
  validateListDocuments,
  validateCreateDocument,
  validateDocumentId
} from '../validators/documentValidator.js';

const router = express.Router();

router.use(protect);

const manageAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_DOCUMENTS }
]);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DOCUMENTS },
  { role: [Role.PARENT] }
]);

router.get('/',
  viewAuth,
  validateListDocuments,
  validate,
  listDocuments
);

router.post('/',
  manageAuth,
  documentUpload.single('file'),
  validateCreateDocument,
  validate,
  createDocument
);

router.get('/:id/download',
  viewAuth,
  validateDocumentId,
  validate,
  downloadDocument
);

router.delete('/:id',
  manageAuth,
  validateDocumentId,
  validate,
  deleteDocument
);

export default router;