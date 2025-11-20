// backend/src/repositories/studentRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const create = (data: Prisma.StudentCreateInput) => {
  return prisma.student.create({
    data,
    include: { guardians: true, medicamentos: true, alergias: true },
  });
};

const findAndCountAll = (
  where: Prisma.StudentWhereInput,
  skip: number,
  take: number
) => {
  return prisma.$transaction([
    prisma.student.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
      include: {
        therapist: { select: { id: true, nombres: true, apellidos: true } },
        guardians: { orderBy: { parentesco: 'asc' }, take: 1 },
      },
    }),
    prisma.student.count({ where }),
  ]);
};

const findById = (id: number) => {
  return prisma.student.findUnique({
    where: { id },
    include: {
      therapySessions: { include: { leccion: true } },
      therapist: true,
      guardians: true,
      medicamentos: true,
      alergias: true,
    },
  });
};

const update = (id: number, data: Prisma.StudentUpdateInput) => {
  return prisma.student.update({
    where: { id },
    data,
  });
};

const findConflictingSessions = (
  therapistId: number,
  studentIdToExclude: number,
  startTime: Date,
  endTime: Date
) => {
  return prisma.therapySession.findFirst({
    where: {
      therapistId,
      studentId: { not: studentIdToExclude },
      OR: [
        { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
        { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
        { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
      ],
    },
  });
};

const findGuardianByDni = (dni: string) => {
  return prisma.guardian.findUnique({ where: { numeroIdentidad: dni } });
};

const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

const findUsersByEmails = (emails: string[]) => {
  return prisma.user.findMany({ where: { email: { in: emails } }, select: { email: true } });
};

const createUser = (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data });
};

const updateGuardianUserId = (guardianId: number, userId: number) => {
  return prisma.guardian.update({ where: { id: guardianId }, data: { userId } });
};

const deactivateStudent = async (studentId: number) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.update({
      where: { id: studentId },
      data: { isActive: false },
    });

    const guardians = await tx.guardian.findMany({
      where: { students: { some: { id: studentId } } },
      select: { id: true },
    });

    for (const g of guardians) {
      const activeChildrenCount = await tx.student.count({
        where: { isActive: true, guardians: { some: { id: g.id } } },
      });
      if (activeChildrenCount === 0) {
        await tx.guardian.update({ where: { id: g.id }, data: { isActive: false } });
      }
    }
    return student;
  });
};

const reactivateStudent = async (studentId: number) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.update({
      where: { id: studentId },
      data: { isActive: true },
    });

    const guardians = await tx.guardian.findMany({
      where: { students: { some: { id: studentId } } },
      select: { id: true, isActive: true },
    });

    for (const g of guardians) {
      if (!g.isActive) {
        await tx.guardian.update({ where: { id: g.id }, data: { isActive: true } });
      }
    }
    return student;
  });
};

const findAllForExport = (where: Prisma.StudentWhereInput) => {
  return prisma.student.findMany({
    where,
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      dateOfBirth: true,
      anoIngreso: true,
      isActive: true,
      guardians: {
        select: {
          nombres: true,
          apellidos: true,
          numeroIdentidad: true,
          telefono: true,
          parentesco: true,
        },
        orderBy: { isActive: 'asc' },
        take: 1,
      },
      therapist: {
        select: {
          nombres: true,
          apellidos: true,
        },
      },
    },
    orderBy: { nombres: 'asc' },
  });
};

export const studentRepository = {
  create,
  findAndCountAll,
  findById,
  update,
  findConflictingSessions,
  findGuardianByDni,
  findUserByEmail,
  findUsersByEmails,
  createUser,
  updateGuardianUserId,
  deactivateStudent,
  reactivateStudent,
  findAllForExport,
};