// backend/src/validators/leccion.validator.ts
import { body, query, param } from 'express-validator';

export const validateLeccionId = [
  param('id').isInt({ min: 1 }).withMessage('El ID de la lección debe ser un número válido.'),
];

export const validateLeccionBody = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio.')
    .isString().withMessage('El título debe ser texto.')
    .isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres.'),

  body('objective')
    .trim()
    .notEmpty().withMessage('El objetivo es obligatorio.')
    .isString().withMessage('El objetivo debe ser texto.'),

  body('description')
    .optional()
    .trim()
    .isString(),

  body('category')
    .optional()
    .trim()
    .isString(),

  body('keySkill')
    .optional()
    .trim()
    .isString(),
];

export const validateListLecciones = [
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Estado no válido.'),
];

export const validateExportLecciones = [
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Estado no válido.'),
  query('format').optional().isIn(['csv', 'excel', 'pdf']).withMessage('Formato no válido.'),
];