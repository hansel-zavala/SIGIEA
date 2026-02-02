// backend/src/validators/reportTemplateValidator.ts
import { z } from "zod";

const numericString = z.coerce
  .number({ invalid_type_error: "Debe ser un número válido" })
  .int()
  .min(1, "Debe ser mayor a 0");

export const templateIdSchema = z.object({
  params: z.object({
    id: numericString,
  }),
});

const itemSchema = z.object({
  label: z.string().trim().min(1, "La etiqueta del ítem es obligatoria."),
  type: z.string().trim().min(1, "El tipo de ítem es obligatorio."),
  // Se pueden agregar más propiedades de item aquí
});

const sectionSchema = z.object({
  title: z.string().trim().min(1, "El título de la sección es obligatorio."),
  order: z
    .number()
    .int({ message: "El orden de la sección debe ser un número." }),
  items: z.array(itemSchema).min(0, "Los ítems deben ser un arreglo."),
});

export const createTemplateSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, "El título debe tener al menos 3 caracteres."),
    description: z.string().trim().optional(),
    publish: z
      .boolean({ invalid_type_error: 'El campo "publish" debe ser booleano.' })
      .optional(),
    sections: z
      .array(sectionSchema)
      .min(0, "Las secciones deben ser un arreglo."),
  }),
});

export const updateTemplateMetaSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).optional(),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateTemplateFullSchema = createTemplateSchema;

export const publishTemplateSchema = z.object({
  body: z.object({
    publish: z.boolean({
      required_error: 'El campo "publish" es obligatorio.',
    }),
  }),
});
