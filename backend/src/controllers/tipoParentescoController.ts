// backend/src/controllers/tipoParentescoController.ts
import { Request, Response } from 'express';
import * as tipoParentescoService from '../services/tipoParentescoService.js';
import { TipoParentescoNotFoundError } from '../errors/tipoParentescoErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof TipoParentescoNotFoundError) {
    return res.status(404).json({ message: error.message });
  }
  console.error('Error en tipoParentescoController:', error);
  res.status(500).json({ message: 'Error interno del servidor.' });
};

export const getAllTiposParentesco = async (req: Request, res: Response) => {
  try {
    const result = await tipoParentescoService.getAllTiposParentesco();
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const createTipoParentesco = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    const result = await tipoParentescoService.createTipoParentesco(nombre);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateTipoParentesco = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { nombre } = req.body;
    const result = await tipoParentescoService.updateTipoParentesco(parseInt(id), nombre);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteTipoParentesco = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await tipoParentescoService.deleteTipoParentesco(parseInt(id));
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};