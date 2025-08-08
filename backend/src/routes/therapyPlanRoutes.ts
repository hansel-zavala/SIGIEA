// backend/src/routes/therapyPlanRoutes.ts
import express from 'express';
import { createTherapyPlan, deleteTherapyPlan, updateTherapyPlan, getTherapyPlanById } from '../controllers/therapyPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true }); // ¡mergeParams es importante para rutas anidadas!

router.post('/', protect, createTherapyPlan);
router.delete('/:planId', protect, deleteTherapyPlan);
router.put('/:planId', protect, updateTherapyPlan);
router.get('/:planId', protect, getTherapyPlanById);

export default router;