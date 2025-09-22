// backend/src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthStudents = await prisma.student.count({
      where: { createdAt: { gte: startOfCurrentMonth } },
    });
    const previousMonthStudents = await prisma.student.count({
      where: {
        createdAt: {
          gte: startOfPreviousMonth,
          lt: startOfCurrentMonth,
        },
      },
    });

    let studentGrowthPercentage = 0;
    if (previousMonthStudents > 0) {
      studentGrowthPercentage = ((currentMonthStudents - previousMonthStudents) / previousMonthStudents) * 100;
    } else if (currentMonthStudents > 0) {
      studentGrowthPercentage = 100;
    }

    const [studentCount, therapistCount, parentCount, leccionCount] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.therapistProfile.count({ where: { isActive: true } }),
      prisma.guardian.count({ where: { isActive: true } }),
      prisma.leccion.count({ where: { isActive: true } }),
    ]);

    res.json({
      students: studentCount,
      therapists: therapistCount,
      parents: parentCount,
      lecciones: leccionCount,
      studentGrowthPercentage: Math.round(studentGrowthPercentage),
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas.' });
  }
};

export const getTherapyAttendance = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with actual calculation
    const attendanceRate = 85; // Example: 85%
    res.json({ attendanceRate });
  } catch (error) {
    console.error("Error al obtener la asistencia a terapias:", error);
    res.status(500).json({ error: 'No se pudo obtener la asistencia.' });
  }
};

export const getStudentAgeDistribution = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with actual query
    const ageDistribution = [
      { age: 5, count: 10 },
      { age: 6, count: 15 },
      { age: 7, count: 20 },
      { age: 8, count: 25 },
      { age: 9, count: 18 },
      { age: 10, count: 12 },
    ];
    res.json(ageDistribution);
  } catch (error) {
    console.error("Error al obtener la distribución por edad:", error);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
};

export const getTherapistWorkload = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with actual query
    const workload = [
      { therapist: 'Dr. Ana López', load: 25 },
      { therapist: 'Dr. Carlos Ruiz', load: 30 },
      { therapist: 'Dra. María González', load: 20 },
    ];
    res.json(workload);
  } catch (error) {
    console.error("Error al obtener la carga de trabajo:", error);
    res.status(500).json({ error: 'No se pudo obtener la carga de trabajo.' });
  }
};

export const getMostFrequentTherapies = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with actual query
    const therapies = [
      { therapy: 'Terapia del Lenguaje', count: 45 },
      { therapy: 'Terapia Física', count: 38 },
      { therapy: 'Terapia Ocupacional', count: 32 },
    ];
    res.json(therapies);
  } catch (error) {
    console.error("Error al obtener las terapias más frecuentes:", error);
    res.status(500).json({ error: 'No se pudieron obtener las terapias.' });
  }
};

export const getSessionComparison = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with actual query
    const comparison = [
      { month: 'Enero', planned: 100, completed: 85, absent: 10, cancelled: 5 },
      { month: 'Febrero', planned: 95, completed: 88, absent: 5, cancelled: 2 },
      { month: 'Marzo', planned: 110, completed: 95, absent: 8, cancelled: 7 },
    ];
    res.json(comparison);
  } catch (error) {
    console.error("Error al obtener la comparación de sesiones:", error);
    res.status(500).json({ error: 'No se pudo obtener la comparación.' });
  }
};

export const getGenderDistribution = async (req: Request, res: Response) => {
  try {
    // Mock data - replace with actual query
    const maleCount = 120;
    const femaleCount = 95;
    const total = maleCount + femaleCount;
    res.json({ maleCount, femaleCount, total });
  } catch (error) {
    console.error("Error al obtener la distribución por género:", error);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
};