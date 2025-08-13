// backend/src/routes/uploadRoutes.ts
import express from 'express';
import { upload, uploadFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Esta ruta usa dos middlewares: 'protect' para seguridad, y 'upload.single'
// que procesa un solo archivo que venga en el campo llamado 'file'.
router.post('/', protect, upload.single('file'), uploadFile);

export default router;