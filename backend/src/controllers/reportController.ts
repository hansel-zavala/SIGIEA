// backend/src/controllers/reportController.ts
import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import * as reportService from '../services/reportService.js';
import { 
  ReportNotFoundError, 
  ReportDuplicateError, 
  ReportAccessDeniedError, 
  TemplateNotFoundError 
} from '../errors/reportErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof ReportNotFoundError || error instanceof TemplateNotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof ReportAccessDeniedError) {
    return res.status(403).json({ error: error.message });
  }
  if (error instanceof ReportDuplicateError) {
    return res.status(409).json({ 
      error: error.message, 
      existingReportId: error.existingReportId 
    });
  }
  const msg = error instanceof Error ? error.message : '';
  if (msg.includes('Dependencia faltante')) {
     return res.status(501).json({ error: msg });
  }

  console.error('Error en reportController:', error);
  res.status(500).json({ error: 'Error interno del servidor.' });
};

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, templateId } = req.body;
    const therapistId = req.user?.id;

    if (!therapistId) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const newReport = await reportService.createReport(
      parseInt(studentId), 
      parseInt(templateId), 
      therapistId
    );
    res.status(201).json(newReport);
  } catch (error) {
    handleError(res, error);
  }
};

export const getReportsByStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const reports = await reportService.getReportsByStudent(parseInt(studentId), req.user);
    res.json(reports);
  } catch (error) {
    handleError(res, error);
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const report = await reportService.getReportById(parseInt(reportId), req.user);
    res.json(report);
  } catch (error) {
    handleError(res, error);
  }
};

export const submitReportAnswers = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { answers } = req.body;
    const user = req.user;
    
    if (!user) return res.status(401).json({ error: 'No autenticado.' });

    const result = await reportService.submitReportAnswers(parseInt(reportId), answers, user);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getExistingReport = async (req: AuthRequest, res: Response) => {
  try {
    const therapistId = req.user?.id;
    if (!therapistId) return res.status(401).json({ error: 'No autenticado.' });
    
    const studentId = parseInt(String(req.query.studentId));
    const templateId = parseInt(String(req.query.templateId));

    const result = await reportService.checkExistingReport(studentId, templateId, therapistId);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const renderReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const format = (String(req.query.format || 'pdf').toLowerCase() as 'pdf' | 'docx');
    const sizeQ = String(req.query.size || 'A4').toUpperCase();
    const size = (sizeQ === 'OFICIO' ? 'OFICIO' : 'A4') as 'A4' | 'OFICIO';

    const { buffer, mime, filename } = await reportService.generateReportFile(parseInt(reportId), format, size);

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    handleError(res, error);
  }
};