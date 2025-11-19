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
    getPublishedTemplates
} from '../controllers/reportTemplateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';
import { validate } from '../middleware/validationMiddleware.js';
import {
  validateCreateTemplate,
  validatePublishTemplate,
  validateTemplateId,
  validateUpdateTemplateMeta,
  validateUpdateTemplateFull
} from '../validators/reportTemplateValidator.js';

const router = express.Router();

router.use(protect);

const manageAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_TEMPLATES }
]);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_TEMPLATES }
]);

router.get('/published', getPublishedTemplates); 

router.get('/', viewAuth, getAllTemplates);

router.get('/:id', 
  viewAuth,
  validateTemplateId, 
  validate, 
  getTemplateById
);

router.post('/', 
  manageAuth, 
  validateCreateTemplate, 
  validate, 
  createTemplate
);

router.post('/:id/clone', 
  manageAuth, 
  validateTemplateId, 
  validate, 
  cloneTemplate
);

router.patch('/:id/publish', 
  manageAuth, 
  validatePublishTemplate, 
  validate, 
  publishTemplate
);

router.patch('/:id', 
  manageAuth, 
  validateUpdateTemplateMeta, 
  validate, 
  updateTemplateMeta
);

router.put('/:id/full', 
  manageAuth, 
  validateUpdateTemplateFull, 
  validate, 
  updateTemplateFull
);

export default router;