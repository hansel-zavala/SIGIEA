// backend/src/controllers/reportController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const createReport = async (req: Request, res: Response) => {
  try {
    const { studentId, templateId } = req.body;
    const therapistId = req.user?.id;

    if (!therapistId) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    
    const newReport = await prisma.report.create({
      data: {
        studentId: parseInt(studentId),
        therapistId,
        templateId: parseInt(templateId),
      },
    });
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el reporte.' });
  }
};

export const getReportsByStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const reports = await prisma.report.findMany({
      where: { studentId: parseInt(studentId) },
      include: {
        template: true,
        therapist: { select: { name: true } },
      },
      orderBy: { reportDate: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los reportes.' });
  }
};

export const getReportById = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const report = await prisma.report.findUnique({
            where: { id: parseInt(reportId) },
            include: {
                student: {
                    include: {
                        guardians: true,
                        therapist: true, // <-- CORRECCIÓN AQUÍ: Incluir al terapeuta del estudiante
                    }
                },
                therapist: { select: { name: true } },
                template: {
                    include: {
                        sections: {
                            orderBy: { order: 'asc' },
                            include: {
                                items: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        }
                    }
                },
                itemAnswers: true,
                textAnswers: true,
            }
        });
        if (!report) {
            return res.status(404).json({ error: 'Reporte no encontrado.' });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo obtener el detalle del reporte.' });
    }
};

export const submitReportAnswers = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { itemAnswers, textAnswers } = req.body;

        const transaction = await prisma.$transaction(async (tx) => {
            if (itemAnswers && itemAnswers.length > 0) {
                await Promise.all(itemAnswers.map((answer: any) =>
                    tx.reportItemAnswer.upsert({
                        where: { reportId_itemId: { reportId: parseInt(reportId), itemId: answer.itemId } },
                        update: { level: answer.level },
                        create: { reportId: parseInt(reportId), itemId: answer.itemId, level: answer.level },
                    })
                ));
            }

            if (textAnswers && textAnswers.length > 0) {
                 await Promise.all(textAnswers.map((answer: any) =>
                    tx.reportTextAnswer.upsert({
                        where: { reportId_sectionId: { reportId: parseInt(reportId), sectionId: answer.sectionId } },
                        update: { content: answer.content },
                        create: { reportId: parseInt(reportId), sectionId: answer.sectionId, content: answer.content },
                    })
                ));
            }
            
            return tx.report.findUnique({ where: { id: parseInt(reportId) }});
        });

        res.status(200).json(transaction);

    } catch (error) {
        console.error("Error al guardar el reporte:", error)
        res.status(500).json({ error: 'No se pudo guardar el reporte.' });
    }
};