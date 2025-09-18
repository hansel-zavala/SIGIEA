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
  const response = await api.get('/dashboard/stats');
  return response.data;
};

const getTherapyAttendance = async (): Promise<TherapyAttendance> => {
  const response = await api.get('/dashboard/therapy-attendance');
  return response.data;
};

const getStudentAgeDistribution = async (): Promise<StudentAgeDistribution[]> => {
  const response = await api.get('/dashboard/student-age-distribution');
  return response.data;
};

const getDiagnosisDistribution = async (): Promise<DiagnosisDistribution[]> => {
  return Promise.resolve([
    { diagnosis: 'TEA', count: 25 },
    { diagnosis: 'TDAH', count: 15 },
    { diagnosis: 'Down', count: 5 },
  ]);
};

const getTherapistWorkload = async (): Promise<TherapistWorkload[]> => {
  const response = await api.get('/dashboard/therapist-workload');
  return response.data;
};

const getMostFrequentTherapies = async (): Promise<FrequentTherapies[]> => {
  const response = await api.get('/dashboard/most-frequent-therapies');
  return response.data;
};

const getSessionComparison = async (): Promise<SessionComparison[]> => {
  const response = await api.get('/dashboard/session-comparison');
  return response.data;
};

const getTherapistAttendanceById = async (therapistId: number, range: string): Promise<TherapyAttendance> => {
  const response = await api.get(`/dashboard/therapist-attendance/${therapistId}?range=${range}`);
  return response.data;
};

export default {
  getStats,
  getTherapyAttendance,
  getStudentAgeDistribution,
  getDiagnosisDistribution,
  getTherapistWorkload,
  getMostFrequentTherapies,
  getSessionComparison,
  getTherapistAttendanceById,
};