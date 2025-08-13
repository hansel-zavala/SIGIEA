// frontend/src/services/guardianService.ts
import api from './api';

const getAllGuardians = async () => {
  try {
    const response = await api.get('/guardians');
    return response.data;
  } catch (error) {
    console.error("Error al obtener los guardianes:", error);
    throw error;
  }
};

export default {
  getAllGuardians,
};