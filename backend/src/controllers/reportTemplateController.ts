// backend/src/controllers/reportTemplateController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import { Prisma } from '@prisma/client';

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { title, description, sections, version, publish } = req.body;
    const newTemplate = await prisma.reportTemplate.create({
      data: {
        title,
        description,
        version: version ?? 1,
        publishedAt: publish ? new Date() : null,
        sections: {
          create: sections.map((section: any) => ({
            title: section.title,
            description: section.description || null,
            order: section.order,
            items: {
              create: section.items.map((item: any) => {
                const mapped: any = {
                  label: item.label,
                  description: item.description || null,
                  placeholder: item.placeholder || null,
                  helpText: item.helpText || null,
                  required: !!item.required,
                  maxLength: item.maxLength ?? null,
                  type: item.type,
                  width: item.width || 'FULL',
                  key: item.key || null,
                  order: item.order,
                };
                if (item.options !== undefined) {
                  mapped.options = item.options as Prisma.InputJsonValue;
                }
                if (item.defaultValue !== undefined) {
                  mapped.defaultValue = item.defaultValue as Prisma.InputJsonValue;
                }
                return mapped;
              }),
            },
          })),
        },
      },
    });
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Error detallado al crear la plantilla:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe una plantilla con este título. Por favor, elige otro.' });
      }
    }
    res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
  }
};

export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.reportTemplate.findMany({
      where: { isActive: true },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: [{ title: 'asc' }, { version: 'desc' }],
    });
    res.json(templates);
  } catch (error) {
    console.error("Error al obtener las plantillas:", error);
    res.status(500).json({ error: 'No se pudieron obtener las plantillas.' });
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.reportTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { items: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!template) return res.status(404).json({ error: 'Plantilla no encontrada.' });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener la plantilla.' });
  }
};

export const getPublishedTemplates = async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.reportTemplate.findMany({
      where: { isActive: true, publishedAt: { not: null } },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { items: { orderBy: { order: 'asc' } } },
        },
      },
      orderBy: [{ title: 'asc' }, { version: 'desc' }],
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las plantillas publicadas.' });
  }
};

export const publishTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { publish } = req.body as { publish: boolean };
    const updated = await prisma.reportTemplate.update({
      where: { id: parseInt(id) },
      data: { publishedAt: publish ? new Date() : null, isActive: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cambiar el estado de publicación.' });
  }
};

export const cloneTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const base = await prisma.reportTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        sections: { include: { items: true }, orderBy: { order: 'asc' } },
      },
    });
    if (!base) return res.status(404).json({ error: 'Plantilla no encontrada.' });

    const nextVersion = (base.version ?? 1) + 1;
    const newTitle = `${base.title} v${nextVersion}`; // evitar colisión por unique(title)

    const created = await prisma.reportTemplate.create({
      data: {
        title: newTitle,
        description: base.description,
        version: nextVersion,
        isActive: true,
        publishedAt: null,
        sections: {
          create: base.sections.map((s) => ({
            title: s.title,
            description: s.description,
            order: s.order,
            items: {
              create: s.items.map((it) => ({
                label: it.label,
                description: it.description,
                placeholder: it.placeholder,
                helpText: it.helpText,
                required: it.required,
                maxLength: it.maxLength,
                type: it.type,
                width: it.width,
                options: it.options === null ? Prisma.JsonNull : (it.options as unknown as Prisma.InputJsonValue | undefined),
                defaultValue: it.defaultValue === null ? Prisma.JsonNull : (it.defaultValue as unknown as Prisma.InputJsonValue | undefined),
                key: it.key,
                order: it.order,
              })),
            },
          })),
        },
      },
      include: { sections: { include: { items: true } } },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error('Error al clonar plantilla:', error);
    res.status(500).json({ error: 'No se pudo clonar la plantilla.' });
  }
};

export const updateTemplateMeta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body as { title?: string; description?: string; isActive?: boolean };
    const updated = await prisma.reportTemplate.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar la plantilla:', error);
    res.status(500).json({ error: 'No se pudo actualizar la plantilla.' });
  }
};

export const updateTemplateFull = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateId = parseInt(id);
    const { title, description, sections, publish } = req.body as {
      title?: string;
      description?: string;
      publish?: boolean;
      sections: Array<{
        title: string;
        description?: string | null;
        order: number;
        items: Array<any>;
      }>;
    };

    await prisma.$transaction(async (tx) => {
      // Meta básica
      await tx.reportTemplate.update({
        where: { id: templateId },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(publish !== undefined ? { publishedAt: publish ? new Date() : null } : {}),
        },
      });

      // Eliminar contenido previo
      await tx.reportItem.deleteMany({ where: { section: { templateId } } });
      await tx.reportSection.deleteMany({ where: { templateId } });

      // Recrear secciones e ítems
      if (Array.isArray(sections) && sections.length > 0) {
        await tx.reportTemplate.update({
          where: { id: templateId },
          data: {
            sections: {
              create: sections.map((section) => ({
                title: section.title,
                description: section.description ?? null,
                order: section.order,
                items: {
                  create: (section.items || []).map((item: any) => {
                    const mapped: any = {
                      label: item.label,
                      description: item.description ?? null,
                      placeholder: item.placeholder ?? null,
                      helpText: item.helpText ?? null,
                      required: !!item.required,
                      maxLength: item.maxLength ?? null,
                      type: item.type,
                      width: item.width || 'FULL',
                      key: item.key ?? null,
                      order: item.order,
                    };
                    if (item.options !== undefined) mapped.options = item.options as any;
                    if (item.defaultValue !== undefined) mapped.defaultValue = item.defaultValue as any;
                    return mapped;
                  }),
                },
              })),
            },
          },
        });
      }
    });

    const updated = await prisma.reportTemplate.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { items: { orderBy: { order: 'asc' } } },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar completamente la plantilla:', error);
    res.status(500).json({ error: 'No se pudo actualizar la plantilla.' });
  }
};
