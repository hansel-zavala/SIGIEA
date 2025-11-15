// backend/src/repositories/documentRepository.ts
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

const findDocumentById = (id: number) => {
  return prisma.document.findUnique({ where: { id } });
};

const findDocuments = (where: Prisma.DocumentWhereInput) => {
  return prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

const createDocument = (data: Prisma.DocumentCreateInput) => {
  return prisma.document.create({ data });
};

const deleteDocumentById = (id: number) => {
  return prisma.document.delete({ where: { id } });
};

const findLegacyStudent = (id: number) => {
  return prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      partidaNacimientoUrl: true,
      resultadoEvaluacionUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

const findLegacyTherapist = (id: number) => {
  return prisma.therapistProfile.findUnique({
    where: { id },
    select: {
      id: true,
      identityCardUrl: true,
      resumeUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

const findLegacyGuardian = (id: number) => {
  return prisma.guardian.findUnique({
    where: { id },
    select: {
      id: true,
      copiaIdentidadUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

export const documentRepository = {
  findDocumentById,
  findDocuments,
  createDocument,
  deleteDocumentById,
  findLegacyStudent,
  findLegacyTherapist,
  findLegacyGuardian,
};