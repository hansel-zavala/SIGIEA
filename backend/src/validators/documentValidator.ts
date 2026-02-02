// src/validators/documentValidator.ts
import { z } from "zod";
import { DocumentOwnerType } from "@prisma/client";

// Helper para convertir strings numéricos a numbers en query/params
const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const listDocumentsSchema = z.object({
  query: z.object({
    ownerType: z
      .nativeEnum(DocumentOwnerType, {
        errorMap: () => ({ message: "Tipo de propietario no válido." }),
      })
      .optional(),
    ownerId: numericString.optional(),
    page: numericString.optional(),
    pageSize: numericString
      .max(100, "El tamaño de página debe ser máximo 100")
      .optional(),
  }),
});

export const createDocumentSchema = z.object({
  body: z.object({
    ownerType: z.nativeEnum(DocumentOwnerType, {
      required_error: "El tipo de propietario es obligatorio.",
      invalid_type_error: "Tipo de propietario no válido.",
    }),
    ownerId: z.coerce.number().int().min(1).optional(),
    title: z.string().trim().optional(),
    category: z.string().trim().optional(),
  }),
});

export const documentIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});
