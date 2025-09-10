// frontend/src/services/therapistService.ts
import api from './api.js';

interface StudentForProfile {
  id: number;
  fullName: string;
  jornada: string;
}

export interface TherapistProfile {
  password?: string;
  id: number;
  nombres: string;
  apellidos: string;
  fullName: string;
  email: string;
  specialty: string;
  phone: string | null;
  identityNumber: string;
  gender: 'Masculino' | 'Femenino' | null;
  dateOfBirth: string | null;
  lugarNacimiento?: string | null;
  direccion?: string | null;
  hireDate?: string | null;
  identityCardUrl?: string | null;
  resumeUrl?: string | null;
  workDays?: string[];
  workStartTime?: string;
  workEndTime?: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  assignedStudents?: StudentForProfile[]; 
}

const createTherapist = async (therapistData: any) => {
  try {
    const response = await api.post('/therapists', therapistData);
    return response.data;
  } catch (error) { throw error; }
};

const getAllTherapists = async (searchTerm?: string, page: number = 1, limit: number = 10): Promise<{ data: TherapistProfile[], total: number }> => {
  try {
    const params = {
        search: searchTerm,
        page,
        limit,
    };
    const response = await api.get('/therapists', { params });
    return response.data;
  } catch (error) { throw error; }
};

const getTherapistById = async (id: number): Promise<TherapistProfile> => {
  try {
    const response = await api.get(`/therapists/${id}`);
    return response.data;
  } catch (error) { throw error; }
};

const updateTherapist = async (id: number, therapistData: any) => {
  try {
    const response = await api.put(`/therapists/${id}`, therapistData);
    return response.data;
  } catch (error) { throw error; }
};

const deleteTherapist = async (id: number) => {
  try {
    const response = await api.delete(`/therapists/${id}`);
    return response.data;
  } catch (error) { throw error; }
};

export default {
  createTherapist,
  getAllTherapists,
  getTherapistById,
  updateTherapist,
  deleteTherapist,
};