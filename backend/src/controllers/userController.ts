// backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../types/express.js';
import * as userService from '../services/userService.js';
import { UserAlreadyExistsError, InvalidCredentialsError } from '../errors/userErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof UserAlreadyExistsError) {
    return res.status(409).json({ error: error.message });
  }
  if (error instanceof InvalidCredentialsError) {
    return res.status(401).json({ error: error.message });
  }
  console.error('Error en userController:', error);
  res.status(500).json({ error: 'Error interno del servidor.' });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.registerUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    handleError(res, error);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.loginUser(req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'Usuario no encontrado.' });
  }
};