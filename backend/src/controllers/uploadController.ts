// backend/src/controllers/uploadController.ts
import { Request, Response } from 'express';
import * as uploadService from '../services/uploadService.js';

export const upload = uploadService.uploadMiddleware;

export const uploadFile = (req: Request, res: Response) => {
  try {
    const filePath = uploadService.processUpload(req.file);
    res.json({ filePath });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al subir el archivo.';
    res.status(400).json({ error: message });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    await uploadService.deleteFile(filename);
    res.json({ message: 'Archivo eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'No se pudo eliminar el archivo.' });
  }
};