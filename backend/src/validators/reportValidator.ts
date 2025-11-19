// backend/src/validators/reportValidator.ts
import { body, query, param } from 'express-validator';

export const validateReportId = [
  param('reportId').isInt({ min: 1 }).withMessage('El ID del reporte debe ser un número válido.'),
];

export const validateStudentId = [
  param('studentId').isInt({ min: 1 }).withMessage('El ID del estudiante debe ser un número válido.'),
];

export const validateCreateReport = [
  body('studentId')
    .isInt({ min: 1 }).withMessage('El ID del estudiante es obligatorio y debe ser válido.'),
  body('templateId')
    .isInt({ min: 1 }).withMessage('El ID de la plantilla es obligatorio y debe ser válido.'),
];

export const validateSubmitAnswers = [
  body('answers')
    .isArray().withMessage('Las respuestas deben ser un arreglo.'),
  body('answers.*.itemId')
    .isInt({ min: 1 }).withMessage('Cada respuesta debe tener un ID de ítem válido.'),
];

export const validateExistingReportQuery = [
  query('studentId').isInt({ min: 1 }).withMessage('El ID del estudiante es obligatorio.'),
  query('templateId').isInt({ min: 1 }).withMessage('El ID de la plantilla es obligatorio.'),
];

export const validateRenderReport = [
  query('format').optional().isIn(['pdf', 'docx']).withMessage('Formato inválido (pdf o docx).'),
  query('size').optional().isIn(['A4', 'OFICIO', 'a4', 'oficio']).withMessage('Tamaño inválido (A4 o OFICIO).'),
];