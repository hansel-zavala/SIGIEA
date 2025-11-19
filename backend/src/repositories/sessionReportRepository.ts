// backend/src/repositories/sessionReportRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const findStudentWithAccessDetails = (studentId: number) => {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      therapist: true,
      guardians: { select: { id: true } },
    },
  });
};

const findSessionsInPeriod = (
  studentId: number,
  startDate: Date,
  endDate: Date,
  therapistId?: number
) => {
  const where: Prisma.TherapySessionWhereInput = {
    studentId,
    startTime: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (therapistId) {
    where.therapistId = therapistId;
  }

  return prisma.therapySession.findMany({
    where,
    include: {
      therapist: true,
      leccion: {
        select: {
          id: true,
          title: true,
          objective: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });
};

export const sessionReportRepository = {
  findStudentWithAccessDetails,
  findSessionsInPeriod,
};