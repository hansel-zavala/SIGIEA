// backend/src/validators/alergiaValidator.ts
import { body } from 'express-validator';

export const validateAlergia = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isString().withMessage('El nombre debe ser una cadena de texto.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo puede contener letras y espacios.')
];