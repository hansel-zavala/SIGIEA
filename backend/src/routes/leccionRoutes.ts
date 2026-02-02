// backend/src/routes/leccionRoutes.ts
import express from "express";
import {
  createLeccion,
  getAllLecciones,
  getLeccionById,
  updateLeccion,
  deleteLeccion,
  activateLeccion,
  exportLecciones,
} from "../controllers/leccionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { Role, PermissionType } from "@prisma/client";
import { validate } from "../middleware/validationMiddleware.js";
import {
  leccionSchema,
  leccionIdSchema,
  listLeccionesSchema,
  exportLeccionesSchema,
} from "../validators/leccionValidator.js";

const router = express.Router();

router.use(protect);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_LECCIONES },
]);

const createAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.CREATE_LECCIONES },
]);

const editAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EDIT_LECCIONES },
]);

const deleteAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.DELETE_LECCIONES },
]);

const exportAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_LECCIONES },
]);

router.get("/", viewAuth, validate(listLeccionesSchema), getAllLecciones);

router.post("/", createAuth, validate(leccionSchema), createLeccion);

router.get(
  "/export/download",
  exportAuth,
  validate(exportLeccionesSchema),
  exportLecciones,
);

router.get("/:id", viewAuth, validate(leccionIdSchema), getLeccionById);

router.put(
  "/:id",
  editAuth,
  validate(leccionIdSchema),
  validate(leccionSchema),
  updateLeccion,
);

router.delete("/:id", deleteAuth, validate(leccionIdSchema), deleteLeccion);

router.patch(
  "/:id/activate",
  deleteAuth,
  validate(leccionIdSchema),
  activateLeccion,
);

export default router;
