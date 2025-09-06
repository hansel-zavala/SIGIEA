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
                student: { include: { guardians: true } },
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
        const { answers, ...reportData } = req.body;

        // Inicia una transacción para asegurar que todo se guarde correctamente
        const transaction = await prisma.$transaction(async (tx) => {
            // 1. Actualiza los campos de texto del reporte principal
            await tx.report.update({
                where: { id: parseInt(reportId) },
                data: {
                    summary: reportData.summary,
                    therapyActivities: reportData.therapyActivities,
                    conclusions: reportData.conclusions,
                    recommendations: reportData.recommendations,
                    attendance: reportData.attendance,
                }
            });

            // 2. Borra las respuestas anteriores para este reporte (si existen)
            await tx.reportItemAnswer.deleteMany({
                where: { reportId: parseInt(reportId) }
            });

            // 3. Inserta las nuevas respuestas
            await tx.reportItemAnswer.createMany({
                data: answers.map((a: any) => ({
                    reportId: parseInt(reportId),
                    itemId: a.itemId,
                    level: a.level,
                }))
            });

            // 4. Devuelve el reporte actualizado
            return tx.report.findUnique({ where: { id: parseInt(reportId) }});
        });

        res.status(200).json(transaction);

    } catch (error) {
        console.error("Error al guardar el reporte:", error)
        res.status(500).json({ error: 'No se pudo guardar el reporte.' });
    }
};