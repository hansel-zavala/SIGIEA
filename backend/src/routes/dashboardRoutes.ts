// backend/src/routes/dashboardRoutes.ts
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

router.get('/stats', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getDashboardStats);

router.get('/therapy-attendance', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getTherapyAttendance);

router.get('/student-age-distribution', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getStudentAgeDistribution);

router.get('/therapist-workload', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getTherapistWorkload);

router.get('/most-frequent-therapies', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getMostFrequentTherapies);

router.get('/session-comparison', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getSessionComparison);

router.get('/gender-distribution', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getGenderDistribution);

router.get('/student-birth-department-distribution', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getStudentBirthDepartmentDistribution);

router.get('/therapist-attendance-trends', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getTherapistAttendanceTrends);

router.get('/therapist-attendance/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_DASHBOARD },
  { role: [Role.PARENT] }
]), getTherapistAttendanceById);

export default router;