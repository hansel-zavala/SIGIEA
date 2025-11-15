// backend/src/repositories/categoryRepository.ts
import prisma from '../lib/prisma.js';

const findAll = () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
};

const create = (name: string, color: string) => {
  return prisma.category.create({
    data: { name, color },
  });
};

const update = (id: number, name?: string, color?: string) => {
  return prisma.category.update({
    where: { id },
    data: { name, color }, // Solo actualiza los campos proporcionados
  });
};

const remove = (id: number) => {
  return prisma.category.delete({
    where: { id },
  });
};

/**
 * Cuenta cuántos eventos están usando una categoría específica.
 */
const countEventsByCategoryId = (id: number) => {
  return prisma.event.count({
    where: { categoryId: id },
  });
};

export const categoryRepository = {
  findAll,
  create,
  update,
  remove,
  countEventsByCategoryId,
};