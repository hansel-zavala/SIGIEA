// backend/src/routes/therapistRoutes.ts
import express from "express";
import {
  createTherapist,
  getAllTherapists,
  getTherapistById,
  updateTherapist,
  deleteTherapist,
  reactivateTherapist,
  exportTherapists,
  exportAssignedStudents,
} from "../controllers/therapistController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { Role, PermissionType } from "@prisma/client";

import { validate } from "../middleware/validationMiddleware.js";
import {
  createTherapistSchema,
  updateTherapistSchema,
  therapistIdSchema,
  listTherapistsSchema,
  exportTherapistSchema,
} from "../validators/therapistValidator.js";

const router = express.Router();

router.use(protect);

const manageAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_USERS },
]);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_THERAPISTS },
  { role: [Role.PARENT] },
]);

const exportAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_THERAPISTS },
]);

router.get("/", viewAuth, validate(listTherapistsSchema), getAllTherapists);

router.get(
  "/export/download",
  exportAuth,
  validate(exportTherapistSchema),
  exportTherapists,
);

router.post("/", manageAuth, validate(createTherapistSchema), createTherapist);

router.get("/:id", viewAuth, validate(therapistIdSchema), getTherapistById);

router.put(
  "/:id",
  manageAuth,
  validate(therapistIdSchema),
  validate(updateTherapistSchema),
  updateTherapist,
);

router.delete("/:id", manageAuth, validate(therapistIdSchema), deleteTherapist);

router.patch(
  "/:id/reactivate",
  manageAuth,
  validate(therapistIdSchema),
  reactivateTherapist,
);

router.get(
  "/:id/students/export",
  exportAuth,
  validate(therapistIdSchema),
  validate(exportTherapistSchema),
  exportAssignedStudents,
);

export default router;
