// backend/src/validators/therapySessionValidator.ts
import { body, param } from 'express-validator';

export const validateSessionId = [
  param('sessionId').isInt({ min: 1 }).withMessage('ID de sesión inválido.'),
];

export const validateStudentIdParam = [
  param('studentId').isInt({ min: 1 }).withMessage('ID de estudiante inválido (en URL).'),
];

export const validateCreateRecurring = [
  body('studentId').isInt({ min: 1 }).withMessage('ID de estudiante inválido.'),
  body('therapistId').isInt({ min: 1 }).withMessage('ID de terapeuta inválido.'),
  body('leccionId').isInt({ min: 1 }).withMessage('ID de lección inválido.'),
  
  body('daysOfWeek')
    .isArray({ min: 1 }).withMessage('Debe seleccionar al menos un día.')
    .custom((days: any[]) => {
      const validDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      return days.every(d => validDays.includes(d));
    }).withMessage('Días de la semana inválidos.'),
  
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio inválida (formato HH:MM).'),
  
  body('duration')
    .isInt({ min: 15, max: 240 }).withMessage('Duración inválida (15-240 min).'),
  
  body('weeksToSchedule')
    .isInt({ min: 1, max: 52 }).withMessage('Semanas a programar inválidas (1-52).'),
];

export const validateUpdateSession = [
  param('sessionId').isInt(),
  body('leccionId').optional().isInt(),
  body('startTime').optional().isISO8601().toDate(),
  body('duration').optional().isInt({ min: 15 }),
  body('status').optional().isIn(['Programada', 'Completada', 'Cancelada', 'Ausente']),
  body('notes').optional().isString().trim(),
  body('behavior').optional().isString().trim(),
  body('progress').optional().isString().trim(),
];