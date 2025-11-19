// backend/src/validators/reportTemplateValidator.ts
import { body, param } from 'express-validator';

export const validateTemplateId = [
  param('id').isInt({ min: 1 }).withMessage('El ID de la plantilla debe ser válido.'),
];

const commonTemplateValidations = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio.')
    .isString().withMessage('El título debe ser texto.')
    .isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres.'),
  
  body('description')
    .optional()
    .trim()
    .isString(),
  
  body('publish')
    .optional()
    .isBoolean().withMessage('El campo "publish" debe ser booleano.'),
];

export const validateCreateTemplate = [
  ...commonTemplateValidations,
  
  body('sections')
    .isArray().withMessage('Las secciones deben ser un arreglo.'),
  
  body('sections.*.title')
    .trim()
    .notEmpty().withMessage('El título de la sección es obligatorio.'),
  
  body('sections.*.order')
    .isInt().withMessage('El orden de la sección debe ser un número.'),

  body('sections.*.items')
    .isArray().withMessage('Los ítems deben ser un arreglo.'),

  body('sections.*.items.*.label')
    .trim()
    .notEmpty().withMessage('La etiqueta del ítem es obligatoria.'),
  
  body('sections.*.items.*.type')
    .trim()
    .notEmpty().withMessage('El tipo de ítem es obligatorio.'),
];

export const validateUpdateTemplateMeta = [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isString().isLength({ min: 3 }),
  body('description').optional().trim().isString(),
  body('isActive').optional().isBoolean(),
];

export const validateUpdateTemplateFull = [
  param('id').isInt({ min: 1 }),
  ...validateCreateTemplate,
];

export const validatePublishTemplate = [
  param('id').isInt({ min: 1 }),
  body('publish').isBoolean().withMessage('El campo "publish" es obligatorio y debe ser booleano.'),
];