// backend/src/repositories/therapySessionRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const findTherapistById = (id: number) => {
  return prisma.therapistProfile.findUnique({ where: { id } });
};

const findConflictingSessions = (therapistId: number, startTime: Date, endTime: Date, excludeSessionId?: number) => {
  const where: Prisma.TherapySessionWhereInput = {
    therapistId,
    AND: [
      { startTime: { lt: endTime } },
      { endTime: { gt: startTime } }
    ]
  };

  if (excludeSessionId) {
    where.id = { not: excludeSessionId };
  }

  return prisma.therapySession.findFirst({ where });
};

const findManyConflictingSessions = (therapistId: number, timeRanges:Array<{start: Date, end: Date}>) => {
    return prisma.therapySession.findMany({
        where: {
            therapistId,
            OR: timeRanges.map(range => ({
                AND: [
                    { startTime: { lt: range.end } },
                    { endTime: { gt: range.start } }
                ]
            }))
        }
    });
};

const createMany = (data: Prisma.TherapySessionCreateManyInput[]) => {
  return prisma.therapySession.createMany({ data });
};

const findByStudentId = (studentId: number) => {
  return prisma.therapySession.findMany({
    where: { studentId },
    include: { leccion: true },
    orderBy: { startTime: 'asc' }
  });
};

const findById = (id: number) => {
  return prisma.therapySession.findUnique({ where: { id } });
};

const update = (id: number, data: Prisma.TherapySessionUpdateInput) => {
  return prisma.therapySession.update({
    where: { id },
    data,
  });
};

const remove = (id: number) => {
  return prisma.therapySession.delete({ where: { id } });
};

export const therapySessionRepository = {
  findTherapistById,
  findConflictingSessions,
  findManyConflictingSessions,
  createMany,
  findByStudentId,
  findById,
  update,
  remove,
};