// frontend/src/services/sessionLogService.ts
import api from './api';

// Definimos la forma de los datos que enviaremos
interface LogData {
  date: string;
  attendance: 'Presente' | 'Ausente' | 'Justificado';
  notes: string;
  behavior?: string;
  progress?: string;
  therapyPlanId: number;
}

const createLog = async (studentId: number, logData: LogData) => {
  try {
    const response = await api.post(`/students/${studentId}/sessions`, logData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el registro de sesión:", error);
    throw error;
  }
};

export default {
  createLog,
};