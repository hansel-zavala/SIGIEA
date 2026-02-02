// backend/src/routes/reportRoutes.ts
import express from "express";
import {
  createReport,
  getReportsByStudent,
  getReportById,
  submitReportAnswers,
  renderReport,
  getExistingReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import {
  reportIdSchema,
  studentIdSchema,
  createReportSchema,
  submitAnswersSchema,
  existingReportQuerySchema,
  renderReportSchema,
} from "../validators/reportValidator.js";

const router = express.Router();

router.get(
  "/student/:studentId",
  protect,
  validate(studentIdSchema),
  getReportsByStudent,
);

router.get(
  "/exists",
  protect,
  validate(existingReportQuerySchema),
  getExistingReport,
);

router.get("/:reportId", protect, validate(reportIdSchema), getReportById);

router.get(
  "/:reportId/render",
  protect,
  validate(reportIdSchema),
  validate(renderReportSchema),
  renderReport,
);

router.post("/", protect, validate(createReportSchema), createReport);

router.put(
  "/:reportId",
  protect,
  validate(reportIdSchema),
  validate(submitAnswersSchema),
  submitReportAnswers,
);

export default router;
