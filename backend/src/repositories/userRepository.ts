// backend/src/repositories/userRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const findByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

const create = (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data });
};

export const userRepository = {
  findByEmail,
  create,
};