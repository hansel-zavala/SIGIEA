// frontend/src/services/leccionService.ts
import api from './api';

const getAllLecciones = async () => {
  try {
    const response = await api.get('/lecciones');
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

const getLeccionById = async (id: number) => {
    try {
        const response = await api.get(`/lecciones/${id}`);
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

export default {
  getAllLecciones,
  createLeccion,
  getLeccionById,
  updateLeccion,
  deleteLeccion
};