// backend/src/controllers/eventController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      include: {
        category: true, 
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los eventos.' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, startDate, endDate } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'El título y las fechas de inicio y fin son obligatorios.' });
    }

    const newEvent = await prisma.event.create({
      data: {
        ...req.body,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error al crear el evento:", error);
    res.status(500).json({ error: 'No se pudo crear el evento.' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findFirst({
      where: { id: parseInt(id), isActive: true },
    });
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado.' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el evento.' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dataToUpdate = req.body;

    if (dataToUpdate.startDate) {
        dataToUpdate.startDate = new Date(dataToUpdate.startDate);
    }
    if (dataToUpdate.endDate) {
        dataToUpdate.endDate = new Date(dataToUpdate.endDate);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el evento.' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.event.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    res.json({ message: 'Evento desactivado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo desactivar el evento.' });
  }
};