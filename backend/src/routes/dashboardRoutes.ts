// backend/src/routes/dashboardRoutes.ts
import express from 'express';
import { getDashboardStats, getTherapyAttendance } from '../controllers/dashboardController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/therapy-attendance', protect, isAdmin, getTherapyAttendance);

export default router;