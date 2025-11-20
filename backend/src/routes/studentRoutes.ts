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
import { validate } from '../middleware/validationMiddleware.js';
import { 
  validateCreateStudent, 
  validateUpdateStudent, 
  validateStudentId, 
  validateAddGuardian,
  validateListStudents 
} from '../validators/studentValidator.js';

const router = express.Router();

router.use(protect);

router.post('/', 
  authorize({ role: [Role.ADMIN] }), 
  validateCreateStudent, 
  validate, 
  createStudent
);

router.get('/', 
  authorize([
    { role: [Role.ADMIN] },
    { role: [Role.THERAPIST], permission: PermissionType.VIEW_STUDENTS },
    { role: [Role.PARENT] }
  ]), 
  validateListStudents,
  validate,
  getAllStudents
);

router.get('/export/download', 
  authorize([
    { role: [Role.ADMIN] },
    { role: [Role.THERAPIST], permission: PermissionType.EXPORT_STUDENTS },
    { role: [Role.PARENT], permission: PermissionType.EXPORT_STUDENTS }
  ]), 
  exportStudents
);

router.get('/:id', 
  authorize([
    { role: [Role.ADMIN] },
    { role: [Role.THERAPIST], resourceOwnerCheck: isStudentTherapist },
    { role: [Role.PARENT], resourceOwnerCheck: isParentOfStudent }
  ]), 
  validateStudentId, 
  validate, 
  getStudentById
);

router.put('/:id', 
  authorize([
    { role: [Role.ADMIN] },
    { role: [Role.THERAPIST], permission: PermissionType.EDIT_STUDENTS, resourceOwnerCheck: isStudentTherapist }
  ]), 
  validateUpdateStudent, 
  validate, 
  updateStudent
);

router.delete('/:id', 
  authorize({ role: [Role.ADMIN], permission: PermissionType.DELETE_STUDENTS }), 
  validateStudentId, 
  validate, 
  deleteStudent
);

router.patch('/:id/reactivate', 
  authorize({ role: [Role.ADMIN], permission: PermissionType.DELETE_STUDENTS }), 
  validateStudentId, 
  validate, 
  reactivateStudent
);

router.post('/:id/guardians', 
  authorize({ role: [Role.ADMIN] }), 
  validateStudentId, 
  validateAddGuardian, 
  validate, 
  addGuardianToStudent
);

router.use('/:studentId/sessions', therapySessionRoutes);

export default router;