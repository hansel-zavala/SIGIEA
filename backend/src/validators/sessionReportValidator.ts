// backend/src/validators/sessionReport.validator.ts
import { query } from 'express-validator';

export const validateSessionReportQuery = [
  query('studentId')
    .isInt({ min: 1 }).withMessage('El parámetro "studentId" es obligatorio y debe ser numérico.'),
  
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('El mes debe ser un número entre 1 y 12.'),
  
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser válido.'),
    
  query('therapistId')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del terapeuta debe ser válido.'),
];