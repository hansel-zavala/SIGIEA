// frontend/src/services/studentService.ts
import api from './api';

// ✅ PASO 1: Definimos un tipo para los datos de entrada de un nuevo estudiante
type StudentInput = {
  fullName: string;
  dateOfBirth: string;
  diagnosis?: string; // El '?' hace que estos campos sean opcionales
  supportLevel?: string;
};

// --- Función para obtener todos los estudiantes (sin cambios) ---
const getAllStudents = async () => {
  try {
    const response = await api.get('/students');
    return response.data;
  } catch (error) {
    console.error("Error al obtener los estudiantes:", error);
    throw error;
  }
};

// --- Función para crear un estudiante (Modificada) ---
// ✅ PASO 2: Aplicamos el nuevo tipo al parámetro de la función
const createStudent = async (studentData: StudentInput) => {
  try {
    const response = await api.post('/students', studentData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el estudiante:", error);
    throw error;
  }
};

// ✅ NUEVA FUNCIÓN PARA ELIMINAR UN ESTUDIANTE
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

export default {
  getAllStudents,
  createStudent,
  deleteStudent,
  getStudentById,
  updateStudent,
};
