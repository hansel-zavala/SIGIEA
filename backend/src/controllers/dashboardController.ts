// backend/src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // ✅ 1. Añadimos 'leccionCount' a las consultas en paralelo
    const [studentCount, therapistCount, parentCount, leccionCount] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.therapistProfile.count({ where: { isActive: true } }),
      prisma.guardian.count({ where: { isActive: true } }),
      prisma.leccion.count({ where: { isActive: true } }), // Contamos las lecciones activas
    ]);

    // ✅ 2. Añadimos el nuevo conteo a la respuesta JSON
    res.json({
      students: studentCount,
      therapists: therapistCount,
      parents: parentCount,
      lecciones: leccionCount, // El nuevo dato
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas.' });
  }
};