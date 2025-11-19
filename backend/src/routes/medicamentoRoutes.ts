// backend/src/routes/medicamentoRoutes.ts
import express from 'express';
import {
    getAllMedicamentos,
    createMedicamento,
    updateMedicamento,
    deleteMedicamento
} from '../controllers/medicamentoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { validateMedicamentoBody, validateMedicamentoId } from '../validators/medicamentoValidator.js';

const router = express.Router();

router.get('/', protect, getAllMedicamentos);

router.post('/', 
  protect, 
  validateMedicamentoBody, 
  validate, 
  createMedicamento
);

router.put('/:id', 
  protect, 
  validateMedicamentoId, 
  validateMedicamentoBody, 
  validate, 
  updateMedicamento
);

router.delete('/:id', 
  protect, 
  validateMedicamentoId,
  validate,
  deleteMedicamento
);

export default router;