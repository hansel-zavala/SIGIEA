// backend/src/validators/leccionValidator.ts
import { z } from "zod";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const leccionIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});

export const leccionSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "El título es obligatorio." })
      .trim()
      .min(1, "El título es obligatorio.")
      .min(3, "El título debe tener al menos 3 caracteres."),
    objective: z
      .string({ required_error: "El objetivo es obligatorio." })
      .trim()
      .min(1, "El objetivo es obligatorio."),
    description: z.string().trim().optional(),
    category: z.string().trim().optional(),
    keySkill: z.string().trim().optional(),
  }),
});

export const listLeccionesSchema = z.object({
  query: z.object({
    status: z
      .enum(["active", "inactive", "all"], {
        invalid_type_error: "Estado no válido.",
      })
      .optional(),
  }),
});

export const exportLeccionesSchema = z.object({
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
