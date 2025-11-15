// src/controllers/documentController.ts
import type { Response } from 'express';
import fsp from 'fs/promises';
import type { AuthRequest } from '../types/express.js';
import * as documentService from '../services/documentService.js';
import { DocumentError, DocumentNotFoundError, FileAccessError } from '../services/documentService.js';

export const documentUpload = documentService.documentUpload;

const handleError = (res: Response, error: unknown) => {
  console.error('Error en documentController:', error);
  if (error instanceof DocumentNotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof FileAccessError) {
    return res.status(410).json({ error: error.message });
  }
  if (error instanceof DocumentError) {
    return res.status(400).json({ error: error.message });
  }
  const message = error instanceof Error ? error.message : 'Error desconocido en el servidor.';
  res.status(500).json({ error: message });
};

export const listDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const result = await documentService.listDocuments(req.query);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Se requiere un archivo para subir.' });
    }

    const document = await documentService.createDocument(file, req.body, req.user);
    res.status(201).json({ document });

  } catch (error) {
    handleError(res, error);
  } finally {

    if (req.file) {
      try {
        await fsp.rm(req.file.path, { force: true });
      } catch (err) {
      }
    }
  }
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { filePath, fileName, mimeType } = await documentService.getDownloadableDocument(id);
    
    res.setHeader('Content-Type', mimeType);
    res.download(filePath, fileName);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await documentService.deleteDocument(id);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};