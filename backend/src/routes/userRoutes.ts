// backend/src/routes/userRoutes.ts

import express from 'express';
import { registerUser, loginUser, getUserProfile, forgotPassword, verifyResetCode, resetPassword  } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyResetCode);
router.post('/reset-password', resetPassword);

export default router;