// backend/src/validators/sessionReportValidator.ts
import { z } from "zod";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const sessionReportQuerySchema = z.object({
  query: z.object({
    studentId: numericString,
    month: numericString.max(12).optional(),
    year: numericString.min(2000).max(2100).optional(),
    therapistId: numericString.optional(),
  }),
});
