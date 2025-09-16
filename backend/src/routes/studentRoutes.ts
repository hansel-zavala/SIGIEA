// backend/src/routes/studentRoutes.ts
import express from 'express';
import {
    createStudent, 
    getAllStudents, 
    getStudentById, 
    updateStudent, 
    deleteStudent,
    reactivateStudent,
    addGuardianToStudent
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import therapySessionRoutes from './therapySessionRoutes.js';

const router = express.Router();

router.post('/', protect, createStudent);
router.get('/', protect, getAllStudents);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);
router.patch('/:id/reactivate', protect, reactivateStudent);
router.post('/:id/guardians', protect, addGuardianToStudent);
router.use('/:studentId/sessions', therapySessionRoutes);

export default router;
