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
  validateEventBody,
  validateListEvents,
  validateEventId
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
  validateListEvents,
  validate,
  getAllEvents
);

router.post('/',
  createAuth,
  validateEventBody,
  validate,
  createEvent
);

router.get('/:id',
  viewAuth,
  validateEventId,
  validate,
  getEventById
);

router.put('/:id',
  editAuth,
  validateEventId,
  validateEventBody,
  validate,
  updateEvent
);

router.delete('/:id',
  deleteAuth,
  validateEventId,
  validate,
  deleteEvent
);

export default router;