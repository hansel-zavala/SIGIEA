// backend/src/routes/userRoutes.ts
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validators/userValidator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);

router.post("/login", validate(loginSchema), loginUser);

router.get("/profile", protect, getUserProfile);

export default router;
