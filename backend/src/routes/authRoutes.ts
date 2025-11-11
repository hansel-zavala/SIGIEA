// backend/src/routes/authRoutes.ts

import express from 'express';
import { sendResetCode, resendResetCode, verifyCode, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-reset-code', sendResetCode);
router.post('/resend-reset-code', resendResetCode);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

export default router;