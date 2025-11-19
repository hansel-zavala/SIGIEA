// backend/src/validators/medicamento.validator.ts
import { body, param } from 'express-validator';

export const validateMedicamentoId = [
  param('id').isInt({ min: 1 }).withMessage('El ID del medicamento debe ser un número válido.'),
];

export const validateMedicamentoBody = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isString().withMessage('El nombre debe ser texto.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),
];