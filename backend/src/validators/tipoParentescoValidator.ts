// backend/src/validators/tipoParentescoValidator.ts
import { z } from "zod";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const tipoParentescoIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});

export const tipoParentescoSchema = z.object({
  body: z.object({
    nombre: z
      .string({ required_error: "El campo nombre es requerido." })
      .trim()
      .min(1, "El campo nombre es requerido.")
      .min(2, "El nombre debe tener al menos 2 caracteres."),
  }),
});
