// backend/src/routes/tipoParentescoRoutes.ts

import { Router } from 'express';
import {
  getAllTiposParentesco,
  createTipoParentesco,
  deleteTipoParentesco,
  updateTipoParentesco,
} from '../controllers/tipoParentescoController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Ruta pública para obtener todos los tipos de parentesco
router.get('/tiposparentesco', getAllTiposParentesco);

// Rutas protegidas solo para administradores
router.post('/tiposparentesco', protect, isAdmin, createTipoParentesco);
router.put('/tiposparentesco/:id', protect, isAdmin, updateTipoParentesco);
router.delete('/tiposparentesco/:id', protect, isAdmin, deleteTipoParentesco);

export default router;