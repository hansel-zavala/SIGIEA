// backend/src/routes/eventRoutes.ts
import express from 'express';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';
import { validate } from '../middleware/validationMiddleware.js';
import {
  createEventSchema,
  listEventsSchema,
  eventIdSchema
} from '../validators/eventValidator.js';

const router = express.Router();

router.use(protect);

const viewAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.VIEW_EVENTS },
  { role: [Role.PARENT] }
]);

const createAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.CREATE_EVENTS }
]);

const editAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.EDIT_EVENTS }
]);

const deleteAuth = authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.DELETE_EVENTS }
]);

router.get('/',
  viewAuth,
  validate(listEventsSchema),
  getAllEvents
);

router.post('/',
  createAuth,
  validate(createEventSchema),
  createEvent
);

router.get('/:id',
  viewAuth,
  validate(eventIdSchema),
  getEventById
);

router.put('/:id',
  editAuth,
  validate(eventIdSchema),
  validate(createEventSchema),
  updateEvent
);

router.delete('/:id',
  deleteAuth,
  validate(eventIdSchema),
  deleteEvent
);

export default router;