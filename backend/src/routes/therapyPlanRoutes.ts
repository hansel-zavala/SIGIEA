// backend/src/routes/therapyPlanRoutes.ts
import express from 'express';
import { createTherapyPlan } from '../controllers/therapyPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true }); // ¡mergeParams es importante para rutas anidadas!

router.post('/', protect, createTherapyPlan);

export default router;