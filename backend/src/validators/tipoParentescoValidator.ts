// backend/src/validators/tipoParentesco.validator.ts
import { body, param } from 'express-validator';

export const validateTipoParentescoId = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número válido.'),
];

export const validateTipoParentescoBody = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El campo nombre es requerido.')
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),
];