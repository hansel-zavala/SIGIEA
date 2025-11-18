// backend/src/services/eventService.ts
import { eventRepository } from '../repositories/eventRepository.js';
import { Prisma, type Event } from '@prisma/client';

export const getAllEvents = (start?: Date, end?: Date) => {
  const where: Prisma.EventWhereInput = {};
  if (start && end) {
    where.OR = [
      { startDate: { gte: start, lte: end } },
      { endDate: { gte: start, lte: end } },
      { startDate: { lte: start }, endDate: { gte: end } }
    ];
  }
  return eventRepository.findAll(where);
};

export const getEventById = (id: number) => {
  return eventRepository.findById(id);
};

export const createEvent = (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
  const { categoryId, ...restOfData } = data;
  return eventRepository.create({
    ...restOfData,
    category: categoryId ? { connect: { id: categoryId } } : undefined,
  });
};

export const updateEvent = (id: number, data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>>) => {
  const { categoryId, ...restOfData } = data;

  const dataToUpdate: Prisma.EventUpdateInput = {
    ...restOfData,
  };
  
  if (categoryId) {
    dataToUpdate.category = { connect: { id: categoryId } };
  } else if (categoryId === null) {
    dataToUpdate.category = { disconnect: true };
  }
  return eventRepository.update(id, dataToUpdate);
};

export const deleteEvent = (id: number) => {
  return eventRepository.remove(id);
};