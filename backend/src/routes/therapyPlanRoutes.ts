// backend/src/routes/therapyPlanRoutes.ts

import express from 'express';
import { 
    createTherapyPlan, 
    deleteTherapyPlan, 
    updateTherapyPlan, 
    getTherapyPlanById 
} from '../controllers/therapyPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', protect, createTherapyPlan);
router.get('/:planId', protect, getTherapyPlanById);
router.put('/:planId', protect, updateTherapyPlan);
router.delete('/:planId', protect, deleteTherapyPlan);

export default router;