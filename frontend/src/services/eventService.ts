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

const getAllEvents = async (options?: { status?: 'active' | 'inactive' | 'all'; search?: string }): Promise<Event[]> => {
  try {
    const { status = 'active', search } = options || {};
    const params: Record<string, string> = { status };
    if (search && search.trim().length > 0) {
      params.search = search.trim();
    }

    const response = await api.get('/events', { params });
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

const reactivateEvent = async (id: number): Promise<Event> => {
  try {
    const response = await api.patch(`/events/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error al reactivar el evento con ID ${id}:`, error);
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

const exportEvents = async (status: 'active' | 'inactive' | 'all' = 'all', format: string = 'csv') => {
  try {
    const response = await api.get('/events/export/download', {
      params: { status, format },
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('Error al exportar eventos:', error);
    throw error;
  }
};

export default {
  getAllEvents,
  createEvent,
  updateEvent,
  getEventById,
  deleteEvent,
  reactivateEvent,
  exportEvents,
};
