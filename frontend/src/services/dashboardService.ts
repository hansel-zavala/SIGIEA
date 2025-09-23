// frontend/src/services/dashboardService.ts
import api from './api.js';

export interface DashboardStats {
  students?: number;
  therapists?: number;
  parents?: number;
  lecciones?: number;
  studentGrowthPercentage?: number;
  totalSessions?: number;
  completedSessions?: number;
  upcomingSessions?: number;
  recentReports?: number;
  attendanceRate?: number;
  childrenCount?: number;
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

export interface ParentStatusData {
  activeCount: number;
  inactiveCount: number;
  total: number;
  relationshipDistribution: Array<{ relationship: string; count: number }>;
  monthlyRegistrations: Array<{ month: string; count: number }>;
  participationMetrics: {
    guardiansWithActiveStudents: number;
    participationRate: number;
  };
  systemMetrics?: {
    totalStudents: number;
    totalSessions: number;
    sessionCompletionRate: number;
    familiesWithMultipleChildren: number;
    recentActivity: {
      guardians: number;
      sessions: number;
    };
  };
}

export interface StudentBirthDepartment {
  department: string;
  count: number;
}

export interface TherapistAttendanceTrend {
  id: number;
  name: string;
  weekly: Array<{ week: string; attendanceRate: number }>;
  monthly: Array<{ month: string; attendanceRate: number }>;
  yearly: Array<{ year: string; attendanceRate: number }>;
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

const getSessionComparison = async (therapistId?: number | null): Promise<SessionComparison[]> => {
  try {
    const response = await api.get('/dashboard/session-comparison', {
      params: therapistId ? { therapistId } : {}
    });
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

const getParentStatusDistribution = async (): Promise<ParentStatusData> => {
  try {
    const response = await api.get('/dashboard/parent-status-distribution');
    return response.data;
  } catch (error) {
    console.error("Error al obtener la distribución de estado de padres:", error);
    throw error;
  }
};

const getStudentBirthDepartmentDistribution = async (): Promise<StudentBirthDepartment[]> => {
  try {
    const response = await api.get('/dashboard/student-birth-department-distribution');
    return response.data;
  } catch (error) {
    console.error("Error al obtener la distribución por departamento de nacimiento:", error);
    throw error;
  }
};

const getTherapistAttendanceById = async (therapistId: number, range: string): Promise<TherapyAttendance> => {
  try {
    const response = await api.get(`/dashboard/therapist-attendance/${therapistId}?range=${range}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la asistencia del terapeuta ${therapistId}:`, error);
    throw error;
  }
};

const getTherapistAttendanceTrends = async (): Promise<TherapistAttendanceTrend[]> => {
  try {
    const response = await api.get('/dashboard/therapist-attendance-trends');
    return response.data;
  } catch (error) {
    console.error("Error al obtener las tendencias de asistencia de terapeutas:", error);
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
  getParentStatusDistribution,
  getStudentBirthDepartmentDistribution,
  getTherapistAttendanceById,
  getTherapistAttendanceTrends,
};