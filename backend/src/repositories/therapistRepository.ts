// backend/src/repositories/therapistRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const findByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

const findByIdentityNumber = (identityNumber: string) => {
  return prisma.therapistProfile.findUnique({ where: { identityNumber } });
};

const create = (data: Prisma.TherapistProfileCreateInput) => {
  return prisma.therapistProfile.create({
    data,
    include: { user: true },
  });
};

const findAndCountAll = (
  where: Prisma.TherapistProfileWhereInput,
  skip: number,
  take: number
) => {
  return prisma.$transaction([
    prisma.therapistProfile.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
      include: {
        assignedStudents: {
          where: { isActive: true },
        },
      },
    }),
    prisma.therapistProfile.count({ where }),
  ]);
};

const findById = (id: number) => {
  return prisma.therapistProfile.findFirst({
    where: { id, isActive: true },
    include: {
      assignedStudents: {
        where: { isActive: true },
      },
    },
  });
};

const findByIdForUpdate = (id: number) => {
  return prisma.therapistProfile.findUnique({ where: { id } });
};

const updateUser = (id: number, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({ where: { id }, data });
};

const updateProfile = (id: number, data: Prisma.TherapistProfileUpdateInput) => {
  return prisma.therapistProfile.update({
    where: { id },
    data,
  });
};

const findAllForExport = (where: Prisma.TherapistProfileWhereInput) => {
  return prisma.therapistProfile.findMany({
    where,
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      email: true,
      specialty: true,
      identityNumber: true,
      isActive: true,
      createdAt: true,
      assignedStudents: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          isActive: true,
        },
        orderBy: { isActive: 'desc' },
      },
    },
    orderBy: { nombres: 'asc' },
  });
};

const findByIdWithStudents = (id: number) => {
  return prisma.therapistProfile.findUnique({
    where: { id },
    include: {
      assignedStudents: {
        where: { isActive: true },
        orderBy: { nombres: 'asc' },
      },
    },
  });
};

export const therapistRepository = {
  findByEmail,
  findByIdentityNumber,
  create,
  findAndCountAll,
  findById,
  findByIdForUpdate,
  updateUser,
  updateProfile,
  findAllForExport,
  findByIdWithStudents,
};