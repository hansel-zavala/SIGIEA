// backend/src/routes/leccionRoutes.ts
import express from 'express';
import { createLeccion, getAllLecciones } from '../controllers/leccionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createLeccion);
router.get('/', protect, getAllLecciones);

export default router;