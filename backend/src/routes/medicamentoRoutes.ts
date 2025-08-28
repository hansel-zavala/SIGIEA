// backend/src/routes/medicamentoRoutes.ts
import express from 'express';
import {
    getAllMedicamentos,
    createMedicamento,
    updateMedicamento,
    deleteMedicamento
} from '../controllers/medicamentoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllMedicamentos);
router.post('/', protect, createMedicamento);
router.put('/:id', protect, updateMedicamento);
router.delete('/:id', protect, deleteMedicamento);

export default router;