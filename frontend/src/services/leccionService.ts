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

export default {
  getAllLecciones,
};