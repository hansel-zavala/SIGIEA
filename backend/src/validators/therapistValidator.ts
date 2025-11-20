// backend/src/validators/therapistValidator.ts
import { body, query, param } from 'express-validator';

export const validateTherapistId = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.'),
];

export const validateCreateTherapist = [
  body('nombres').trim().notEmpty().withMessage('Nombres obligatorios.'),
  body('apellidos').trim().notEmpty().withMessage('Apellidos obligatorios.'),
  body('email').trim().isEmail().withMessage('Correo electrónico inválido.'),
  body('password').isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('identityNumber').trim().notEmpty().withMessage('Número de identidad obligatorio.'),
  body('specialty').trim().notEmpty().withMessage('La especialidad/cargo es obligatoria.'),
  
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('hireDate').optional().isISO8601().toDate(),
  body('workDays').optional().isArray(),
];

export const validateUpdateTherapist = [
  param('id').isInt(),
  body('email').optional().trim().isEmail(),
  body('password').optional().isString().isLength({ min: 6 }),
];

export const validateListTherapists = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'inactive', 'all']),
];

export const validateExport = [
  query('format').optional().isIn(['csv', 'excel', 'pdf']),
];