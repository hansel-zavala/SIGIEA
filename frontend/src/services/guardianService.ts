// frontend/src/services/guardianService.ts
import api from './api';

const getAllGuardians = async (searchTerm?: string, page: number = 1, limit: number = 10, status: string = 'active') => {
  try {
    const params = {
        search: searchTerm,
        page,
        limit,
        status,
    };
    const response = await api.get('/guardians', { params });
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

const reactivateGuardian = async (id: number) => {
  try {
    const response = await api.patch(`/guardians/${id}/reactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error al reactivar el guardián con ID ${id}:`, error);
    throw error;
  }
};

export default {
  getAllGuardians,
  updateGuardian,
  deleteGuardian,
  getGuardianById,
  reactivateGuardian,
};