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
  sendCodeSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from "../validators/authvValidator.js";

const router = express.Router();

router.post("/send-reset-code", validate(sendCodeSchema), sendResetCode);
router.post("/resend-reset-code", validate(sendCodeSchema), resendResetCode);
router.post("/verify-code", validate(verifyCodeSchema), verifyCode);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
