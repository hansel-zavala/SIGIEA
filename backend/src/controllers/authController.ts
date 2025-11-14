// backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import { AuthError, RateLimitError } from '../errors/authErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof RateLimitError) {
    return res.status(429).json({ 
      error: error.message, 
      timeLeft: error.timeLeft 
    });
  }
  if (error instanceof AuthError) {
    return res.status(400).json({ 
      error: error.message, 
      field: error.field || null 
    });
  }
  console.error("Error no controlado en authController:", error);
  res.status(500).json({ error: 'No se pudo procesar la solicitud.' });
};

export const sendResetCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const message = await authService.sendResetCode(email);
    res.status(200).json({ message });
  } catch (error) {
    handleError(res, error);
  }
};

export const resendResetCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.resendResetCode(email);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyCode(email, code);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await authService.resetPassword(email, code, newPassword);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};