// backend/src/routes/authRoutes.ts

import express from "express";
import {
  sendResetCode,
  resendResetCode,
  verifyCode,
  resetPassword,
} from "../controllers/authController.js";
import { validate } from "../middleware/validationMiddleware.js";
import {
  validateSendCode,
  validateVerifyCode,
  validateResetPassword,
} from "../validators/authvValidator.js";

const router = express.Router();

router.post("/send-reset-code", validateSendCode, validate, sendResetCode);
router.post("/resend-reset-code", validateSendCode, validate, resendResetCode);
router.post("/verify-code", validateVerifyCode, validate, verifyCode);
router.post("/reset-password", validateResetPassword, validate, resetPassword);

export default router;
