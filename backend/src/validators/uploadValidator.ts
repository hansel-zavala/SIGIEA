// backend/src/validators/uploadValidator.ts
import { param } from 'express-validator';

export const validateFilename = [
  param('filename')
    .trim()
    .notEmpty().withMessage('El nombre del archivo es obligatorio.')
    .custom((value) => {
      if (value.includes('/') || value.includes('\\') || value.includes('..')) {
        throw new Error('Nombre de archivo inválido.');
      }
      return true;
    }),
];