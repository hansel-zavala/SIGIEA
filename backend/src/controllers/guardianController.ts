// backend/src/controllers/guardianController.ts
import { Request, Response } from 'express';
import * as guardianService from '../services/guardianService.js';
import { GuardianNotFoundError, EmailInUseError, ReactivationError } from '../errors/guardianErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof GuardianNotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof EmailInUseError) {
    return res.status(409).json({ error: error.message, field: error.field });
  }
  if (error instanceof ReactivationError) {
    return res.status(403).json({ error: error.message });
  }
  console.error('Error en guardianController:', error);
  const message = error instanceof Error ? error.message : 'Error interno del servidor.';
  res.status(500).json({ error: message });
};

export const getAllGuardians = async (req: Request, res: Response) => {
  try {
    const result = await guardianService.getAllGuardians(req.query);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getGuardianById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const guardian = await guardianService.getGuardianById(id);
    res.json(guardian);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateGuardian = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const updatedGuardian = await guardianService.updateGuardian(id, req.body);
    res.json(updatedGuardian);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteGuardian = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await guardianService.deleteGuardian(id);
    res.json({ message: 'Guardián desactivado correctamente.' });
  } catch (error) {
    handleError(res, error);
  }
};

export const reactivateGuardian = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const reactivatedGuardian = await guardianService.reactivateGuardian(id);
    res.json({ message: 'Guardián reactivado correctamente.', guardian: reactivatedGuardian });
  } catch (error) {
    handleError(res, error);
  }
};

export const exportGuardians = async (req: Request, res: Response) => {
  try {
    await guardianService.exportGuardians(req.query, res);
  } catch (error) {
    handleError(res, error);
  }
};