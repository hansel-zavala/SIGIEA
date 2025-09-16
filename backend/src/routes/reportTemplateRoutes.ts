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
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, isAdmin);

router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.post('/:id/clone', cloneTemplate);
router.patch('/:id/publish', publishTemplate);
router.patch('/:id', updateTemplateMeta);
// Actualiza completamente una plantilla (secciones e ítems)
router.put('/:id/full', updateTemplateFull);

export default router;
