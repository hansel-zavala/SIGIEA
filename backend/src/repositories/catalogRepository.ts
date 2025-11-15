// backend/src/repositories/controlRepository.ts
import prisma from '../lib/prisma.js';

const findAllMedicamentos = () => {
  return prisma.medicamento.findMany({
    orderBy: { nombre: 'asc' },
  });
};

const findAllAlergias = () => {
  return prisma.alergia.findMany({
    orderBy: { nombre: 'asc' },
  });
};

const findAllTherapistsList = () => {
  return prisma.therapistProfile.findMany({
    where: { isActive: true },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
    },
    orderBy: { nombres: 'asc' },
  });
};

const findAllLeccionesList = () => {
  return prisma.leccion.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
    },
    orderBy: { title: 'asc' },
  });
};

export const controlRepository = {
  findAllMedicamentos,
  findAllAlergias,
  findAllTherapistsList,
  findAllLeccionesList,
};