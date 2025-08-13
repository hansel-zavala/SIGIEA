// frontend/src/services/uploadService.ts

import api from './api';

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    throw error;
  }
};

export default {
  uploadFile,
};