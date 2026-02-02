// backend/src/routes/therapySessionRoutes.ts
import express from "express";
import {
  createRecurringSessions,
  getSessionsByStudent,
  deleteSession,
  updateSession,
} from "../controllers/therapySessionController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  authorize,
  isStudentTherapist,
  isParentOfStudent,
} from "../middleware/authorizeMiddleware.js";
import { Role, PermissionType } from "@prisma/client";
import { validate } from "../middleware/validationMiddleware.js";
import {
  createRecurringSchema,
  sessionIdSchema,
  updateSessionSchema,
} from "../validators/therapySessionValidator.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

const manageAuth = authorize([
  { role: [Role.ADMIN] },
  {
    role: [Role.THERAPIST],
    permission: PermissionType.MANAGE_SESSIONS,
    resourceOwnerCheck: isStudentTherapist,
  },
]);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], resourceOwnerCheck: isStudentTherapist },
  { role: [Role.PARENT], resourceOwnerCheck: isParentOfStudent },
]);

router.post(
  "/",
  manageAuth,
  validate(createRecurringSchema),
  createRecurringSessions,
);

router.get("/", viewAuth, getSessionsByStudent);

router.delete(
  "/:sessionId",
  manageAuth,
  validate(sessionIdSchema),
  deleteSession,
);

router.put(
  "/:sessionId",
  manageAuth,
  validate(sessionIdSchema),
  validate(updateSessionSchema),
  updateSession,
);

export default router;
