// backend/src/routes/reportTemplateRoutes.ts
import express from 'express';
import {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    publishTemplate,
    cloneTemplate,
    updateTemplateMeta,
    updateTemplateFull,
} from '../controllers/reportTemplateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

router.use(protect);

router.get('/', authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_TEMPLATES }
]), getAllTemplates);
router.get('/:id', authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_TEMPLATES }
]), getTemplateById);
router.post('/', authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_TEMPLATES }
]), createTemplate);
router.post('/:id/clone', authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_TEMPLATES }
]), cloneTemplate);
router.patch('/:id/publish', authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_TEMPLATES }
]), publishTemplate);
router.patch('/:id', authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_TEMPLATES }
]), updateTemplateMeta);
// Actualiza completamente una plantilla (secciones e ítems)
router.put('/:id/full', authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_TEMPLATES }
]), updateTemplateFull);

export default router;
