// backend/src/repositories/dashboardRepository.ts
import prisma from '../lib/prisma.js';

const findStudentIdsByGuardian = (guardianId: number) => {
  return prisma.student.findMany({
    where: { guardians: { some: { id: guardianId } }, isActive: true },
    select: { id: true }
  });
};

const countSessionsByStudentIds = (studentIdList: number[]) => {
  return prisma.therapySession.count({
    where: { studentId: { in: studentIdList } }
  });
};

const countCompletedSessionsByStudentIds = (studentIdList: number[]) => {
  return prisma.therapySession.count({
    where: {
      studentId: { in: studentIdList },
      status: 'Completada'
    }
  });
};

const countUpcomingSessionsByStudentIds = (studentIdList: number[]) => {
  return prisma.therapySession.count({
    where: {
      studentId: { in: studentIdList },
      startTime: { gte: new Date() }
    }
  });
};

const countReportsByStudentIds = (studentIdList: number[]) => {
  return prisma.report.count({
    where: { studentId: { in: studentIdList } }
  });
};

const countStudentsCreatedBetween = (startDate: Date, endDate: Date) => {
  return prisma.student.count({
    where: { createdAt: { gte: startDate, lt: endDate } }
  });
};

const countActiveStudents = () => {
  return prisma.student.count({ where: { isActive: true } });
};

const countActiveTherapists = () => {
  return prisma.therapistProfile.count({ where: { isActive: true } });
};

const countActiveGuardians = () => {
  return prisma.guardian.count({ where: { isActive: true } });
};

const countActiveLecciones = () => {
  return prisma.leccion.count({ where: { isActive: true } });
};

const countSessionsBetween = (startDate: Date) => {
  return prisma.therapySession.count({
    where: { startTime: { gte: startDate } }
  });
};

const countCompletedSessionsBetween = (startDate: Date) => {
  return prisma.therapySession.count({
    where: { status: 'Completada', startTime: { gte: startDate } }
  });
};

const getStudentBirthDates = () => {
  return prisma.student.findMany({
    where: { isActive: true },
    select: { dateOfBirth: true }
  });
};

const getTherapistWorkloadBetween = (startDate: Date, endDate: Date) => {
  return prisma.therapySession.groupBy({
    by: ['therapistId'],
    where: { startTime: { gte: startDate, lte: endDate } },
    _count: { id: true }
  });
};

const getTherapistNamesByIds = (therapistIds: number[]) => {
  return prisma.therapistProfile.findMany({
    where: { id: { in: therapistIds } },
    select: { id: true, nombres: true, apellidos: true }
  });
};

const getTherapySessionCountsByLeccion = (take: number) => {
  return prisma.therapySession.groupBy({
    by: ['leccionId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: take
  });
};

const getLeccionTitlesByIds = (leccionIds: number[]) => {
  return prisma.leccion.findMany({
    where: { id: { in: leccionIds } },
    select: { id: true, title: true }
  });
};

const countSessionsByStatusBetween = (
  status: 'Completada' | 'Ausente' | 'Cancelada' | 'Programada' | 'Total',
  startDate: Date,
  endDate: Date,
  therapistId?: number
) => {
  const whereClause: any = {
    startTime: { gte: startDate, lte: endDate },
    ...(therapistId && { therapistId: therapistId }),
  };

  if (status !== 'Total') {
    whereClause.status = status;
  }
  
  return prisma.therapySession.count({ where: whereClause });
};

const countStudentsByGender = (gender: 'Masculino' | 'Femenino') => {
  return prisma.student.count({
    where: { genero: gender, isActive: true }
  });
};

const getStudentBirthDepartmentCounts = () => {
  return prisma.student.groupBy({
    by: ['lugarNacimiento'],
    where: { isActive: true, lugarNacimiento: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });
};

const getActiveTherapists = () => {
  return prisma.therapistProfile.findMany({
    where: { isActive: true },
    select: { id: true, nombres: true, apellidos: true }
  });
};

const countTherapistSessionsByStatusBetween = (
  therapistId: number,
  startDate: Date,
  endDate: Date,
  status?: 'Completada'
) => {
  const whereClause: any = {
    therapistId,
    startTime: { gte: startDate, lte: endDate },
    ...(status && { status: status }),
  };
  return prisma.therapySession.count({ where: whereClause });
};

export const dashboardRepository = {
  findStudentIdsByGuardian,
  countSessionsByStudentIds,
  countCompletedSessionsByStudentIds,
  countUpcomingSessionsByStudentIds,
  countReportsByStudentIds,
  countStudentsCreatedBetween,
  countActiveStudents,
  countActiveTherapists,
  countActiveGuardians,
  countActiveLecciones,
  countSessionsBetween,
  countCompletedSessionsBetween,
  getStudentBirthDates,
  getTherapistWorkloadBetween,
  getTherapistNamesByIds,
  getTherapySessionCountsByLeccion,
  getLeccionTitlesByIds,
  countSessionsByStatusBetween,
  countStudentsByGender,
  getStudentBirthDepartmentCounts,
  getActiveTherapists,
  countTherapistSessionsByStatusBetween,
};