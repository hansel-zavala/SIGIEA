// backend/src/routes/studentRoutes.ts
import express from 'express';
import {
    createStudent, 
    getAllStudents, 
    getStudentById, 
    updateStudent, 
    deleteStudent,
    reactivateStudent,
    addGuardianToStudent,
    exportStudents
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, isStudentTherapist, isParentOfStudent } from '../middleware/authorizeMiddleware.js';
import { PermissionType, Role } from '@prisma/client';
import therapySessionRoutes from './therapySessionRoutes.js';

const router = express.Router();

router.post('/', protect, authorize({ role: [Role.ADMIN] }), createStudent);
router.get('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST] },
  { role: [Role.PARENT] }
]), getAllStudents);
router.get('/export/download', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST] },
  { role: [Role.PARENT] }
]), exportStudents);
router.get('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], resourceOwnerCheck: isStudentTherapist },
  { role: [Role.PARENT], resourceOwnerCheck: isParentOfStudent }
]), getStudentById);
router.put('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EDIT_STUDENTS, resourceOwnerCheck: isStudentTherapist }
]), updateStudent);
router.delete('/:id', protect, authorize({ role: [Role.ADMIN] }), deleteStudent);
router.patch('/:id/reactivate', protect, authorize({ role: [Role.ADMIN] }), reactivateStudent);
router.post('/:id/guardians', protect, authorize({ role: [Role.ADMIN] }), addGuardianToStudent);
router.use('/:studentId/sessions', therapySessionRoutes);

export default router;
