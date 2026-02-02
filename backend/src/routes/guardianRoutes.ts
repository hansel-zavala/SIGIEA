// backend/src/routes/guardianRoutes.ts
import express from "express";
import {
  getAllGuardians,
  updateGuardian,
  deleteGuardian,
  getGuardianById,
  reactivateGuardian,
  exportGuardians,
} from "../controllers/guardianController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { Role, PermissionType } from "@prisma/client";
import { validate } from "../middleware/validationMiddleware.js";
import {
  guardianIdSchema,
  listGuardiansSchema,
  updateGuardianSchema,
  exportGuardiansSchema,
} from "../validators/guardianValidator.js";

const router = express.Router();

router.use(protect);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_GUARDIANS },
]);

const editAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EDIT_GUARDIANS },
]);

const deleteAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.DELETE_GUARDIANS },
]);

const exportAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_GUARDIANS },
]);

router.get("/", viewAuth, validate(listGuardiansSchema), getAllGuardians);

router.get(
  "/export/download",
  exportAuth,
  validate(exportGuardiansSchema),
  exportGuardians,
);

router.get("/:id", viewAuth, validate(guardianIdSchema), getGuardianById);

router.put(
  "/:id",
  editAuth,
  validate(guardianIdSchema),
  validate(updateGuardianSchema),
  updateGuardian,
);

router.delete("/:id", deleteAuth, validate(guardianIdSchema), deleteGuardian);

router.patch(
  "/:id/reactivate",
  editAuth,
  validate(guardianIdSchema),
  reactivateGuardian,
);

export default router;
