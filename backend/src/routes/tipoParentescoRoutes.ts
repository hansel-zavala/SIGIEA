// backend/src/routes/tipoParentescoRoutes.ts
import { Router } from "express";
import {
  getAllTiposParentesco,
  createTipoParentesco,
  deleteTipoParentesco,
  updateTipoParentesco,
} from "../controllers/tipoParentescoController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import {
  tipoParentescoIdSchema,
  tipoParentescoSchema,
} from "../validators/tipoParentescoValidator.js";

const router = Router();

router.get("/tiposparentesco", getAllTiposParentesco);

router.post(
  "/tiposparentesco",
  protect,
  isAdmin,
  validate(tipoParentescoSchema),
  createTipoParentesco,
);

router.put(
  "/tiposparentesco/:id",
  protect,
  isAdmin,
  validate(tipoParentescoIdSchema),
  validate(tipoParentescoSchema),
  updateTipoParentesco,
);

router.delete(
  "/tiposparentesco/:id",
  protect,
  isAdmin,
  validate(tipoParentescoIdSchema),
  deleteTipoParentesco,
);

export default router;
