// backend/src/validators/uploadValidator.ts
import { z } from "zod";

export const filenameSchema = z.object({
  params: z.object({
    filename: z
      .string({ required_error: "El nombre del archivo es obligatorio." })
      .trim()
      .min(1, "El nombre del archivo es obligatorio.")
      .refine(
        (val) =>
          !val.includes("/") && !val.includes("\\") && !val.includes(".."),
        { message: "Nombre de archivo inválido." },
      ),
  }),
});
