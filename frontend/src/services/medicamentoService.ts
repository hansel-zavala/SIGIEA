// frontend/src/services/medicamentoService.ts
import api from './api';

export interface Medicamento {
  id: number;
  nombre: string;
}

const getAll = async (): Promise<Medicamento[]> => {
  try {
    const response = await api.get('/medicamentos');
    return response.data;
  } catch (error) {
    console.error("Error al obtener los medicamentos:", error);
    throw error;
  }
};

const create = async (nombre: string): Promise<Medicamento> => {
  try {
    const response = await api.post('/medicamentos', { nombre });
    return response.data;
  } catch (error) {
    console.error("Error al crear el medicamento:", error);
    throw error;
  }
};

const update = async (id: number, nombre: string): Promise<Medicamento> => {
  try {
    const response = await api.put(`/medicamentos/${id}`, { nombre });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el medicamento:", error);
    throw error;
  }
};

const remove = async (id: number): Promise<any> => {
  try {
    const response = await api.delete(`/medicamentos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el medicamento:", error);
    throw error;
  }
};

export default {
  getAll,
  create,
  update,
  remove,
};