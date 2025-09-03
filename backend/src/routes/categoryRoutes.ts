// backend/src/routes/categoryRoutes.ts
import express from 'express';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de categorías requerirán ser administrador
router.use(protect, isAdmin);

router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;