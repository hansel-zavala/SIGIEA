// backend/src/routes/alergiaRoutes.ts
import express from "express";
import {
  getAllAlergias,
  createAlergia,
  updateAlergia,
  deleteAlergia,
} from "../controllers/alergiaController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { validateAlergia } from "../validators/alergiaValidator.js";

const router = express.Router();

router.get("/", protect, getAllAlergias);
router.post("/", protect, validateAlergia, validate, createAlergia);
router.put("/:id", protect, validateAlergia, validate, updateAlergia);
router.delete("/:id", protect, deleteAlergia);

export default router;
