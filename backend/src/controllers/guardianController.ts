// backend/src/controllers/guardianController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

// Obtener todos los guardianes activos
export const getAllGuardians = async (req: Request, res: Response) => {
  try {
    const guardians = await prisma.guardian.findMany({
      where: { isActive: true },
      include: { student: true },
    });
    res.json(guardians);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los guardianes.' });
  }
};

export const getGuardianById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const guardian = await prisma.guardian.findFirst({
      where: { id: parseInt(id), isActive: true },
    });
    if (!guardian) {
      return res.status(404).json({ error: 'Guardián no encontrado.' });
    }
    res.json(guardian);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el guardián.' });
  }
};


export const updateGuardian = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedGuardian = await prisma.guardian.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(updatedGuardian);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el guardián.' });
  }
};

// ✅ NUEVA FUNCIÓN: DESACTIVAR UN GUARDIÁN
export const deleteGuardian = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.guardian.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    res.json({ message: 'Guardián desactivado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo desactivar el guardián.' });
  }
};