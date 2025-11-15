// src/validators/document.validator.ts
import { query, body, param } from 'express-validator';
import { DocumentOwnerType } from '@prisma/client';

const isOwnerType = (value: string) => {
  const normalized = value.trim().toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(DocumentOwnerType, normalized)) {
    throw new Error('Tipo de propietario no válido.');
  }
  return true;
};

export const validateListDocuments = [
  query('ownerType')
    .optional()
    .custom(isOwnerType),
  query('ownerId')
    .optional()
    .isInt({ min: 1 }).withMessage('ID de propietario no válido.'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('El número de página no es válido.'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El tamaño de página debe estar entre 1 y 100.'),
];

export const validateCreateDocument = [
  body('ownerType')
    .trim()
    .notEmpty().withMessage('El tipo de propietario es obligatorio.')
    .custom(isOwnerType),
  
  body('ownerId').optional(),

  body('title')
    .optional()
    .isString()
    .trim(),
  
  body('category')
    .optional()
    .isString()
    .trim(),
];

export const validateDocumentId = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID del documento debe ser un número válido.'),
];