// backend/src/repositories/tipoParentescoRepository.ts
import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';

const findAll = () => {
  return prisma.tipoParentesco.findMany();
};

const findById = (id: number) => {
  return prisma.tipoParentesco.findUnique({
    where: { id },
  });
};

const create = (data: Prisma.TipoParentescoCreateInput) => {
  return prisma.tipoParentesco.create({
    data,
  });
};

const update = (id: number, data: Prisma.TipoParentescoUpdateInput) => {
  return prisma.tipoParentesco.update({
    where: { id },
    data,
  });
};

const remove = (id: number) => {
  return prisma.tipoParentesco.delete({
    where: { id },
  });
};

export const tipoParentescoRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
};