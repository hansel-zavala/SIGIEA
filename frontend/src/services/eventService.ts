// frontend/src/services/eventService.ts
import api from './api';
import { type Category } from './categoryService';

export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  location?: string;
  audience: 'General' | 'Padres' | 'Terapeutas' | 'Personal';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  categoryId?: number | null;
  category?: Category | null;
}

const getAllEvents = async (): Promise<Event[]> => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error("Error al obtener los eventos:", error);
    throw error;
  }
};

const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el evento:", error);
    throw error;
  }
};

const updateEvent = async (id: number, eventData: Partial<Omit<Event, 'id'>>): Promise<Event> => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el evento:", error);
    throw error;
  }
};

const deleteEvent = async (id: number): Promise<void> => {
  try {
    await api.delete(`/events/${id}`);
  } catch (error) {
    console.error("Error al desactivar el evento:", error);
    throw error;
  }
};

const getEventById = async (id: number): Promise<Event> => {
    try {
        const response = await api.get(`/events/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener el evento:", error);
        throw error;
    }
};

export default {
  getAllEvents,
  createEvent,
  updateEvent,
  getEventById,
  deleteEvent,
};