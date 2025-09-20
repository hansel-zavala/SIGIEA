// frontend/src/services/leccionService.ts
import api from './api';

export type LeccionStatusFilter = 'active' | 'inactive' | 'all';

export interface LeccionSummary {
  id: number;
  title: string;
  objective: string;
  description?: string | null;
  category?: string | null;
  keySkill?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeccionDetail extends LeccionSummary {
  createdBy?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
}

const getAllLecciones = async (status: LeccionStatusFilter = 'active'): Promise<LeccionSummary[]> => {
  try {
    const response = await api.get<LeccionSummary[]>('/lecciones', { params: { status } });
    return response.data;
  } catch (error) {
    console.error("Error al obtener las lecciones:", error);
    throw error;
  }
};

const createLeccion = async (leccionData: any) => {
  try {
    const response = await api.post('/lecciones', leccionData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la lección:", error);
    throw error;
  }
};

const getLeccionById = async (id: number): Promise<LeccionDetail> => {
  try {
    const response = await api.get<LeccionDetail>(`/lecciones/${id}`);
    return response.data;
  } catch (error) { throw error; }
};

const updateLeccion = async (id: number, leccionData: any) => {
    try {
        const response = await api.put(`/lecciones/${id}`, leccionData);
        return response.data;
    } catch (error) { throw error; }
};

const deleteLeccion = async (id: number) => {
    try {
        const response = await api.delete(`/lecciones/${id}`);
        return response.data;
    } catch (error) { throw error; }
};

const activateLeccion = async (id: number) => {
  try {
    const response = await api.patch(`/lecciones/${id}/activate`);
    return response.data;
  } catch (error) { throw error; }
};

const exportLecciones = async (status: LeccionStatusFilter = 'all', format: string = 'csv') => {
  try {
    const response = await api.get('/lecciones/export/download', {
      params: { status, format },
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('Error al exportar lecciones:', error);
    throw error;
  }
};

export default {
  getAllLecciones,
  createLeccion,
  getLeccionById,
  updateLeccion,
  deleteLeccion,
  activateLeccion,
  exportLecciones
};
