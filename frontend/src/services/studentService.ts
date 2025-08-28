// frontend/src/services/studentService.ts
import api from './api';

type StudentInput = {
  fullName: string;
  dateOfBirth: string;
  diagnosis?: string;
  supportLevel?: string;
};

const getAllStudents = async (searchTerm?: string, page: number = 1, limit: number = 10) => {
  try {
    const params = {
        search: searchTerm,
        page,
        limit,
    };
    const response = await api.get('/students', { params });
    return response.data;
  } catch (error) {
    console.error("Error al obtener los estudiantes:", error);
    throw error;
  }
};

const createStudent = async (studentData: StudentInput) => {
  try {
    const response = await api.post('/students', studentData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el estudiante:", error);
    throw error;
  }
};

const deleteStudent = async (id: number) => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el estudiante con ID ${id}:`, error);
    throw error;
  }
};

const getStudentById = async (id: number) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el estudiante con ID ${id}:`, error);
    throw error;
  }
};

const updateStudent = async (id: number, studentData: Partial<StudentInput>) => {
    try {
        const response = await api.put(`/students/${id}`, studentData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el estudiante con ID ${id}:`, error);
        throw error;
    }
};

const assignTherapyPlan = async (studentId: number, planData: any) => {
    try {
        // Usamos la ruta anidada que creamos en el backend
        const response = await api.post(`/students/${studentId}/plans`, planData);
        return response.data;
    } catch (error) {
        console.error(`Error al asignar el plan al estudiante con ID ${studentId}:`, error);
        throw error;
    }
};

export default {
  getAllStudents,
  createStudent,
  deleteStudent,
  getStudentById,
  updateStudent,
  assignTherapyPlan,
};
