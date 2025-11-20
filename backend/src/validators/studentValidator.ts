// backend/src/validators/studentValidator.ts
import { body, query, param } from 'express-validator';
import { Parentesco } from '@prisma/client';

export const validateStudentId = [
  param('id').isInt({ min: 1 }).withMessage('El ID del estudiante debe ser un número válido.'),
];

export const validateCreateStudent = [
  body('nombres').trim().notEmpty().withMessage('Nombres obligatorios.'),
  body('apellidos').trim().notEmpty().withMessage('Apellidos obligatorios.'),
  body('dateOfBirth').isISO8601().toDate().withMessage('Fecha de nacimiento inválida.'),
  body('therapistId').isInt({ min: 1 }).withMessage('Debe asignar un terapeuta válido.'),
  
  body('guardians')
    .isArray({ min: 1 }).withMessage('Se requiere al menos un tutor.'),
  
  body('guardians.*.numeroIdentidad')
    .trim().notEmpty().withMessage('DNI del tutor es obligatorio.'),
];

export const validateAddGuardian = [
  body('numeroIdentidad').trim().notEmpty().withMessage('DNI obligatorio.'),
  body('parentesco').isIn(Object.values(Parentesco)).withMessage('Parentesco inválido.'),
];

export const validateUpdateStudent = [
  param('id').isInt(),
  body('therapistId').optional().isInt({ min: 1 }),
];

export const validateListStudents = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'inactive', 'all']),
];