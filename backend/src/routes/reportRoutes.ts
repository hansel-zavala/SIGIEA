// backend/src/routes/reportRoutes.ts
import express from 'express';
import {
    createReport,
    getReportsByStudent,
    getReportById,
    submitReportAnswers, 
    renderReport,
    getExistingReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import {
  validateReportId,
  validateStudentId,
  validateCreateReport,
  validateSubmitAnswers,
  validateExistingReportQuery,
  validateRenderReport
} from '../validators/reportValidator.js';

const router = express.Router();

router.get('/student/:studentId', 
  protect, 
  validateStudentId, 
  validate, 
  getReportsByStudent
);

router.get('/exists', 
  protect, 
  validateExistingReportQuery, 
  validate, 
  getExistingReport
);

router.get('/:reportId', 
  protect, 
  validateReportId, 
  validate, 
  getReportById
);

router.get('/:reportId/render', 
  protect, 
  validateReportId,
  validateRenderReport,
  validate, 
  renderReport
);

router.post('/', 
  protect, 
  validateCreateReport, 
  validate, 
  createReport
);

router.put('/:reportId', 
  protect, 
  validateReportId,
  validateSubmitAnswers, 
  validate, 
  submitReportAnswers
);

export default router;