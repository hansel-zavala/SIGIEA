// backend/src/routes/leccionRoutes.ts
import express from 'express';
import { 
    createLeccion, 
    getAllLecciones,
    getLeccionById,
    updateLeccion,
    deleteLeccion,
    activateLeccion,
    exportLecciones
} from '../controllers/leccionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createLeccion);
router.get('/', protect, getAllLecciones);
router.get('/export/download', protect, exportLecciones);
router.get('/:id', protect, getLeccionById);
router.put('/:id', protect, updateLeccion);
router.delete('/:id', protect, deleteLeccion);
router.patch('/:id/activate', protect, activateLeccion);

export default router;
