// frontend/src/services/therapistService.ts
import api from './api.js';

export interface TherapistProfile {
  id: number;
  fullName: string;
  email: string;
  identityNumber: string;
  phone: string | null;
  specialty: 'Psicologo' | 'Terapeuta' | 'Ambos';
  gender: 'Masculino' | 'Femenino' | null;
  dateOfBirth: string | null;
}

// CREATE
const createTherapist = async (therapistData: any) => {
  try {
    const response = await api.post('/therapists', therapistData);
    return response.data;
  } catch (error) { throw error; }
};

// READ (All)
const getAllTherapists = async (): Promise<TherapistProfile[]> => {
  try {
    const response = await api.get('/therapists');
    return response.data;
  } catch (error) { throw error; }
};

// READ (One)
const getTherapistById = async (id: number): Promise<TherapistProfile> => {
  try {
    const response = await api.get(`/therapists/${id}`);
    return response.data;
  } catch (error) { throw error; }
};

// UPDATE
const updateTherapist = async (id: number, therapistData: any) => {
  try {
    const response = await api.put(`/therapists/${id}`, therapistData);
    return response.data;
  } catch (error) { throw error; }
};

// DELETE (Soft Delete)
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