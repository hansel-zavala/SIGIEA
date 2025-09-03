// frontend/src/services/dashboardService.ts
import api from './api.js';

export interface DashboardStats {
  students: number;
  therapists: number;
  parents: number;
  lecciones: number;
  studentGrowthPercentage: number;
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

export default {
  getStats,
};