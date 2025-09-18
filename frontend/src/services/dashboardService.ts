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
  range: string;
  count: number;
}

export interface DiagnosisDistribution {
  diagnosis: string;
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
  const response = await api.get('/dashboard/therapy-attendance');
  return response.data;
};

const getStudentAgeDistribution = async (): Promise<StudentAgeDistribution[]> => {
  return Promise.resolve([
    { range: '3-5', count: 10 },
    { range: '6-8', count: 15 },
    { range: '9-12', count: 20 },
  ]);
};

const getDiagnosisDistribution = async (): Promise<DiagnosisDistribution[]> => {
  return Promise.resolve([
    { diagnosis: 'TEA', count: 25 },
    { diagnosis: 'TDAH', count: 15 },
    { diagnosis: 'Down', count: 5 },
  ]);
};

const getTherapistWorkload = async (): Promise<TherapistWorkload[]> => {
  return Promise.resolve([
    { therapist: 'Ana', load: 10 },
    { therapist: 'Juan', load: 12 },
    { therapist: 'Maria', load: 8 },
  ]);
};

const getMostFrequentTherapies = async (): Promise<FrequentTherapies[]> => {
  return Promise.resolve([
    { therapy: 'Lenguaje', count: 30 },
    { therapy: 'Ocupacional', count: 25 },
    { therapy: 'Física', count: 15 },
  ]);
};

const getSessionComparison = async (): Promise<SessionComparison[]> => {
  return Promise.resolve([
    { month: 'Enero', planned: 50, completed: 45 },
    { month: 'Febrero', planned: 60, completed: 55 },
    { month: 'Marzo', planned: 70, completed: 65 },
  ]);
};

export default {
  getStats,
  getTherapyAttendance,
  getStudentAgeDistribution,
  getDiagnosisDistribution,
  getTherapistWorkload,
  getMostFrequentTherapies,
  getSessionComparison,
};