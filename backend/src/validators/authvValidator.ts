// backend/src/validators/auth.validator.ts
import { body } from 'express-validator';

const emailValidation = body('email')
  .trim()
  .notEmpty().withMessage('El correo electrónico es requerido.')
  .isEmail().withMessage('El formato del correo electrónico no es válido.');

const codeValidation = body('code')
  .trim()
  .notEmpty().withMessage('El código es requerido.')
  .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos.')
  .isNumeric().withMessage('El código debe ser numérico.');

export const validateSendCode = [
  emailValidation,
];

export const validateVerifyCode = [
  emailValidation,
  codeValidation,
];

export const validateResetPassword = [
  emailValidation,
  codeValidation,
  body('newPassword')
    .trim()
    .notEmpty().withMessage('La nueva contraseña es requerida.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
];