// backend/src/validators/eventValidator.ts
import { z } from "zod";
import { EventAudience } from "@prisma/client";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const createEventSchema = z.object({
  body: z
    .object({
      title: z
        .string({ required_error: "El título es obligatorio." })
        .trim()
        .min(1, "El título es obligatorio.")
        .min(3, "El título debe tener al menos 3 caracteres."),
      startDate: z.coerce.date({
        required_error: "La fecha de inicio es obligatoria.",
        invalid_type_error: "La fecha de inicio debe ser una fecha válida.",
      }),
      endDate: z.coerce.date({
        required_error: "La fecha de fin es obligatoria.",
        invalid_type_error: "La fecha de fin debe ser una fecha válida.",
      }),
      isAllDay: z
        .boolean({
          invalid_type_error: 'El campo "todo el día" debe ser booleano.',
        })
        .optional(),
      location: z.string().trim().optional(),
      description: z.string().trim().optional(),
      audience: z
        .nativeEnum(EventAudience, {
          invalid_type_error: `La audiencia debe ser uno de: ${Object.values(EventAudience).join(", ")}`,
        })
        .optional(),
      categoryId: z
        .number()
        .int({ message: "El ID de la categoría debe ser un número válido." })
        .min(1)
        .nullable()
        .optional(),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      path: ["endDate"],
    }),
});

export const listEventsSchema = z.object({
  query: z.object({
    start: z.coerce
      .date({
        invalid_type_error: 'La fecha "start" debe ser una fecha válida.',
      })
      .optional(),
    end: z.coerce
      .date({ invalid_type_error: 'La fecha "end" debe ser una fecha válida.' })
      .optional(),
  }),
});

export const eventIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});
