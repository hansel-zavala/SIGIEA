// backend/src/repositories/leccionRepository.ts
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

const create = (data: Prisma.LeccionCreateInput) => {
  return prisma.leccion.create({ data });
};

const findAll = (where: Prisma.LeccionWhereInput) => {
  return prisma.leccion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

const findById = (id: number) => {
  return prisma.leccion.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const update = (id: number, data: Prisma.LeccionUpdateInput) => {
  return prisma.leccion.update({
    where: { id },
    data,
  });
};

const findAllForExport = (where: Prisma.LeccionWhereInput) => {
  return prisma.leccion.findMany({
    where,
    select: {
      id: true,
      title: true,
      objective: true,
      category: true,
      keySkill: true,
      isActive: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const leccionRepository = {
  create,
  findAll,
  findById,
  update,
  findAllForExport,
};