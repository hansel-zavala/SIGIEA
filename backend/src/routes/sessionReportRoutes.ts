// backend/src/routes/sessionReportRoutes.ts
import express from "express";
import { getSessionReport } from "../controllers/sessionReportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { Role, PermissionType } from "@prisma/client";
import { validate } from "../middleware/validationMiddleware.js";
import { sessionReportQuerySchema } from "../validators/sessionReportValidator.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize([
    { role: [Role.ADMIN] },
    { role: [Role.THERAPIST], permission: PermissionType.VIEW_REPORTS },
    { role: [Role.THERAPIST], permission: PermissionType.MANAGE_SESSIONS },
    { role: [Role.PARENT] },
  ]),
  validate(sessionReportQuerySchema),
  getSessionReport,
);

export default router;
