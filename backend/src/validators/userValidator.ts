// backend/src/validators/userValidator.ts
import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio."),
    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio.")
      .email("Correo inválido."),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    role: z
      .nativeEnum(Role, { invalid_type_error: "Rol inválido." })
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio.")
      .email("Correo inválido."),
    password: z.string().min(1, "La contraseña es obligatoria."),
  }),
});
