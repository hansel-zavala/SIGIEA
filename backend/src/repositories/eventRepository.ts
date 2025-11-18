// backend/src/repositories/eventRepository.ts
import { Prisma, type Event } from '@prisma/client';
import prisma from '../lib/prisma.js';

const findAll = (where: Prisma.EventWhereInput) => {
  return prisma.event.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  });
};

const findById = (id: number) => {
  return prisma.event.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
};

const create = (data: Prisma.EventCreateInput) => {
  return prisma.event.create({
    data,
  });
};

const update = (id: number, data: Prisma.EventUpdateInput) => {
  return prisma.event.update({
    where: { id },
    data,
  });
};

const remove = (id: number) => {
  return prisma.event.delete({
    where: { id },
  });
};

export const eventRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
};