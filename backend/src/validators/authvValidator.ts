// backend/src/validators/authvValidator.ts
import { z } from "zod";

// Campos reutilizables
const emailField = z
  .string({ required_error: "El correo electrónico es obligatorio." })
  .trim()
  .min(1, "El correo electrónico es obligatorio.")
  .email("El formato del correo electrónico no es válido.");

const codeField = z
  .string({ required_error: "El código es obligatorio." })
  .trim()
  .length(6, "El código debe tener 6 dígitos.")
  .regex(/^[0-9]+$/, "El código debe ser numérico.");

const passwordField = z
  .string({ required_error: "La nueva contraseña es requerida." })
  .trim()
  .min(6, "La contraseña debe tener al menos 6 caracteres.");

// Esquemas exportados
export const sendCodeSchema = z.object({
  body: z.object({
    email: emailField,
  }),
});

export const verifyCodeSchema = z.object({
  body: z.object({
    email: emailField,
    code: codeField,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailField,
    code: codeField,
    newPassword: passwordField,
  }),
});
