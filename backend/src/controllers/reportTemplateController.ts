// backend/src/controllers/reportTemplateController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import { Prisma } from '@prisma/client';

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
            type: section.type, // Se guarda el tipo de sección
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
    console.error("Error detallado al crear la plantilla:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ error: 'Ya existe una plantilla con este título.' });
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
    });
    res.json(templates);
  } catch (error) {
    console.error("Error al obtener las plantillas:", error);
    res.status(500).json({ error: 'No se pudieron obtener las plantillas.' });
  }
};