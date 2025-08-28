// backend/src/routes/alergiaRoutes.ts
import express from 'express';
import {
    getAllAlergias,
    createAlergia,
    updateAlergia,
    deleteAlergia
} from '../controllers/alergiaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllAlergias);
router.post('/', protect, createAlergia);
router.put('/:id', protect, updateAlergia);
router.delete('/:id', protect, deleteAlergia);

export default router;