// backend/src/controllers/sessionReportController.ts
import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import * as sessionReportService from '../services/sessionReportService.js';
import { StudentNotFoundError, ReportAccessDeniedError } from '../errors/sessionReportErrors.js';

const normalizeNumberParam = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const getSessionReport = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = parseInt(req.query.studentId as string);
    
    const monthParam = normalizeNumberParam(req.query.month);
    const yearParam = normalizeNumberParam(req.query.year);
    const therapistParam = normalizeNumberParam(req.query.therapistId);

    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    const report = await sessionReportService.getSessionReport(
      studentId,
      monthParam,
      yearParam,
      therapistParam,
      req.user
    );

    res.json(report);

  } catch (error) {
    if (error instanceof StudentNotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof ReportAccessDeniedError) {
      return res.status(403).json({ error: error.message });
    }
    
    console.error('Error al generar el reporte de sesiones:', error);
    res.status(500).json({ error: 'No se pudo generar el reporte de sesiones.' });
  }
};

export default {
  getSessionReport,
};