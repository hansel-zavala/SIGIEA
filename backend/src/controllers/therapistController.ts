// backend/src/controllers/therapistController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../types/express.js';
import * as therapistService from '../services/therapistService.js';
import { 
  TherapistNotFoundError, 
  EmailInUseError, 
  IdentityInUseError 
} from '../errors/therapistErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof TherapistNotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof EmailInUseError || error instanceof IdentityInUseError) {
    return res.status(409).json({ error: error.message });
  }
  console.error('Error en therapistController:', error);
  res.status(500).json({ error: 'Error interno del servidor.' });
};

export const createTherapist = async (req: Request, res: Response) => {
  try {
    const newTherapist = await therapistService.createTherapist(req.body);
    res.status(201).json(newTherapist);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllTherapists = async (req: AuthRequest, res: Response) => {
  try {
    const result = await therapistService.getAllTherapists(req.query, req.user);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getTherapistById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const therapist = await therapistService.getTherapistById(id);
    res.json(therapist);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateTherapist = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const updated = await therapistService.updateTherapist(id, req.body);
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteTherapist = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await therapistService.toggleTherapistStatus(id, false);
    res.json({ message: 'Terapeuta desactivado correctamente.' });
  } catch (error) {
    handleError(res, error);
  }
};

export const reactivateTherapist = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await therapistService.toggleTherapistStatus(id, true);
    res.json({ message: 'Terapeuta reactivado correctamente.' });
  } catch (error) {
    handleError(res, error);
  }
};

export const exportTherapists = async (req: Request, res: Response) => {
  try {
    await therapistService.exportTherapists(req.query, res);
  } catch (error) {
    handleError(res, error);
  }
};

export const exportAssignedStudents = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const format = req.query.format as string || 'csv';
    await therapistService.exportAssignedStudents(id, format, res);
  } catch (error) {
    handleError(res, error);
  }
};