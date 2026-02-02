// backend/src/validators/alergiaValidator.ts
import { z } from "zod";

export const alergiaSchema = z.object({
  body: z.object({
    nombre: z
      .string({ required_error: "El nombre es obligatorio." })
      .min(1, "El nombre es obligatorio.")
      .min(3, "El nombre debe tener al menos 3 caracteres.")
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/,
        "El nombre solo puede contener letras y espacios.",
      ),
  }),
});
