// frontend/src/services/therapyPlanService.ts
import api from './api';

// El studentId es necesario para construir la URL correcta
const deletePlan = async (studentId: number, planId: number) => {
  try {
    // Construimos la URL anidada completa
    const response = await api.delete(`/students/${studentId}/plans/${planId}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el plan:", error);
    throw error;
  }
};

const getPlanById = async (studentId: number, planId: number) => {
  try {
    const response = await api.get(`/students/${studentId}/plans/${planId}`); // Necesitamos un endpoint para esto, lo crearemos
    return response.data;
  } catch (error) { throw error; }
};

// ✅ NUEVA FUNCIÓN PARA ACTUALIZAR UN PLAN
const updatePlan = async (studentId: number, planId: number, planData: any) => {
    try {
        const response = await api.put(`/students/${studentId}/plans/${planId}`, planData);
        return response.data;
    } catch (error) { throw error; }
};

export default {
  deletePlan,
  getPlanById,
  updatePlan,
};