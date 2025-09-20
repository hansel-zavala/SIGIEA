// backend/src/routes/documentRoutes.ts
import express from 'express';
import {
  createDocument,
  deleteDocument,
  documentUpload,
  downloadDocument,
  listDocuments,
} from '../controllers/documentController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listDocuments);
router.post('/', protect, documentUpload.single('file'), createDocument);
router.get('/:id/download', protect, downloadDocument);
router.delete('/:id', protect, isAdmin, deleteDocument);

export default router;
