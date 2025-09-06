// backend/src/routes/reportTemplateRoutes.ts
import express from 'express';
import {
    createTemplate,
    getAllTemplates,
} from '../controllers/reportTemplateController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, isAdmin);

router.get('/', getAllTemplates);
router.post('/', createTemplate);

export default router;