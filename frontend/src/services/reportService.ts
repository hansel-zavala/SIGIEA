// frontend/src/services/reportService.ts
import api from './api';

export type AcquisitionLevel =
  | 'CONSEGUIDO'
  | 'CON_AYUDA_ORAL'
  | 'CON_AYUDA_GESTUAL'
  | 'CON_AYUDA_FISICA'
  | 'NO_CONSEGUIDO'
  | 'NO_TRABAJADO';

export interface ReportAnswer {
  itemId: number;
  // Para items de tipo 'level'
  level?: AcquisitionLevel | null;
  // Para el resto de tipos (texto, número, fecha, select, multiselect, checkbox, rich_text)
  value?: any;
}

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

export const submitReportAnswers = async (
  reportId: number,
  answers: ReportAnswer[]
) => {
  try {
    const response = await api.put(`/reports/${reportId}`, { answers });
    return response.data;
  } catch (error) {
    console.error("Error al guardar las respuestas del reporte:", error);
    throw error;
  }
};

// Descarga/renderiza un reporte en formato y tamaño indicado
// Llama al endpoint de render para obtener el archivo (PDF/DOCX)
export const downloadReport = async (
  reportId: number,
  format: 'pdf' | 'docx',
  size: 'A4' | 'OFICIO' = 'A4'
) => {
  try {
    const response = await api.get(`/reports/${reportId}/render`, {
      params: { format, size },
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('Error al renderizar/descargar el reporte:', error);
    throw error;
  }
};

export default {
    getStudentsForReporting,
    createReport,
    submitReportAnswers,
    getReportsByStudent,
  getReportById
  ,downloadReport
};
