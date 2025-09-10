// frontend/src/services/reportTemplateService.ts
import api from './api';

export interface ReportTemplate {
  id: number;
  title: string;
  description: string;
  sections: ReportSection[];
}

export interface ReportSection {
  id: number;
  title: string;
  order: number;
  type: 'ITEMS' | 'TEXT'; // <-- CORRECCIÓN AQUÍ
  items: ReportItem[];
}

export interface ReportItem {
  id: number;
  description: string;
  order: number;
}

interface CreateTemplateData {
  title: string;
  description: string;
  sections: Array<{
    title: string;
    order: number;
    type: 'ITEMS' | 'TEXT'; // <-- Y CORRECCIÓN AQUÍ
    items: Array<{
      description: string;
      order: number;
    }>;
  }>;
}

const getAllTemplates = async (): Promise<ReportTemplate[]> => {
  try {
    const response = await api.get('/report-templates');
    return response.data;
  } catch (error) {
    console.error("Error al obtener las plantillas:", error);
    throw error;
  }
};

const createTemplate = async (data: CreateTemplateData): Promise<ReportTemplate> => {
  try {
    const response = await api.post('/report-templates', data);
    return response.data;
  } catch (error) {
    console.error("Error al crear la plantilla:", error);
    throw error;
  }
};

export default {
  getAllTemplates,
  createTemplate,
};