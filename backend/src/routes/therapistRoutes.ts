import express from 'express';
import { 
    getAllTherapists, 
    createTherapist,
    getTherapistById,
    updateTherapist,
    deleteTherapist
} from '../controllers/therapistController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, isAdmin, getAllTherapists);
router.post('/', protect, isAdmin, createTherapist); // ✅ Asegúrate de que esta línea exista
router.get('/:id', protect, isAdmin, getTherapistById);
router.put('/:id', protect, isAdmin, updateTherapist);
router.delete('/:id', protect, isAdmin, deleteTherapist);

export default router;