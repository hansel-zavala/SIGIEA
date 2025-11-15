// backend-src/routes/dashboardRoutes.ts
import express from 'express';
import {
  getDashboardStats,
  getTherapyAttendance,
  getStudentAgeDistribution,
  getTherapistWorkload,
  getMostFrequentTherapies,
  getSessionComparison,
  getGenderDistribution,
  getStudentBirthDepartmentDistribution,
  getTherapistAttendanceTrends,
  getTherapistAttendanceById
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

router.use(protect);

const auth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]);

router.get('/stats', auth, getDashboardStats);
router.get('/therapy-attendance', auth, getTherapyAttendance);
router.get('/student-age-distribution', auth, getStudentAgeDistribution);
router.get('/therapist-workload', auth, getTherapistWorkload);
router.get('/most-frequent-therapies', auth, getMostFrequentTherapies);
router.get('/session-comparison', auth, getSessionComparison);
router.get('/gender-distribution', auth, getGenderDistribution);
router.get('/student-birth-department-distribution', auth, getStudentBirthDepartmentDistribution);
router.get('/therapist-attendance-trends', auth, getTherapistAttendanceTrends);
router.get('/therapist-attendance/:id', auth, getTherapistAttendanceById);

export default router;