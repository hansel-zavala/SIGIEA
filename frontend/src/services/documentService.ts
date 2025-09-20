// frontend/src/services/documentService.ts
import api from './api';

export type DocumentOwnerType = 'STUDENT' | 'THERAPIST' | 'GUARDIAN' | 'MISC';

export interface DocumentRecord {
  id: number;
  ownerType: DocumentOwnerType;
  ownerId: number | null;
  title: string;
  description: string | null;
  category: string | null;
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  uploadedBy: number | null;
  metadata: unknown;
  createdAt: string | Date;
  updatedAt: string | Date;
  fileUrl: string;
  readOnly?: boolean;
  source?: 'archivero' | 'legacy';
}

export interface DocumentListResponse {
  data: DocumentRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface ListParams {
  ownerType?: DocumentOwnerType;
  ownerId?: number | null;
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

const listDocuments = async (params: ListParams): Promise<DocumentListResponse> => {
  const response = await api.get('/documents', { params });
  return response.data;
};

const uploadDocument = async (formData: FormData) => {
  const response = await api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

const deleteDocument = async (id: number) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

const apiBaseUrl = api.defaults.baseURL ?? '';
const publicBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

const buildDownloadUrl = (document: DocumentRecord) => {
  if (document.fileUrl.startsWith('http')) {
    return document.fileUrl;
  }
  return `${publicBaseUrl}${document.fileUrl}`;
};

export default {
  listDocuments,
  uploadDocument,
  deleteDocument,
  buildDownloadUrl,
};
