// frontend/src/services/alergiaService.ts
import api from './api';

export interface Alergia {
  id: number;
  nombre: string;
}

const getAll = async (): Promise<Alergia[]> => {
  try {
    const response = await api.get('/alergias');
    return response.data;
  } catch (error) {
    console.error("Error al obtener las alergias:", error);
    throw error;
  }
};

const create = async (nombre: string): Promise<Alergia> => {
  try {
    const response = await api.post('/alergias', { nombre });
    return response.data;
  } catch (error) {
    console.error("Error al crear la alergia:", error);
    throw error;
  }
};

const update = async (id: number, nombre: string): Promise<Alergia> => {
  try {
    const response = await api.put(`/alergias/${id}`, { nombre });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar la alergia:", error);
    throw error;
  }
};

const remove = async (id: number): Promise<any> => {
  try {
    const response = await api.delete(`/alergias/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar la alergia:", error);
    throw error;
  }
};

export default {
  getAll,
  create,
  update,
  remove,
};