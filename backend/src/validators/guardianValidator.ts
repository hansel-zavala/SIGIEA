// backend/src/validators/guardianValidator.ts
import { z } from "zod";
import { Parentesco } from "@prisma/client";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const guardianIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});

export const listGuardiansSchema = z.object({
  query: z.object({
    page: numericString.optional(),
    limit: numericString
      .max(100, "El límite debe ser entre 1 y 100.")
      .optional(),
    status: z
      .enum(["active", "inactive", "all"], {
        invalid_type_error: "Estado no válido.",
      })
      .optional(),
    search: z.string().trim().optional(),
  }),
});

export const updateGuardianSchema = z.object({
  body: z.object({
    nombres: z
      .string()
      .trim()
      .min(1, "El nombre no puede estar vacío.")
      .optional(),
    apellidos: z
      .string()
      .trim()
      .min(1, "El apellido no puede estar vacío.")
      .optional(),
    email: z
      .string()
      .email("El correo no es válido.")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres.")
      .optional(),
    numeroIdentidad: z
      .string()
      .trim()
      .min(1, "El DNI no puede estar vacío.")
      .optional(),
    telefono: z
      .string()
      .trim()
      .min(1, "El teléfono no puede estar vacío.")
      .optional(),
    parentesco: z
      .nativeEnum(Parentesco, { invalid_type_error: "Parentesco no válido." })
      .optional(),
  }),
});

export const exportGuardiansSchema = z.object({
  query: z.object({
    status: z
      .enum(["active", "inactive", "all"], {
        invalid_type_error: "Estado no válido.",
      })
      .optional(),
    format: z
      .enum(["csv", "excel", "pdf"], {
        invalid_type_error: "Formato no válido.",
      })
      .optional(),
  }),
});
