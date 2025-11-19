// backend/src/controllers/leccionController.ts
import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import * as leccionService from '../services/leccionService.js';
import { LeccionNotFoundError } from '../errors/leccionErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof LeccionNotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  console.error('Error en leccionController:', error);
  res.status(500).json({ error: 'Error interno del servidor.' });
};

export const createLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const createdById = req.user?.id;
    if (!createdById) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }
    const newLeccion = await leccionService.createLeccion(req.body, createdById);
    res.status(201).json(newLeccion);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllLecciones = async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : undefined;
    const lecciones = await leccionService.getAllLecciones(status);
    res.json(lecciones);
  } catch (error) {
    handleError(res, error);
  }
};

export const getLeccionById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const leccion = await leccionService.getLeccionById(id);
    res.json(leccion);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedLeccion = await leccionService.updateLeccion(id, req.body);
    res.json(updatedLeccion);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await leccionService.deleteLeccion(id);
    res.json({ message: 'Lección desactivada correctamente.' });
  } catch (error) {
    handleError(res, error);
  }
};

export const activateLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await leccionService.activateLeccion(id);
    res.json({ message: 'Lección activada correctamente.' });
  } catch (error) {
    handleError(res, error);
  }
};

export const exportLecciones = async (req: AuthRequest, res: Response) => {
  try {
    const { status = 'all', format = 'csv' } = req.query as { status: string; format: string };
    await leccionService.exportLecciones(status, format, res);
  } catch (error) {
    handleError(res, error);
  }
};