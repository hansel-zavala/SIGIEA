// backend/src/routes/categoryRoutes.ts
import express from 'express';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';
import { validate } from '../middleware/validationMiddleware.js';
import { validateCategory, validateUpdateCategory } from '../validators/categoryValidator.js';

const router = express.Router();

router.use(protect);

const auth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_CATEGORIES }
]);

router.get('/', auth, getAllCategories);
router.post('/', auth, validateCategory, validate, createCategory);
router.put('/:id', auth, validateUpdateCategory, validate, updateCategory);
router.delete('/:id', auth, deleteCategory);

export default router;