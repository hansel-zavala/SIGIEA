// backend/src/controllers/therapyPlanController.ts

// ✅ CAMBIO: Solo importamos 'Request' y 'Response' de express
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ CAMBIO: Usamos el tipo 'Request' estándar.
// TypeScript ya sabe que puede tener una propiedad 'user' gracias a nuestra configuración global.
export const createTherapyPlan = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { dayOfWeek, time, therapyTitle } = req.body;

    // Gracias al middleware, TypeScript sabe que req.user puede existir aquí
    const therapistId = req.user?.id;

    if (!therapistId) {
      return res.status(401).json({ error: 'No se pudo identificar al terapeuta desde el token.' });
    }

    const newPlan = await prisma.therapyPlan.create({
      data: {
        dayOfWeek,
        time,
        therapyTitle,
        studentId: parseInt(studentId),
        therapistId: therapistId,
      },
    });

    res.status(201).json(newPlan);
  } catch (error) {
    console.error("Error al crear el plan terapéutico:", error);
    res.status(500).json({ error: 'No se pudo crear el plan terapéutico.' });
  }
};