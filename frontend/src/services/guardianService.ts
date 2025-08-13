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

const updateGuardian = async (id: number, guardianData: any) => {
    try {
        const response = await api.put(`/guardians/${id}`, guardianData);
        return response.data;
    } catch (error) { throw error; }
};

const deleteGuardian = async (id: number) => {
    try {
        const response = await api.delete(`/guardians/${id}`);
        return response.data;
    } catch (error) { throw error; }
};

const getGuardianById = async (id: number) => {
    try {
        const response = await api.get(`/guardians/${id}`);
        return response.data;
    } catch (error) { throw error; }
};

export default {
  getAllGuardians,
  updateGuardian,
  deleteGuardian,
  getGuardianById,
};