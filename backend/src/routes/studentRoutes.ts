// backend/src/routes/studentRoutes.ts
import express from 'express';
import {
    createStudent, 
    getAllStudents, 
    getStudentById, 
    updateStudent, 
    deleteStudent 
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import therapySessionRoutes from './therapySessionRoutes.js';

const router = express.Router();

router.post('/', protect, createStudent);
router.get('/', protect, getAllStudents);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

// Usamos las nuevas rutas de sesiones y eliminamos las de logs
router.use('/:studentId/sessions', therapySessionRoutes);

export default router;