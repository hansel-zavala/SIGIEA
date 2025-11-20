// backend/src/routes/therapistRoutes.ts
import express from 'express';
import {
    createTherapist,
    getAllTherapists,
    getTherapistById,
    updateTherapist,
    deleteTherapist,
    reactivateTherapist,
    exportTherapists,
    exportAssignedStudents
} from '../controllers/therapistController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

import { validate } from '../middleware/validationMiddleware.js';
import { 
  validateCreateTherapist, 
  validateUpdateTherapist, 
  validateTherapistId, 
  validateListTherapists,
  validateExport
} from '../validators/therapistValidator.js';

const router = express.Router();

router.use(protect);

const manageAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_USERS }
]);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_THERAPISTS },
  { role: [Role.PARENT] }
]);

const exportAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_THERAPISTS }
]);

router.get('/', 
  viewAuth, 
  validateListTherapists, 
  validate, 
  getAllTherapists
);

router.get('/export/download', 
  exportAuth, 
  validateExport,
  validate, 
  exportTherapists
);

router.post('/', 
  manageAuth, 
  validateCreateTherapist, 
  validate, 
  createTherapist
);

router.get('/:id', 
  viewAuth, 
  validateTherapistId, 
  validate, 
  getTherapistById
);

router.put('/:id', 
  manageAuth, 
  validateUpdateTherapist, 
  validate, 
  updateTherapist
);

router.delete('/:id', 
  manageAuth,
  validateTherapistId, 
  validate, 
  deleteTherapist
);

router.patch('/:id/reactivate', 
  manageAuth, 
  validateTherapistId, 
  validate, 
  reactivateTherapist
);

router.get('/:id/students/export', 
  exportAuth, 
  validateTherapistId, 
  validateExport,
  validate, 
  exportAssignedStudents
);

export default router;