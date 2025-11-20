// backend/src/validators/user.validator.ts
import { body } from 'express-validator';
import { Role } from '@prisma/client';

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('Correo inválido.'),
  
  body('password')
    .isString()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  
  body('role')
    .optional()
    .isIn(Object.values(Role)).withMessage('Rol inválido.'),
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('Correo inválido.'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.'),
];