// backend/src/validators/medicamentoValidator.ts
import { z } from "zod";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const medicamentoIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});

export const medicamentoSchema = z.object({
  body: z.object({
    nombre: z
      .string({ required_error: "El nombre es obligatorio." })
      .trim()
      .min(1, "El nombre es obligatorio.")
      .min(3, "El nombre debe tener al menos 3 caracteres."),
  }),
});
