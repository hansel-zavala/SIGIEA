// backend/src/controllers/guardianController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';

export const getAllGuardians = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const searchTerms = (search as string)?.split(' ').filter(term => term);

    const whereCondition = {
      isActive: true,
      ...(search && {
        OR: [
          { nombres: { contains: search as string } },
          { apellidos: { contains: search as string } },
          { numeroIdentidad: { contains: search as string } },
          
          {
            student: {
              AND: searchTerms.map(term => ({
                OR: [
                  { nombres: { contains: term } },
                  { apellidos: { contains: term } },
                ],
              })),
            },
          },
        ],
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

    const guardiansWithFullName = guardians.map(g => ({
        ...g,
        fullName: `${g.nombres} ${g.apellidos}`,
        student: {
            ...g.student,
            fullName: `${g.student.nombres} ${g.student.apellidos}`
        }
    }));

    res.json({
      data: guardiansWithFullName,
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
      include: {
        student: true,
      },
    });

    if (!guardian) {
      return res.status(404).json({ error: "Guardián no encontrado." });
    }

    const guardianWithDetails = {
      ...guardian,
      fullName: `${guardian.nombres} ${guardian.apellidos}`,
      student: {
        ...guardian.student,
        fullName: `${guardian.student.nombres} ${guardian.student.apellidos}`,
      },
    };

    res.json(guardianWithDetails);
  } catch (error) {
    res.status(500).json({ error: "No se pudo obtener el guardián." });
  }
};

export const updateGuardian = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, ...guardianData } = req.body;
    const updatedGuardian = await prisma.guardian.update({
      where: { id: parseInt(id) },
      data: guardianData,
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