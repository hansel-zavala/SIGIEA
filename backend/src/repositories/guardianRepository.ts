// backend/src/repositories/guardianRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma, Role } from '@prisma/client';

const findAndCountGuardians = (
  where: Prisma.GuardianWhereInput,
  skip: number,
  take: number
) => {
  return prisma.$transaction([
    prisma.guardian.findMany({
      where,
      include: { students: true },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take,
    }),
    prisma.guardian.count({ where }),
  ]);
};

const findById = (id: number) => {
  return prisma.guardian.findFirst({
    where: { id, isActive: true },
    include: {
      students: true,
      user: true,
    },
  });
};

const findByIdForUpdate = (id: number) => {
  return prisma.guardian.findUnique({
    where: { id },
  });
};

const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

const updateUser = (id: number, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

const createUser = (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data });
};

const update = (id: number, data: Prisma.GuardianUpdateInput) => {
  return prisma.guardian.update({
    where: { id },
    data,
  });
};

const findByIdWithStudents = (id: number) => {
  return prisma.guardian.findUnique({
    where: { id },
    include: { students: true },
  });
};

const findAllForExport = (where: Prisma.GuardianWhereInput) => {
  return prisma.guardian.findMany({
    where,
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      numeroIdentidad: true,
      telefono: true,
      parentesco: true,
      isActive: true,
      students: {
        select: {
          nombres: true,
          apellidos: true,
          isActive: true,
        },
        orderBy: { isActive: 'desc' },
        take: 1,
      },
    },
  });
};


export const guardianRepository = {
  findAndCountGuardians,
  findById,
  findByIdForUpdate,
  findUserByEmail,
  updateUser,
  createUser,
  update,
  findByIdWithStudents,
  findAllForExport,
};