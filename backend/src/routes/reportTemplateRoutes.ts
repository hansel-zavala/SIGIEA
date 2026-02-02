// backend/src/routes/reportTemplateRoutes.ts
import express from "express";
import {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  publishTemplate,
  cloneTemplate,
  updateTemplateMeta,
  updateTemplateFull,
  getPublishedTemplates,
} from "../controllers/reportTemplateController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { Role, PermissionType } from "@prisma/client";
import { validate } from "../middleware/validationMiddleware.js";
import {
  createTemplateSchema,
  publishTemplateSchema,
  templateIdSchema,
  updateTemplateMetaSchema,
  updateTemplateFullSchema,
} from "../validators/reportTemplateValidator.js";

const router = express.Router();

router.use(protect);

const manageAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_TEMPLATES },
]);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_TEMPLATES },
]);

router.get("/published", getPublishedTemplates);

router.get("/", viewAuth, getAllTemplates);

router.get("/:id", viewAuth, validate(templateIdSchema), getTemplateById);

router.post("/", manageAuth, validate(createTemplateSchema), createTemplate);

router.post(
  "/:id/clone",
  manageAuth,
  validate(templateIdSchema),
  cloneTemplate,
);

router.patch(
  "/:id/publish",
  manageAuth,
  validate(templateIdSchema),
  validate(publishTemplateSchema),
  publishTemplate,
);

router.patch(
  "/:id",
  manageAuth,
  validate(templateIdSchema),
  validate(updateTemplateMetaSchema),
  updateTemplateMeta,
);

router.put(
  "/:id/full",
  manageAuth,
  validate(templateIdSchema),
  validate(updateTemplateFullSchema),
  updateTemplateFull,
);

export default router;
