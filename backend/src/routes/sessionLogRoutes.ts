// backend/src/routes/sessionLogRoutes.ts
import express from 'express';
import { createSessionLog } from '../controllers/sessionLogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', protect, createSessionLog);

export default router;