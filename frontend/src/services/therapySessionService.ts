// frontend/src/services/therapySessionService.ts
import api from './api';

// Interfaz para los datos que enviaremos para crear sesiones
interface CreateRecurringSessionsData {
  studentId: number;
  therapistId: number;
  leccionId: number;
  daysOfWeek: string[]; // ["Lunes", "Miércoles"]
  startTime: string; // "14:00"
  duration: number; // 45 (en minutos)
  weeksToSchedule: number; // Cuántas semanas hacia el futuro generar
}

// Llama a la API para crear un lote de sesiones recurrentes
const createRecurringSessions = async (data: CreateRecurringSessionsData) => {
  try {
    // La URL ahora apunta a la ruta que creamos en el backend
    const response = await api.post(`/students/${data.studentId}/sessions`, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear las sesiones recurrentes:", error);
    throw error;
  }
};

// Obtiene todas las sesiones programadas para un estudiante
const getSessionsByStudent = async (studentId: number) => {
    try {
        const response = await api.get(`/students/${studentId}/sessions`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las sesiones del estudiante:", error);
        throw error;
    }
}

const deleteSession = async (studentId: number, sessionId: number) => {
    try {
        const response = await api.delete(`/students/${studentId}/sessions/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar la sesión:", error);
        throw error;
    }
}

const updateSession = async (studentId: number, sessionId: number, data: any) => {
    try {
        const response = await api.put(`/students/${studentId}/sessions/${sessionId}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar la sesión:", error);
        throw error;
    }
}


// (Más adelante añadiremos funciones para actualizar y eliminar sesiones individuales aquí)

export default {
  createRecurringSessions,
  getSessionsByStudent,
  deleteSession,
  updateSession
};