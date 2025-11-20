// backend/src/routes/tipoParentescoRoutes.ts
import { Router } from 'express';
import {
  getAllTiposParentesco,
  createTipoParentesco,
  deleteTipoParentesco,
  updateTipoParentesco,
} from '../controllers/tipoParentescoController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { 
  validateTipoParentescoBody, 
  validateTipoParentescoId 
} from '../validators/tipoParentescoValidator.js';

const router = Router();

router.get('/tiposparentesco', getAllTiposParentesco);

router.post(
  '/tiposparentesco', 
  protect, 
  isAdmin, 
  validateTipoParentescoBody, 
  validate, 
  createTipoParentesco
);

router.put(
  '/tiposparentesco/:id', 
  protect, 
  isAdmin, 
  validateTipoParentescoId, 
  validateTipoParentescoBody, 
  validate, 
  updateTipoParentesco
);

router.delete(
  '/tiposparentesco/:id', 
  protect, 
  isAdmin, 
  validateTipoParentescoId, 
  validate, 
  deleteTipoParentesco
);

export default router;