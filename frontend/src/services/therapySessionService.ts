// frontend/src/services/therapySessionService.ts
import api from './api';

interface CreateRecurringSessionsData {
  studentId: number;
  therapistId: number;
  leccionId: number;
  daysOfWeek: string[];
  startTime: string;
  duration: number;
  weeksToSchedule: number;
}

const createRecurringSessions = async (data: CreateRecurringSessionsData) => {
  try {
    const response = await api.post(`/students/${data.studentId}/sessions`, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear las sesiones recurrentes:", error);
    throw error;
  }
};

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

const getSessionsByTherapist = async (therapistId: number) => {
    try {
        const response = await api.get(`/therapists/${therapistId}/sessions`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las sesiones del terapeuta:", error);
        throw error;
    }
}

export default {
  createRecurringSessions,
  getSessionsByStudent,
  deleteSession,
  updateSession,
  getSessionsByTherapist
};