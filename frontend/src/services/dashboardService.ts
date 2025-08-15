// frontend/src/services/dashboardService.ts
import api from './api.js';

// Definimos la "forma" de los datos que esperamos recibir del backend
export interface DashboardStats {
  students: number;
  therapists: number;
  parents: number;
}

// Función para pedir las estadísticas a la API
const getStats = async (): Promise<DashboardStats> => {
  try {
    // Hacemos la petición GET al endpoint que creamos en el backend
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error("Error al obtener las estadísticas:", error);
    throw error;
  }
};

// Exportamos la función para poder usarla en nuestra página del Dashboard
export default {
  getStats,
};