// backend/src/controllers/leccionController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

// Crear una nueva lección
export const createLeccion = async (req: Request, res: Response) => {
  try {
    const { title, objective, description, category, keySkill } = req.body;
    const createdById = req.user?.id;

    if (!createdById) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const newLeccion = await prisma.leccion.create({
      data: {
        title,
        objective,
        description,
        category,
        keySkill,
        createdById,
      },
    });
    res.status(201).json(newLeccion);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la lección.' });
  }
};

// Obtener todas las lecciones activas
export const getAllLecciones = async (req: Request, res: Response) => {
  try {
    const lecciones = await prisma.leccion.findMany({
      where: { isActive: true },
    });
    res.json(lecciones);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las lecciones.' });
  }
};