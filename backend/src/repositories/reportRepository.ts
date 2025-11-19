// backend/src/repositories/reportRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const findTemplateById = (id: number) => {
  return prisma.reportTemplate.findUnique({ where: { id } });
};

const findExistingReport = (studentId: number, templateId: number, therapistId: number) => {
  return prisma.report.findFirst({
    where: { studentId, templateId, therapistId },
    select: { id: true },
  });
};

const createReport = (data: Prisma.ReportCreateInput) => {
  return prisma.report.create({ data });
};

const findReportsByStudentId = (studentId: number) => {
  return prisma.report.findMany({
    where: { studentId },
    include: {
      template: true,
      therapist: { select: { id: true, name: true } },
    },
    orderBy: { reportDate: 'desc' },
  });
};

const findReportByIdWithDetails = (reportId: number) => {
  return prisma.report.findUnique({
    where: { id: reportId },
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
};

const findReportById = (reportId: number) => {
  return prisma.report.findUnique({ where: { id: reportId } });
};

const checkParentAccess = (studentId: number, guardianId: number) => {
  return prisma.student.findFirst({
    where: {
      id: studentId,
      guardians: { some: { id: guardianId } }
    }
  });
};

const saveReportAnswers = async (reportId: number, answers: any[]) => {
  return prisma.$transaction(async (tx) => {
    await tx.reportItemAnswer.deleteMany({
      where: { reportId }
    });
    await tx.reportItemAnswer.createMany({
      data: answers.map((a: any) => ({
        reportId,
        itemId: a.itemId,
        level: a.level ?? null,
        valueJson: a.value !== undefined ? a.value : (a.valueJson !== undefined ? a.valueJson : null),
      }))
    });

    return tx.report.findUnique({ where: { id: reportId }});
  });
};

export const reportRepository = {
  findTemplateById,
  findExistingReport,
  createReport,
  findReportsByStudentId,
  findReportByIdWithDetails,
  findReportById,
  checkParentAccess,
  saveReportAnswers,
};