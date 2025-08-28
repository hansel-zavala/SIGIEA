// backend/src/controllers/guardianController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

// Obtener todos los guardianes activos
export const getAllGuardians = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereCondition = {
      isActive: true,
      ...(search && {
        fullName: {
          contains: search as string,
        },
      }),
    };

    const [guardians, totalGuardians] = await prisma.$transaction([
      prisma.guardian.findMany({
        where: whereCondition,
        include: { student: true },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limitNum,
      }),
      prisma.guardian.count({ where: whereCondition }),
    ]);

    res.json({
      data: guardians,
      total: totalGuardians,
      page: pageNum,
      totalPages: Math.ceil(totalGuardians / limitNum),
    });
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