// backend/src/controllers/sessionLogController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const createSessionLog = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { date, attendance, notes, behavior, progress, therapyPlanId } = req.body;
    const therapistId = req.user?.id;

    if (!therapistId) {
      return res.status(401).json({ error: 'No se pudo identificar al terapeuta.' });
    }
    
    if (!['Presente', 'Ausente', 'Justificado'].includes(attendance)) {
        return res.status(400).json({ error: 'Valor de asistencia no válido.'});
    }

    const newLog = await prisma.sessionLog.create({
      data: {
        date: new Date(date),
        attendance,
        notes,
        behavior,
        progress,
        studentId: parseInt(studentId),
        therapistId,
        therapyPlanId: parseInt(therapyPlanId),
      },
    });

    res.status(201).json(newLog);
  } catch (error) {
    console.error("Error al crear el registro de sesión:", error);
    res.status(500).json({ error: 'No se pudo crear el registro de sesión.' });
  }
};