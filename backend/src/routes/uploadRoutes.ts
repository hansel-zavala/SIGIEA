// backend/src/routes/uploadRoutes.ts
import express from 'express';
import { upload, uploadFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);

export default router;