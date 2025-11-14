// backend/src/repositories/alergiaRepository.ts
import prisma from "../lib/prisma.js";

const findAll = () => {
  return prisma.alergia.findMany({
    orderBy: { nombre: "asc" },
  });
};

const create = (nombre: string) => {
  return prisma.alergia.create({
    data: { nombre },
  });
};

const update = (id: number, nombre: string) => {
  return prisma.alergia.update({
    where: { id },
    data: { nombre },
  });
};

const remove = (id: number) => {
  return prisma.alergia.delete({
    where: { id },
  });
};

const countStudentsWithAlergia = (id: number) => {
  return prisma.student.count({
    where: {
      alergias: {
        some: { id },
      },
    },
  });
};

export const alergiaRepository = {
  findAll,
  create,
  update,
  remove,
  countStudentsWithAlergia,
};
