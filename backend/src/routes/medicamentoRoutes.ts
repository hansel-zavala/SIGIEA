// backend/src/routes/medicamentoRoutes.ts
import express from "express";
import {
  getAllMedicamentos,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
} from "../controllers/medicamentoController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import {
  medicamentoIdSchema,
  medicamentoSchema,
} from "../validators/medicamentoValidator.js";

const router = express.Router();

router.get("/", protect, getAllMedicamentos);

router.post("/", protect, validate(medicamentoSchema), createMedicamento);

router.put(
  "/:id",
  protect,
  validate(medicamentoIdSchema),
  validate(medicamentoSchema),
  updateMedicamento,
);

router.delete(
  "/:id",
  protect,
  validate(medicamentoIdSchema),
  deleteMedicamento,
);

export default router;
