// backend/src/validators/reportValidator.ts
import { z } from "zod";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const reportIdSchema = z.object({
  params: z.object({
    reportId: numericString,
  }),
});

export const studentIdSchema = z.object({
  params: z.object({
    studentId: numericString,
  }),
});

export const createReportSchema = z.object({
  body: z.object({
    studentId: z
      .number()
      .int()
      .min(1, "El ID del estudiante es obligatorio y debe ser válido."),
    templateId: z
      .number()
      .int()
      .min(1, "El ID de la plantilla es obligatorio y debe ser válido."),
  }),
});

export const submitAnswersSchema = z.object({
  body: z.object({
    answers: z
      .array(
        z.object({
          itemId: z
            .number()
            .int()
            .min(1, "Cada respuesta debe tener un ID de ítem válido."),
          // otros campos de respuesta
        }),
      )
      .min(0, "Las respuestas deben ser un arreglo."),
  }),
});

export const existingReportQuerySchema = z.object({
  query: z.object({
    studentId: numericString,
    templateId: numericString,
  }),
});

export const renderReportSchema = z.object({
  query: z.object({
    format: z.enum(["pdf", "docx"]).optional(),
    size: z.enum(["A4", "OFICIO", "a4", "oficio"]).optional(),
  }),
});
