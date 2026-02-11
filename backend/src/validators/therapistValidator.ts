// backend/src/validators/therapistValidator.ts
import { z } from "zod";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const therapistIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});

export const createTherapistSchema = z.object({
  body: z.object({
    nombres: z.string().trim().min(1, "Nombres obligatorios."),
    apellidos: z.string().trim().min(1, "Apellidos obligatorios."),
    email: z.string().trim().email("Correo electrónico inválido."),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    identityNumber: z
      .string()
      .trim()
      .min(1, "Número de identidad obligatorio."),
    specialty: z
      .string()
      .trim()
      .min(1, "La especialidad/cargo es obligatoria."),
    dateOfBirth: z.coerce.date().optional(),
    hireDate: z.coerce.date().optional(),
    workDays: z.array(z.any()).optional(),
  }),
});

export const updateTherapistSchema = z.object({
  body: z.object({
    nombres: z.string().trim().min(1).optional(),
    apellidos: z.string().trim().min(1).optional(),
    email: z.string().trim().email("Correo electrónico inválido.").optional(),
    password: z.string().min(6).optional(),
    identityNumber: z.string().trim().min(1).optional(),
    specialty: z.string().trim().min(1).optional(),
    dateOfBirth: z.coerce.date().optional(),
    hireDate: z.coerce.date().optional(),
    workDays: z.array(z.any()).optional(),
  }),
});

export const listTherapistsSchema = z.object({
  query: z.object({
    page: numericString.optional(),
    limit: numericString.max(1000).optional(),
    status: z.enum(["active", "inactive", "all"]).optional(),
    search: z.string().optional(),
  }),
});

export const exportTherapistSchema = z.object({
  query: z.object({
    format: z.enum(["csv", "excel", "pdf"]).optional(),
  }),
});
