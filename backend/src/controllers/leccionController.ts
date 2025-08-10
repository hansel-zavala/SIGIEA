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

export const getLeccionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const leccion = await prisma.leccion.findFirst({
            where: { id: parseInt(id), isActive: true },
        });
        if (!leccion) return res.status(404).json({ error: 'Lección no encontrada.' });
        res.json(leccion);
    } catch (error) { res.status(500).json({ error: 'Error al obtener la lección.' }); }
};

export const updateLeccion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedLeccion = await prisma.leccion.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.json(updatedLeccion);
    } catch (error) { res.status(500).json({ error: 'No se pudo actualizar la lección.' }); }
};

export const deleteLeccion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.leccion.update({
            where: { id: parseInt(id) },
            data: { isActive: false }, // Borrado suave
        });
        res.json({ message: 'Lección desactivada correctamente.' });
    } catch (error) { res.status(500).json({ error: 'No se pudo desactivar la lección.' }); }
};