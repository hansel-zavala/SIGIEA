// backend/src/routes/reportRoutes.ts
import express from 'express';
import {
    createReport,
    getReportsByStudent,
    getReportById,
    submitReportAnswers, 
    renderReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/student/:studentId', protect, getReportsByStudent);
router.get('/:reportId', protect, getReportById);
router.get('/:reportId/render', protect, renderReport); // Render PDF/DOCX del reporte
router.post('/', protect, createReport);
router.put('/:reportId', protect, submitReportAnswers);


export default router;
