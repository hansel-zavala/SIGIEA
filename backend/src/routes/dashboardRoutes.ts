// backend/src/routes/dashboardRoutes.ts
import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, isAdmin, getDashboardStats);

export default router;