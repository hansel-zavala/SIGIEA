// backend/src/controllers/leccionController.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express.js';

const prisma = new PrismaClient();


export const createLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, objective, description, category, keySkill } = req.body;
    const createdById = req.user?.id;

    if (!createdById) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const newLeccion = await prisma.leccion.create({
      data: { title, objective, description, category, keySkill, createdById },
    });
    res.status(201).json(newLeccion);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la lección.' });
  }
};

export const getAllLecciones = async (req: AuthRequest, res: Response) => {
  try {
    const lecciones = await prisma.leccion.findMany({ where: { isActive: true } });
    res.json(lecciones);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las lecciones.' });
  }
};

export const getLeccionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const leccion = await prisma.leccion.findFirst({ where: { id: parseInt(id), isActive: true } });
    if (!leccion) return res.status(404).json({ error: 'Lección no encontrada.' });
    res.json(leccion);
  } catch (error) { res.status(500).json({ error: 'Error al obtener la lección.' }); }
};

export const updateLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedLeccion = await prisma.leccion.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(updatedLeccion);
  } catch (error) { res.status(500).json({ error: 'No se pudo actualizar la lección.' }); }
};

export const deleteLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.leccion.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    res.json({ message: 'Lección desactivada correctamente.' });
  } catch (error) { res.status(500).json({ error: 'No se pudo desactivar la lección.' }); }
};