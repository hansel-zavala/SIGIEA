// backend/src/controllers/dashboardController.ts
import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import * as dashboardService from '../services/dashboardService.js';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user);
    res.json(stats);
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas.' });
  }
};

export const getTherapyAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const data = await dashboardService.getTherapyAttendance();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener la asistencia a terapias:", error);
    res.status(500).json({ error: 'No se pudo obtener la asistencia.' });
  }
};

export const getStudentAgeDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const data = await dashboardService.getStudentAgeDistribution();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener la distribución por edad:", error);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
};

export const getTherapistWorkload = async (req: AuthRequest, res: Response) => {
  try {
    const data = await dashboardService.getTherapistWorkload();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener la carga de trabajo:", error);
    res.status(500).json({ error: 'No se pudo obtener la carga de trabajo.' });
  }
};

export const getMostFrequentTherapies = async (req: AuthRequest, res: Response) => {
  try {
    const data = await dashboardService.getMostFrequentTherapies();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener las terapias más frecuentes:", error);
    res.status(500).json({ error: 'No se pudieron obtener las terapias.' });
  }
};

export const getSessionComparison = async (req: AuthRequest, res: Response) => {
  try {
    const therapistIdParam = req.query.therapistId as string | undefined;
    const therapistId = therapistIdParam ? parseInt(therapistIdParam) : undefined;
    
    const data = await dashboardService.getSessionComparison(therapistId);
    res.json(data);
  } catch (error) {
    console.error("Error al obtener la comparación de sesiones:", error);
    res.status(500).json({ error: 'No se pudo obtener la comparación.' });
  }
};

export const getGenderDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const data = await dashboardService.getGenderDistribution();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener la distribución por género:", error);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
};

export const getStudentBirthDepartmentDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const data = await dashboardService.getStudentBirthDepartmentDistribution();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener la distribución por departamento:", error);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
};

export const getTherapistAttendanceTrends = async (req: AuthRequest, res: Response) => {
  try {
    const data = await dashboardService.getTherapistAttendanceTrends();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener las tendencias de asistencia:", error);
    res.status(500).json({ error: 'No se pudieron obtener las tendencias.' });
  }
};

export const getTherapistAttendanceById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { range } = req.query;
    const therapistId = parseInt(id);
    
    if (isNaN(therapistId)) {
      return res.status(400).json({ error: 'ID de terapeuta inválido' });
    }

    const data = await dashboardService.getTherapistAttendanceById(therapistId, range as string);
    res.json(data);
  } catch (error) {
    console.error(`Error al obtener la asistencia del terapeuta ${id}:`, error);
    res.status(500).json({ error: 'No se pudo obtener la asistencia.' });
  }
};