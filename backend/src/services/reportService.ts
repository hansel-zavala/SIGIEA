// backend/src/services/reportService.ts
import { reportRepository } from '../repositories/reportRepository.js';
import { 
  ReportNotFoundError, 
  ReportDuplicateError, 
  ReportAccessDeniedError, 
  TemplateNotFoundError 
} from '../errors/reportErrors.js';
import { Role } from '@prisma/client';
import { renderReportById } from './reportRenderService.js';

const verifyParentAccess = async (user: any, studentId: number) => {
  if (user?.role === 'PARENT' && user.guardian) {
    const hasAccess = await reportRepository.checkParentAccess(studentId, user.guardian.id);
    if (!hasAccess) {
      throw new ReportAccessDeniedError('No autorizado para ver reportes de este estudiante.');
    }
  }
};

export const createReport = async (studentId: number, templateId: number, therapistId: number) => {
  const template = await reportRepository.findTemplateById(templateId);
  if (!template) {
    throw new TemplateNotFoundError();
  }

  const existing = await reportRepository.findExistingReport(studentId, templateId, therapistId);
  if (existing) {
    throw new ReportDuplicateError('Reporte ya existe para esta plantilla', existing.id);
  }

  return reportRepository.createReport({
    student: { connect: { id: studentId } },
    therapist: { connect: { id: therapistId } },
    template: { connect: { id: templateId } },
    templateVersion: template.version ?? 1,
  });
};

export const getReportsByStudent = async (studentId: number, user: any) => {
  await verifyParentAccess(user, studentId);
  return reportRepository.findReportsByStudentId(studentId);
};

export const getReportById = async (reportId: number, user: any) => {
  const report = await reportRepository.findReportByIdWithDetails(reportId);
  if (!report) {
    throw new ReportNotFoundError();
  }

  if (user?.role === 'PARENT' && user.guardian) {
    const hasAccess = report.student.guardians.some(g => g.id === user.guardian.id);
    if (!hasAccess) {
      throw new ReportAccessDeniedError();
    }
  }

  return report;
};

export const submitReportAnswers = async (reportId: number, answers: any[], user: any) => {
  const report = await reportRepository.findReportById(reportId);
  if (!report) {
    throw new ReportNotFoundError();
  }

  const isAdmin = user.role === Role.ADMIN;
  if (!isAdmin && report.therapistId !== user.id) {
    throw new ReportAccessDeniedError('No autorizado para editar este reporte.');
  }

  return reportRepository.saveReportAnswers(reportId, answers);
};

export const checkExistingReport = async (studentId: number, templateId: number, therapistId: number) => {
  const existing = await reportRepository.findExistingReport(studentId, templateId, therapistId);
  if (existing) {
    return { exists: true, reportId: existing.id };
  }
  return { exists: false };
};

export const generateReportFile = async (reportId: number, format: 'pdf' | 'docx', size: 'A4' | 'OFICIO') => {
  return renderReportById(reportId, format, size);
};