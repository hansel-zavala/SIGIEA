// backend/src/validators/therapySessionValidator.ts
import { z } from "zod";
import { SessionStatus } from "@prisma/client";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const sessionIdSchema = z.object({
  params: z.object({
    sessionId: numericString,
  }),
});

export const studentIdParamSchema = z.object({
  params: z.object({
    studentId: numericString,
  }),
});

const daysEnum = z.enum(
  ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  {
    invalid_type_error: "Día inválido",
  },
);

export const createRecurringSchema = z.object({
  body: z.object({
    studentId: z.number().int().min(1),
    therapistId: z.number().int().min(1),
    leccionId: z.number().int().min(1),
    daysOfWeek: z.array(daysEnum).min(1, "Debe seleccionar al menos un día."),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Hora de inicio inválida (HH:MM).",
      ),
    duration: z.number().int().min(15).max(240),
    weeksToSchedule: z.number().int().min(1).max(52),
  }),
});

export const updateSessionSchema = z.object({
  body: z.object({
    leccionId: z.number().int().min(1).optional(),
    startTime: z.coerce.date().optional(),
    duration: z.number().int().min(15).optional(),
    status: z.nativeEnum(SessionStatus).optional(),
    notes: z.string().trim().optional(),
    behavior: z.string().trim().optional(),
    progress: z.string().trim().optional(),
  }),
});
