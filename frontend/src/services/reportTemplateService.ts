// frontend/src/services/reportTemplateService.ts
import api from './api';

export type ReportItemType =
  | 'short_text'
  | 'long_text'
  | 'rich_text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'level';

export type ReportItemWidth = 'FULL' | 'HALF' | 'THIRD' | 'TWO_THIRDS';

export interface ReportItem {
  id: number;
  label: string;
  description?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  required: boolean;
  maxLength?: number | null;
  type: ReportItemType;
  width: ReportItemWidth;
  options?: any | null;
  defaultValue?: any | null;
  key?: string | null;
  order: number;
}

export interface ReportSection {
  id: number;
  title: string;
  description?: string | null;
  order: number;
  items: ReportItem[];
}

export interface ReportTemplate {
  id: number;
  title: string;
  description?: string | null;
  version: number;
  publishedAt?: string | null;
  sections: ReportSection[];
}

export interface CreateTemplateData {
  title: string;
  description?: string;
  version?: number;
  publish?: boolean;
  sections: Array<{
    title: string;
    description?: string;
    order: number;
    items: Array<{
      label: string;
      description?: string;
      placeholder?: string;
      helpText?: string;
      required?: boolean;
      maxLength?: number;
      type: ReportItemType;
      width?: ReportItemWidth;
      options?: any;
      defaultValue?: any;
      key?: string;
      order: number;
    }>;
  }>;
}

const getAllTemplates = async (): Promise<ReportTemplate[]> => {
  const response = await api.get('/report-templates');
  return response.data;
};

const getPublishedTemplates = async (): Promise<ReportTemplate[]> => {
  const response = await api.get('/report-templates-public/published');
  return response.data;
};

const getTemplateById = async (id: number): Promise<ReportTemplate> => {
  const response = await api.get(`/report-templates/${id}`);
  return response.data;
};

const getTemplateByIdPublic = async (id: number): Promise<ReportTemplate> => {
  const response = await api.get(`/report-templates-public/${id}`);
  return response.data;
};

const createTemplate = async (data: CreateTemplateData): Promise<ReportTemplate> => {
  const response = await api.post('/report-templates', data);
  return response.data;
};

const cloneTemplate = async (id: number): Promise<ReportTemplate> => {
  const response = await api.post(`/report-templates/${id}/clone`);
  return response.data;
};

const publishTemplate = async (id: number, publish: boolean): Promise<ReportTemplate> => {
  const response = await api.patch(`/report-templates/${id}/publish`, { publish });
  return response.data;
};

const deleteTemplate = async (id: number): Promise<void> => {
  await api.patch(`/report-templates/${id}`, { isActive: false });
};

const updateTemplateMeta = async (
  id: number,
  data: { title?: string; description?: string; isActive?: boolean }
): Promise<ReportTemplate> => {
  const response = await api.patch(`/report-templates/${id}`, data);
  return response.data;
};

export default {
  getAllTemplates,
  getPublishedTemplates,
  getTemplateById,
  getTemplateByIdPublic,
  createTemplate,
  cloneTemplate,
  publishTemplate,
  deleteTemplate,
  updateTemplateMeta,
};
