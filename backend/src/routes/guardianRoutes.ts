// backend/src/routes/guardianRoutes.ts
import express from 'express';
import {
  getAllGuardians,
  updateGuardian,
  deleteGuardian,
  getGuardianById,
  reactivateGuardian,
  exportGuardians,
} from '../controllers/guardianController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllGuardians);
router.get('/export/download', protect, exportGuardians);
router.get('/:id', protect, getGuardianById);
router.put('/:id', protect, updateGuardian);
router.delete('/:id', protect, deleteGuardian);
router.patch('/:id/reactivate', protect, reactivateGuardian);


export default router;
