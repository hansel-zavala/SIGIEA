// backend/src/validators/event.validator.ts
import { body, query, param } from 'express-validator';
import { EventAudience } from '@prisma/client';

export const validateEventBody = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio.')
    .isString().withMessage('El título debe ser texto.')
    .isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres.'),

  body('startDate')
    .notEmpty().withMessage('La fecha de inicio es obligatoria.')
    .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida.')
    .toDate(),

  body('endDate')
    .notEmpty().withMessage('La fecha de fin es obligatoria.')
    .isISO8601().withMessage('La fecha de fin debe ser una fecha válida.')
    .toDate()
    .custom((endDate, { req }) => {
      if (endDate < req.body.startDate) {
        throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
      }
      return true;
    }),

  body('isAllDay')
    .optional()
    .isBoolean().withMessage('El campo "todo el día" debe ser booleano.'),

  body('location')
    .optional()
    .isString()
    .trim(),
  
  body('description')
    .optional()
    .isString()
    .trim(),

  body('audience')
    .optional()
    .isIn(Object.values(EventAudience))
    .withMessage(`La audiencia debe ser uno de: ${Object.values(EventAudience).join(', ')}`),

  body('categoryId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('El ID de la categoría debe ser un número válido.'),
];

export const validateListEvents = [
  query('start')
    .optional()
    .isISO8601().withMessage('La fecha "start" debe ser una fecha válida.')
    .toDate(),
  
  query('end')
    .optional()
    .isISO8601().withMessage('La fecha "end" debe ser una fecha válida.')
    .toDate(),
];

export const validateEventId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID del evento debe ser un número válido.'),
];