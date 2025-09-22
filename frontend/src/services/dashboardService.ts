// frontend/src/services/dashboardService.ts
import api from './api.js';

export interface DashboardStats {
  students: number;
  therapists: number;
  parents: number;
  lecciones: number;
  studentGrowthPercentage: number;
}

export interface TherapyAttendance {
  attendanceRate: number;
}

export interface StudentAgeDistribution {
  age: number;
  count: number;
}

export interface TherapistWorkload {
  therapist: string;
  load: number;
}

export interface FrequentTherapies {
  therapy: string;
  count: number;
}

export interface SessionComparison {
  month: string;
  planned: number;
  completed: number;
  absent: number;
  cancelled: number;
}

const getStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error("Error al obtener las estadísticas:", error);
    throw error;
  }
};

const getTherapyAttendance = async (): Promise<TherapyAttendance> => {
  try {
    const response = await api.get('/dashboard/therapy-attendance');
    return response.data;
  } catch (error) {
    console.error("Error al obtener la asistencia a terapias:", error);
    throw error;
  }
};

const getStudentAgeDistribution = async (): Promise<StudentAgeDistribution[]> => {
  try {
    const response = await api.get('/dashboard/student-age-distribution');
    return response.data;
  } catch (error) {
    console.error("Error al obtener la distribución por edad:", error);
    throw error;
  }
};

const getTherapistWorkload = async (): Promise<TherapistWorkload[]> => {
  try {
    const response = await api.get('/dashboard/therapist-workload');
    return response.data;
  } catch (error) {
    console.error("Error al obtener la carga de trabajo:", error);
    throw error;
  }
};

const getMostFrequentTherapies = async (): Promise<FrequentTherapies[]> => {
  try {
    const response = await api.get('/dashboard/most-frequent-therapies');
    return response.data;
  } catch (error) {
    console.error("Error al obtener las terapias más frecuentes:", error);
    throw error;
  }
};

const getSessionComparison = async (): Promise<SessionComparison[]> => {
  try {
    const response = await api.get('/dashboard/session-comparison');
    return response.data;
  } catch (error) {
    console.error("Error al obtener la comparación de sesiones:", error);
    throw error;
  }
};

const getGenderDistribution = async (): Promise<{ maleCount: number; femaleCount: number; total: number }> => {
  try {
    const response = await api.get('/dashboard/gender-distribution');
    return response.data;
  } catch (error) {
    console.error("Error al obtener la distribución por género:", error);
    throw error;
  }
};

export default {
  getStats,
  getTherapyAttendance,
  getStudentAgeDistribution,
  getTherapistWorkload,
  getMostFrequentTherapies,
  getSessionComparison,
  getGenderDistribution,
};