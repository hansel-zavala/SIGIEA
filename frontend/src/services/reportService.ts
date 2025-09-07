// frontend/src/services/reportService.ts
import api from './api';

export const getStudentsForReporting = async () => {
  try {
    const response = await api.get('/students?limit=1000'); 
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener estudiantes para reportes:", error);
    throw error;
  }
};

export const createReport = async (studentId: number, templateId: number) => {
    try {
        const response = await api.post('/reports', { studentId, templateId });
        return response.data;
    } catch (error) {
        console.error("Error al crear el reporte:", error);
        throw error;
    }
}

export const getReportsByStudent = async (studentId: number) => {
    try {
        const response = await api.get(`/reports/student/${studentId}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener los reportes del estudiante:", error);
        throw error;
    }
};

export const getReportById = async (reportId: number) => {
    try {
        const response = await api.get(`/reports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener el detalle del reporte:", error);
        throw error;
    }
};

export const submitReportAnswers = async (reportId: number, data: any) => {
    try {
        const response = await api.put(`/reports/${reportId}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al guardar las respuestas del reporte:", error);
        throw error;
    }
};

export default {
    getStudentsForReporting,
    createReport,
    submitReportAnswers,
    getReportsByStudent,
    getReportById
};