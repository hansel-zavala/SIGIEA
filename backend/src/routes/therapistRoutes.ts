import express from 'express';
import { 
    getAllTherapists, 
    createTherapist,
    getTherapistById,
    updateTherapist,
    deleteTherapist,
    reactivateTherapist
} from '../controllers/therapistController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, isAdmin, getAllTherapists);
router.post('/', protect, isAdmin, createTherapist);
router.get('/:id', protect, isAdmin, getTherapistById);
router.put('/:id', protect, isAdmin, updateTherapist);
router.delete('/:id', protect, isAdmin, deleteTherapist);
router.patch('/:id/reactivate', protect, isAdmin, reactivateTherapist);

export default router;