// backend/src/controllers/reportController.ts
import { Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../types/express.js';
import { renderReportById } from '../services/reportRenderService.js'; 

const prisma = new PrismaClient();

export const createReport = async (req: AuthRequest , res: Response) => {
  try {
    const { studentId, templateId } = req.body;
    const therapistId = req.user?.id;

    if (!therapistId) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    
    const template = await prisma.reportTemplate.findUnique({ where: { id: parseInt(templateId) } });
    if (!template) return res.status(404).json({ error: 'Plantilla no encontrada.' });

    // Evitar duplicados: un reporte por terapeuta/estudiante/plantilla
    const existing = await prisma.report.findFirst({
      where: {
        studentId: parseInt(studentId),
        templateId: parseInt(templateId),
        therapistId,
      },
      select: { id: true },
    });
    if (existing) {
      return res.status(409).json({ error: 'Reporte ya existe para esta plantilla', existingReportId: existing.id });
    }

    const newReport = await prisma.report.create({
      data: {
        studentId: parseInt(studentId),
        therapistId,
        templateId: parseInt(templateId),
        templateVersion: template.version ?? 1,
      },
    });
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el reporte.' });
  }
};

export const getReportsByStudent = async (req: AuthRequest , res: Response) => {
  try {
    const { studentId } = req.params;

    // Check if parent has access to this student
    if (req.user?.role === 'PARENT' && req.user.guardian) {
      const hasAccess = await prisma.student.findFirst({
        where: {
          id: parseInt(studentId),
          guardians: { some: { id: req.user.guardian.id } }
        }
      });
      if (!hasAccess) {
        return res.status(403).json({ error: 'No autorizado para ver reportes de este estudiante.' });
      }
    }

    const reports = await prisma.report.findMany({
      where: { studentId: parseInt(studentId) },
      include: {
        template: true,
        therapist: { select: { id: true, name: true } },
      },
      orderBy: { reportDate: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los reportes.' });
  }
};

export const getReportById = async (req: AuthRequest , res: Response) => {
    try {
        const { reportId } = req.params;
        const report = await prisma.report.findUnique({
            where: { id: parseInt(reportId) },
            include: {
                student: { include: { guardians: true, therapist: true } },
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

        // Check if parent has access to this student's report
        if (req.user?.role === 'PARENT' && req.user.guardian) {
            const hasAccess = report.student.guardians.some(g => g.id === req.user!.guardian!.id);
            if (!hasAccess) {
                return res.status(403).json({ error: 'No autorizado para ver este reporte.' });
            }
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo obtener el detalle del reporte.' });
    }
};

export const submitReportAnswers = async (req: AuthRequest , res: Response) => {
  try {
    const { reportId } = req.params;
    const { answers } = req.body;

    // Autorización: solo el terapeuta dueño o admin puede modificar
    const report = await prisma.report.findUnique({ where: { id: parseInt(reportId) } });
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado.' });
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'No autenticado.' });
    const isAdmin = user.role === Role.ADMIN;
    if (!isAdmin && report.therapistId !== user.id) {
      return res.status(403).json({ error: 'No autorizado para editar este reporte.' });
    }

        const transaction = await prisma.$transaction(async (tx) => {
            await tx.reportItemAnswer.deleteMany({
                where: { reportId: parseInt(reportId) }
            });

            await tx.reportItemAnswer.createMany({
                data: answers.map((a: any) => ({
                    reportId: parseInt(reportId),
                    itemId: a.itemId,
                    level: a.level ?? null,
                    valueJson: a.value !== undefined ? a.value : (a.valueJson !== undefined ? a.valueJson : null),
                }))
            });

            return tx.report.findUnique({ where: { id: parseInt(reportId) }});
        });

        res.status(200).json(transaction);

    } catch (error) {
        console.error("Error al guardar el reporte:", error)
        res.status(500).json({ error: 'No se pudo guardar el reporte.' });
    }
};

// Renderiza un reporte a PDF o DOCX con tamaño A4 u OFICIO
export const renderReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const format = (String(req.query.format || 'pdf').toLowerCase() as 'pdf' | 'docx'); // pdf por defecto
    const sizeQ = String(req.query.size || 'A4').toUpperCase();
    const size = (sizeQ === 'OFICIO' ? 'OFICIO' : 'A4') as 'A4' | 'OFICIO';

    // Genera el archivo en memoria
    const { buffer, mime, filename } = await renderReportById(parseInt(reportId), format, size);

    // Headers para descarga inline
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('Error al renderizar el reporte:', error);
    const msg = error?.message || 'No se pudo renderizar el reporte';
    // Si faltan dependencias, responde 501 (Not Implemented) para indicar acción requerida
    if (typeof msg === 'string' && msg.includes('Dependencia faltante')) {
      return res.status(501).json({ error: msg });
    }
    return res.status(500).json({ error: msg });
  }
};

// Devuelve si ya existe un reporte del terapeuta autenticado para el estudiante/plantilla
export const getExistingReport = async (req: AuthRequest, res: Response) => {
  try {
    const therapistId = req.user?.id;
    if (!therapistId) return res.status(401).json({ error: 'No autenticado.' });
    const studentId = parseInt(String(req.query.studentId));
    const templateId = parseInt(String(req.query.templateId));
    if (!studentId || !templateId) return res.status(400).json({ error: 'Parámetros inválidos' });

    const existing = await prisma.report.findFirst({
      where: { studentId, templateId, therapistId },
      select: { id: true },
    });
    if (existing) return res.json({ exists: true, reportId: existing.id });
    return res.json({ exists: false });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo verificar existencia de reporte.' });
  }
};
