// backend/src/validators/guardian.validator.ts
import { body, query, param } from 'express-validator';
import { Parentesco } from '@prisma/client';

export const validateGuardianId = [
  param('id').isInt({ min: 1 }).withMessage('El ID del guardián debe ser un número válido.'),
];

export const validateListGuardians = [
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100.'),
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Estado no válido.'),
  query('search').optional().isString().trim(),
];

export const validateUpdateGuardian = [
  body('nombres').optional().isString().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
  body('apellidos').optional().isString().trim().notEmpty().withMessage('El apellido no puede estar vacío.'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('El correo no es válido.'),
  body('password').optional().isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('numeroIdentidad').optional().isString().trim().notEmpty().withMessage('El DNI no puede estar vacío.'),
  body('telefono').optional().isString().trim().notEmpty().withMessage('El teléfono no puede estar vacío.'),
  body('parentesco').optional().isIn(Object.values(Parentesco)).withMessage('Parentesco no válido.'),
];

export const validateExportGuardians = [
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Estado no válido.'),
  query('format').optional().isIn(['csv', 'excel', 'pdf']).withMessage('Formato no válido.'),
];