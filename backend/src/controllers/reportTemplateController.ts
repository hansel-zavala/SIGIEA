// backend/src/controllers/reportTemplateController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import { Prisma } from '@prisma/client'; // Importamos esto para manejar errores específicos

// --- Gestión de Plantillas ---
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { title, description, sections } = req.body;
    const newTemplate = await prisma.reportTemplate.create({
      data: {
        title,
        description,
        sections: {
          create: sections.map((section: any) => ({
            title: section.title,
            order: section.order,
            items: {
              create: section.items.map((item: any) => ({
                description: item.description,
                order: item.order,
              })),
            },
          })),
        },
      },
    });
    res.status(201).json(newTemplate);
  } catch (error) {
    // --- INICIO DE LA CORRECCIÓN ---
    console.error("Error detallado al crear la plantilla:", error); // Log para ver el error en la terminal del backend

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Error específico de Prisma para "registro duplicado"
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe una plantilla con este título. Por favor, elige otro.' });
      }
    }
    // Error genérico para cualquier otro problema
    res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
    // --- FIN DE LA CORRECCIÓN ---
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
    });
    res.json(templates);
  } catch (error) {
    console.error("Error al obtener las plantillas:", error);
    res.status(500).json({ error: 'No se pudieron obtener las plantillas.' });
  }
};