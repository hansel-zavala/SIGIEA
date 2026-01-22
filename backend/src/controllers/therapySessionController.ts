// backend/src/controllers/therapySessionController.ts
import { Request, Response } from 'express';
import * as sessionService from '../services/therapySessionService.js';
import { 
  SessionNotFoundError, 
  TherapistNotFoundError, 
  ScheduleConflictError, 
  WorkHoursError 
} from '../errors/therapySessionErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof SessionNotFoundError || error instanceof TherapistNotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof ScheduleConflictError) {
    return res.status(409).json({ error: error.message });
  }
  if (error instanceof WorkHoursError) {
    return res.status(400).json({ error: error.message });
  }
  console.error('Error en therapySessionController:', error);
  res.status(500).json({ error: 'Error interno del servidor.' });
};

export const createRecurringSessions = async (req: Request, res: Response) => {
  try {
    const result = await sessionService.createRecurringSessions(req.body);
    res.status(201).json({ message: `${result.count} sesiones creadas exitosamente.` });
  } catch (error) {
    handleError(res, error);
  }
};

export const getSessionsByStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const sessions = await sessionService.getSessionsByStudent(parseInt(studentId as string));
    res.json(sessions);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const updatedSession = await sessionService.updateSession(parseInt(sessionId as string), req.body);
    res.json(updatedSession);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await sessionService.deleteSession(parseInt(sessionId as string));
    res.status(200).json({ message: 'Sesión eliminada correctamente.' });
  } catch (error) {
    handleError(res, error);
  }
};