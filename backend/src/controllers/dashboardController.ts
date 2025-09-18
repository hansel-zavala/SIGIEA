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
    const now = new Date();
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    const completedSessions = await prisma.therapySession.count({
      where: {
        startTime: { gte: sevenDaysAgo },
        status: 'Completada',
      },
    });

    const totalSessions = await prisma.therapySession.count({
      where: {
        startTime: { gte: sevenDaysAgo },
      },
    });

    const attendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    res.json({ attendanceRate: Math.round(attendanceRate) });
  } catch (error) {
    console.error('Error al obtener la tasa de asistencia a terapias:', error);
    res.status(500).json({ error: 'No se pudo obtener la tasa de asistencia.' });
  }
};

export const getStudentAgeDistribution = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      select: { dateOfBirth: true },
    });

    const ageRanges = {
      '3-5': 0,
      '6-8': 0,
      '9-12': 0,
      '13-15': 0,
      '16+': 0,
    };

    const now = new Date();
    students.forEach(student => {
      const age = now.getFullYear() - student.dateOfBirth.getFullYear();
      if (age >= 3 && age <= 5) ageRanges['3-5']++;
      else if (age >= 6 && age <= 8) ageRanges['6-8']++;
      else if (age >= 9 && age <= 12) ageRanges['9-12']++;
      else if (age >= 13 && age <= 15) ageRanges['13-15']++;
      else if (age >= 16) ageRanges['16+']++;
    });

    const result = Object.entries(ageRanges).map(([range, count]) => ({ range, count }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener la distribución de edad de los estudiantes:', error);
    res.status(500).json({ error: 'No se pudo obtener la distribución de edad.' });
  }
};