// backend/src/routes/therapySessionRoutes.ts
import express from 'express';
import { createRecurringSessions, getSessionsByStudent, deleteSession, updateSession } from '../controllers/therapySessionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, isStudentTherapist, isParentOfStudent } from '../middleware/authorizeMiddleware.js';
import { Role, PermissionType } from '@prisma/client';

const router = express.Router({ mergeParams: true }); // mergeParams es importante para obtener el studentId

// Crear sesiones recurrentes: solo Admin o Terapeuta dueño del estudiante con permiso de manejo de sesiones
router.post('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_SESSIONS, resourceOwnerCheck: isStudentTherapist }
]), createRecurringSessions);

// Obtener sesiones del estudiante: Admin, Terapeuta asignado o Padre del estudiante
router.get('/', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], resourceOwnerCheck: isStudentTherapist },
  { role: [Role.PARENT], resourceOwnerCheck: isParentOfStudent }
]), getSessionsByStudent);

// Eliminar sesión: solo Admin o Terapeuta dueño con permiso
router.delete('/:sessionId', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_SESSIONS, resourceOwnerCheck: isStudentTherapist }
]), deleteSession);

// Actualizar sesión: solo Admin o Terapeuta dueño con permiso
router.put('/:sessionId', protect, authorize([
  { role: [Role.ADMIN] },
  { role: [Role.THERAPIST], permission: PermissionType.MANAGE_SESSIONS, resourceOwnerCheck: isStudentTherapist }
]), updateSession);

export default router;