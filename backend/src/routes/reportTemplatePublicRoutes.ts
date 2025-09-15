// backend/src/routes/reportTemplatePublicRoutes.ts
import express from 'express';
import { getPublishedTemplates, getTemplateById } from '../controllers/reportTemplateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/published', getPublishedTemplates);
router.get('/:id', getTemplateById);

export default router;

