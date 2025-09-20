// backend/src/routes/eventRoutes.ts
import express from 'express';
import {
    getAllEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent,
    reactivateEvent,
    exportEvents
} from '../controllers/eventController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllEvents);
router.get('/export/download', protect, exportEvents);
router.post('/', protect, isAdmin, createEvent);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, isAdmin, updateEvent);
router.delete('/:id', protect, isAdmin, deleteEvent);
router.patch('/:id/reactivate', protect, isAdmin, reactivateEvent);

export default router;
