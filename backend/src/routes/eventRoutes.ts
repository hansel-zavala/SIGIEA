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
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router();

router.get('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_EVENTS },
  { role: [Role.PARENT] }
]), getAllEvents);
router.get('/export/download', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EXPORT_EVENTS },
  { role: [Role.PARENT] }
]), exportEvents);
router.post('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.CREATE_EVENTS }
]), createEvent);
router.get('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_EVENTS },
  { role: [Role.PARENT] }
]), getEventById);
router.put('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EDIT_EVENTS }
]), updateEvent);
router.delete('/:id', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.DELETE_EVENTS }
]), deleteEvent);
router.patch('/:id/reactivate', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.DELETE_EVENTS }
]), reactivateEvent);

export default router;
