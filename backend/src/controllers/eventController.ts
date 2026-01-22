// backend/src/controllers/eventController.ts
import { Request, Response } from 'express';
import * as eventService from '../services/eventService.js';
import { AuthRequest } from '../types/express.js';

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query as { start?: Date, end?: Date };
    const events = await eventService.getAllEvents(start, end);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los eventos.' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const event = await eventService.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado.' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el evento.' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startDate, endDate, isAllDay, location, audience, categoryId } = req.body;
    
    const newEvent = await eventService.createEvent({
      title,
      description: description || null,
      startDate,
      endDate,
      isAllDay: isAllDay || false,
      location: location || null,
      audience: audience || 'General',
      categoryId: categoryId || null
    });
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: 'No se pudo crear el evento.' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const dataToUpdate = req.body;
    
    const updatedEvent = await eventService.updateEvent(id, dataToUpdate);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ error: 'No se pudo actualizar el evento.' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await eventService.deleteEvent(id);
    res.json({ message: 'Evento eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar el evento.' });
  }
};