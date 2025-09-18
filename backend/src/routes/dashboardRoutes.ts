// backend/src/routes/dashboardRoutes.ts
import express from 'express';
import {
  getDashboardStats,
  getTherapyAttendance,
  getStudentAgeDistribution,
  getTherapistWorkload,
  getMostFrequentTherapies,
  getSessionComparison,
  getTherapistAttendance,
} from '../controllers/dashboardController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/therapy-attendance', protect, isAdmin, getTherapyAttendance);
router.get('/student-age-distribution', protect, isAdmin, getStudentAgeDistribution);
router.get('/therapist-workload', protect, isAdmin, getTherapistWorkload);
router.get('/most-frequent-therapies', protect, isAdmin, getMostFrequentTherapies);
router.get('/session-comparison', protect, isAdmin, getSessionComparison);
router.get('/therapist-attendance/:therapistId', protect, isAdmin, getTherapistAttendance);

export default router;