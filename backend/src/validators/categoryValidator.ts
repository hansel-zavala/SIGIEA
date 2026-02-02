// backend/src/validators/categoryValidator.ts
import { z } from "zod";

const colorField = z
  .string({ required_error: "El color es obligatorio." })
  .trim()
  .min(1, "El color es obligatorio.")
  .regex(
    /^#[0-9A-Fa-f]{6}$/,
    "El color debe ser un código hexadecimal válido (ej: #FF0000).",
  );

const nameField = z
  .string({ required_error: "El nombre es obligatorio." })
  .trim()
  .min(1, "El nombre es obligatorio.")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/,
    "El nombre solo puede contener letras y espacios.",
  )
  .min(2, "El nombre debe tener al menos 2 caracteres.");

export const CategorySchema = z.object({
  body: z.object({
    name: nameField,
    color: colorField,
  }),
});

export const UpdateCategorySchema = z.object({
  body: z.object({
    name: nameField.optional(),
    color: colorField.optional(),
  }),
});
