// backend/src/routes/leccionRoutes.ts
import express from 'express';
import {
    createLeccion,
    getAllLecciones,
    getLeccionById,
    updateLeccion,
    deleteLeccion,
    activateLeccion,
    exportLecciones
} from '../controllers/leccionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';
import { validate } from '../middleware/validationMiddleware.js';
import {
  validateLeccionBody,
  validateLeccionId,
  validateListLecciones,
  validateExportLecciones
} from '../validators/leccionValidator.js';

const router = express.Router();

router.use(protect);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_LECCIONES }
]);

const createAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.CREATE_LECCIONES }
]);

const editAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EDIT_LECCIONES }
]);

const deleteAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.DELETE_LECCIONES }
]);

const exportAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_LECCIONES }
]);

router.get('/',
  viewAuth,
  validateListLecciones,
  validate,
  getAllLecciones
);

router.post('/',
  createAuth,
  validateLeccionBody,
  validate,
  createLeccion
);

router.get('/export/download',
  exportAuth,
  validateExportLecciones,
  validate,
  exportLecciones
);

router.get('/:id',
  viewAuth,
  validateLeccionId,
  validate,
  getLeccionById
);

router.put('/:id',
  editAuth,
  validateLeccionId,
  validateLeccionBody,
  validate,
  updateLeccion
);

router.delete('/:id',
  deleteAuth,
  validateLeccionId,
  validate,
  deleteLeccion
);

router.patch('/:id/activate',
  deleteAuth,
  validateLeccionId,
  validate,
  activateLeccion
);

export default router;