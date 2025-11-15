// backend/src/validators/categoryValidator.ts
import { body } from 'express-validator';

export const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),
  
  body('color')
    .trim()
    .notEmpty().withMessage('El color es obligatorio.')
    .isHexColor().withMessage('El color debe ser un código hexadecimal válido (ej: #FF0000).'),
];

export const validateUpdateCategory = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío.')
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),
  
  body('color')
    .optional()
    .trim()
    .notEmpty().withMessage('El color no puede estar vacío.')
    .isHexColor().withMessage('El color debe ser un código hexadecimal válido.'),
];