// backend/src/routes/uploadRoutes.ts
import express from "express";
import {
  uploadFile,
  deleteFile,
  upload,
} from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

import { validate } from "../middleware/validationMiddleware.js";
import { filenameSchema } from "../validators/uploadValidator.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), uploadFile);

router.delete("/:filename", protect, validate(filenameSchema), deleteFile);

export default router;
