// backend/src/routes/guardianRoutes.ts
import express from 'express';
import { getAllGuardians, updateGuardian, deleteGuardian } from '../controllers/guardianController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllGuardians);

export default router;