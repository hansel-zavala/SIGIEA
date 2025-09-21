import express from 'express';
import { 
    getAllTherapists, 
    createTherapist,
    getTherapistById,
    updateTherapist,
    deleteTherapist,
    reactivateTherapist,
    exportTherapists,
    exportAssignedStudents
} from '../controllers/therapistController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, isAdmin, getAllTherapists);
router.get('/export/download', protect, isAdmin, exportTherapists);
router.get('/:id/export-students', protect, exportAssignedStudents);
router.post('/', protect, isAdmin, createTherapist);
router.get('/:id', protect, isAdmin, getTherapistById);
router.put('/:id', protect, isAdmin, updateTherapist);
router.delete('/:id', protect, isAdmin, deleteTherapist);
router.patch('/:id/reactivate', protect, isAdmin, reactivateTherapist);

export default router;
