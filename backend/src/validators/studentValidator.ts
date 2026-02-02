// backend/src/validators/studentValidator.ts
import { z } from "zod";
import { Parentesco } from "@prisma/client";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const studentIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});

export const createStudentSchema = z.object({
  body: z.object({
    nombres: z.string().trim().min(1, "Nombres obligatorios."),
    apellidos: z.string().trim().min(1, "Apellidos obligatorios."),
    dateOfBirth: z.coerce.date({
      invalid_type_error: "Fecha de nacimiento inválida.",
    }),
    therapistId: z
      .number()
      .int({ message: "Debe asignar un terapeuta válido." })
      .min(1),
    guardians: z
      .array(
        z.object({
          numeroIdentidad: z
            .string()
            .trim()
            .min(1, "DNI del tutor es obligatorio."),
        }),
      )
      .min(1, "Se requiere al menos un tutor."),
  }),
});

export const addGuardianSchema = z.object({
  body: z.object({
    numeroIdentidad: z.string().trim().min(1, "DNI obligatorio."),
    parentesco: z.nativeEnum(Parentesco, {
      invalid_type_error: "Parentesco inválido.",
    }),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    therapistId: z
      .number()
      .int({ message: "Debe ser un ID válido" })
      .min(1)
      .optional(),
    nombres: z.string().trim().min(1).optional(),
    apellidos: z.string().trim().min(1).optional(),
  }),
});

export const listStudentsSchema = z.object({
  query: z.object({
    page: numericString.optional(),
    limit: numericString.max(100).optional(),
    status: z.enum(["active", "inactive", "all"]).optional(),
  }),
});
