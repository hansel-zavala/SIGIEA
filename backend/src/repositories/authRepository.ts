// backend/src/repositories/authRepository.ts
import prisma from '../lib/prisma.js';

const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const updateUserResetCode = (userId: number, code: string, expires: Date) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      resetCode: code,
      resetCodeExpiry: expires,
    },
  });
};

const updateUserPassword = (userId: number, hashedPassword: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpiry: null,
    },
  });
};

export const authRepository = {
  findUserByEmail,
  updateUserResetCode,
  updateUserPassword,
};