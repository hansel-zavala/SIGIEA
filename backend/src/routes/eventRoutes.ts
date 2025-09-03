// backend/src/routes/eventRoutes.ts
import express from 'express';
import {
    getAllEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent
} from '../controllers/eventController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllEvents);
router.post('/', protect, isAdmin, createEvent);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, isAdmin, updateEvent);
router.delete('/:id', protect, isAdmin, deleteEvent);

export default router;