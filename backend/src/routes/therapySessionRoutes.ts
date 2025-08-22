// backend/src/routes/therapySessionRoutes.ts
import express from 'express';
import { createRecurringSessions, getSessionsByStudent, deleteSession, updateSession } from '../controllers/therapySessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true }); // mergeParams es importante para obtener el studentId

router.post('/', protect, createRecurringSessions);
router.get('/', protect, getSessionsByStudent);
router.delete('/:sessionId', protect, deleteSession);
router.put('/:sessionId', protect, updateSession);

export default router;