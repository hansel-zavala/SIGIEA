// backend/src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Hacemos todas las consultas a la base de datos en paralelo
    const [studentCount, therapistCount, guardianCount] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.therapistProfile.count({ where: { isActive: true } }),
      // ✅ CORRECCIÓN: Contamos los perfiles de Guardianes, que es lo correcto
      prisma.guardian.count({ where: { isActive: true } }),
    ]);

    res.json({
      students: studentCount,
      therapists: therapistCount,
      parents: guardianCount, // Devolvemos el conteo de guardianes
    });
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas.' });
  }
};