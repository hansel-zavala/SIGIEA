// frontend/src/services/guardianService.ts
import api from './api';

const getAllGuardians = async (searchTerm?: string, page: number = 1, limit: number = 10) => {
  try {
    const params = {
        search: searchTerm,
        page,
        limit,
    };
    const response = await api.get('/guardians', { params });
    return response.data; // Devolverá { data: [], total: X, ... }
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