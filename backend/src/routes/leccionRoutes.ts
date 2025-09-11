// backend/src/routes/leccionRoutes.ts
import express from 'express';
import { 
    createLeccion, 
    getAllLecciones,
    getLeccionById,
    updateLeccion,
    deleteLeccion
} from '../controllers/leccionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createLeccion);
router.get('/', protect, getAllLecciones);
router.get('/:id', protect, getLeccionById);
router.put('/:id', protect, updateLeccion);
router.delete('/:id', protect, deleteLeccion);

export default router;