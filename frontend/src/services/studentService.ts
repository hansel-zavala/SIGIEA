// frontend/src/services/studentService.ts

import api from './api';

// --- INTERFAZ AÑADIDA Y EXPORTADA ---
// Aquí definimos la estructura de datos completa de un estudiante
export interface Student {
    id: number;
    nombres: string;
    apellidos: string;
    fullName: string; // Este campo lo construye el backend
    dateOfBirth: string;
    therapist: {
        id: number;
        nombres: string;
        apellidos: string;
        fullName: string;
    } | null;
    reports: {
        id: number;
        reportDate: string;
        template: {
            id: number;
            title: string;
        };
    }[];
    // Agrega otros campos que puedas necesitar mostrar
}

interface StudentsResponse {
  data: Student[];
  total: number;
  page: number;
  totalPages: number;
}

const createStudent = async (data: any): Promise<Student> => {
    const response = await api.post('/students', data);
    return response.data;
};

const getAllStudents = async (search: string, page: number, limit: number): Promise<StudentsResponse> => {
    const response = await api.get('/students', { params: { search, page, limit } });
    return response.data;
};

// La función ahora devuelve el tipo 'Student' que definimos
const getStudentById = async (id: number): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
};

const updateStudent = async (id: number, data: any): Promise<Student> => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
};

const deleteStudent = async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
};


export default {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
};