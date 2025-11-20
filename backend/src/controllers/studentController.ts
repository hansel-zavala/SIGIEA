// backend/src/controllers/studentController.ts
import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import * as studentService from '../services/studentService.js';
import { StudentNotFoundError, GuardianValidationError, ScheduleConflictError } from '../errors/studentErrors.js';

const handleError = (res: Response, error: unknown) => {
  if (error instanceof StudentNotFoundError) return res.status(404).json({ error: error.message });
  if (error instanceof GuardianValidationError) return res.status(400).json({ error: error.message });
  if (error instanceof ScheduleConflictError) return res.status(400).json({ error: error.message });
  console.error('Error en studentController:', error);
  res.status(500).json({ error: 'Error interno del servidor.' });
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const newStudent = await studentService.createStudent(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllStudents = async (req: AuthRequest, res: Response) => {
  try {
    const result = await studentService.getAllStudents(req.query, req.user);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.getStudentById(id);
    res.json(student);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await studentService.updateStudent(id, req.body);
    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await studentService.deleteStudent(id);
    res.json({ message: 'Estudiante desactivado correctamente.', student: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const reactivateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await studentService.reactivateStudent(id);
    res.json({ message: 'Estudiante reactivado correctamente.', student: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const addGuardianToStudent = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await studentService.addGuardianToStudent(id, req.body);
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const exportStudents = async (req: AuthRequest, res: Response) => {
  try {
    await studentService.exportStudents(req.query, req.user, res);
  } catch (error) {
    handleError(res, error);
  }
};