// backend/src/repositories/medicamentoRepository.ts
import prisma from '../lib/prisma.js';

const findAll = () => {
  return prisma.medicamento.findMany({
    orderBy: { nombre: 'asc' },
  });
};

const create = (nombre: string) => {
  return prisma.medicamento.create({
    data: { nombre },
  });
};

const update = (id: number, nombre: string) => {
  return prisma.medicamento.update({
    where: { id },
    data: { nombre },
  });
};

const remove = (id: number) => {
  return prisma.medicamento.delete({
    where: { id },
  });
};

const countStudentsWithMedicamento = (id: number) => {
  return prisma.student.count({
    where: {
      medicamentos: {
        some: { id },
      },
    },
  });
};

export const medicamentoRepository = {
  findAll,
  create,
  update,
  remove,
  countStudentsWithMedicamento,
};