// backend/src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // --- LÓGICA PARA CALCULAR EL CRECIMIENTO DE ESTUDIANTES ---
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Contar estudiantes del mes actual y del mes anterior
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

    // Calcular el porcentaje de crecimiento
    let studentGrowthPercentage = 0;
    if (previousMonthStudents > 0) {
      studentGrowthPercentage = ((currentMonthStudents - previousMonthStudents) / previousMonthStudents) * 100;
    } else if (currentMonthStudents > 0) {
      // Si el mes pasado no hubo registros y este mes sí, es un crecimiento "infinito"
      // Mostraremos un 100% como un indicador positivo.
      studentGrowthPercentage = 100;
    }

    // Consultas para las demás estadísticas
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
      studentGrowthPercentage: Math.round(studentGrowthPercentage), // Enviamos el nuevo dato redondeado
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas.' });
  }
};