// backend/src/controllers/alergiaController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

// Obtener todas las alergias
export const getAllAlergias = async (req: Request, res: Response) => {
  try {
    const alergias = await prisma.alergia.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json(alergias);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las alergias.' });
  }
};

// Crear una nueva alergia
export const createAlergia = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    const newAlergia = await prisma.alergia.create({
      data: { nombre },
    });
    res.status(201).json(newAlergia);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la alergia.' });
  }
};

// Actualizar una alergia
export const updateAlergia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const updatedAlergia = await prisma.alergia.update({
      where: { id: parseInt(id) },
      data: { nombre },
    });
    res.json(updatedAlergia);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar la alergia.' });
  }
};

// Eliminar una alergia
export const deleteAlergia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.alergia.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Alergia eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la alergia.' });
  }
};