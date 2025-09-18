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

    const ages: { [key: number]: number } = {};

    const now = new Date();
    students.forEach(student => {
      const birthDate = new Date(student.dateOfBirth);
      let age = now.getFullYear() - birthDate.getFullYear();
      const m = now.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (ages[age]) {
        ages[age]++;
      } else {
        ages[age] = 1;
      }
    });

    const result = Object.entries(ages).map(([age, count]) => ({ age: parseInt(age), count }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener la distribución de edad de los estudiantes:', error);
    res.status(500).json({ error: 'No se pudo obtener la distribución de edad.' });
  }
};

export const getTherapistWorkload = async (req: Request, res: Response) => {
  try {
    const therapists = await prisma.therapistProfile.findMany({
      where: { isActive: true },
      include: { _count: { select: { assignedStudents: true } } },
    });

    const result = therapists.map(therapist => ({
      therapist: `${therapist.nombres} ${therapist.apellidos}`,
      load: therapist._count.assignedStudents,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener la carga de trabajo de los terapeutas:', error);
    res.status(500).json({ error: 'No se pudo obtener la carga de trabajo.' });
  }
};

export const getMostFrequentTherapies = async (req: Request, res: Response) => {
  try {
    const therapySessions = await prisma.therapySession.groupBy({
      by: ['leccionId'],
      _count: {
        leccionId: true,
      },
      orderBy: {
        _count: {
          leccionId: 'desc',
        },
      },
    });

    const leccionIds = therapySessions.map(session => session.leccionId);
    const lecciones = await prisma.leccion.findMany({
      where: { id: { in: leccionIds } },
      select: { id: true, category: true },
    });

    const leccionCategoryMap = lecciones.reduce((acc, leccion) => {
      acc[leccion.id] = leccion.category || 'Sin categoría';
      return acc;
    }, {} as Record<number, string>);

    const categoryCounts = therapySessions.reduce((acc, session) => {
      const category = leccionCategoryMap[session.leccionId];
      acc[category] = (acc[category] || 0) + session._count.leccionId;
      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(categoryCounts).map(([therapy, count]) => ({ therapy, count }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener las terapias más frecuentes:', error);
    res.status(500).json({ error: 'No se pudieron obtener las terapias más frecuentes.' });
  }
};

export const getSessionComparison = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const result = [];

    for (let i = 0; i < 12; i++) {
      const month = i + 1;
      const startDate = new Date(year, i, 1);
      const endDate = new Date(year, i + 1, 0);

      const planned = await prisma.therapySession.count({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const completed = await prisma.therapySession.count({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
          status: 'Completada',
        },
      });

      result.push({
        month: startDate.toLocaleString('es-ES', { month: 'long' }),
        planned,
        completed,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener la comparación de sesiones:', error);
    res.status(500).json({ error: 'No se pudo obtener la comparación de sesiones.' });
  }
};

export const getTherapistAttendance = async (req: Request, res: Response) => {
  try {
    const { therapistId } = req.params;
    const { range } = req.query; // 'week', 'month', 'year'

    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); // Default to week
    }

    const completedSessions = await prisma.therapySession.count({
      where: {
        therapistId: parseInt(therapistId),
        startTime: { gte: startDate },
        status: 'Completada',
      },
    });

    const totalSessions = await prisma.therapySession.count({
      where: {
        therapistId: parseInt(therapistId),
        startTime: { gte: startDate },
      },
    });

    const attendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    res.json({ attendanceRate: Math.round(attendanceRate) });
  } catch (error) {
    console.error('Error al obtener la tasa de asistencia del terapeuta:', error);
    res.status(500).json({ error: 'No se pudo obtener la tasa de asistencia.' });
  }
};