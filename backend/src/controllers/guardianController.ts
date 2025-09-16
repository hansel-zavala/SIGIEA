// backend/src/controllers/guardianController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import bcrypt from 'bcrypt';

export const getAllGuardians = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '10', status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let whereCondition: any = {};

    if (status === 'active') {
      whereCondition.isActive = true;
    } else if (status === 'inactive') {
      whereCondition.isActive = false;
    }

    if (search) {
      const raw = String(search).trim();
      const terms = raw.split(/\s+/).filter(Boolean);
      // Cada término debe aparecer en algún campo del guardián o de sus estudiantes
      whereCondition.AND = terms.map((term: string) => ({
        OR: [
          { nombres: { contains: term } },
          { apellidos: { contains: term } },
          { numeroIdentidad: { contains: term } },
          {
            students: {
              some: {
                OR: [
                  { nombres: { contains: term } },
                  { apellidos: { contains: term } },
                ],
              },
            },
          },
        ],
      }));
    }

    const [guardians, totalGuardians] = await prisma.$transaction([
      prisma.guardian.findMany({
        where: whereCondition,
        include: { students: true },
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: skip,
        take: limitNum,
      }),
      prisma.guardian.count({ where: whereCondition }),
    ]);

    const guardiansWithFullName = guardians.map(g => ({
        ...g,
        fullName: `${g.nombres} ${g.apellidos}`,
        students: g.students.map(s => ({
            ...s,
            fullName: `${s.nombres} ${s.apellidos}`
        }))
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
        students: true,
        user: true,
      },
    });

    if (!guardian) {
      return res.status(404).json({ error: "Guardián no encontrado." });
    }

    const guardianWithDetails = {
      ...guardian,
      fullName: `${guardian.nombres} ${guardian.apellidos}`,
      students: guardian.students.map(s => ({
        ...s,
        fullName: `${s.nombres} ${s.apellidos}`,
      })),
    };

    res.json(guardianWithDetails);
  } catch (error) {
    res.status(500).json({ error: "No se pudo obtener el guardián." });
  }
};

export const updateGuardian = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, password, ...guardianData } = req.body as any;

    // Si vienen credenciales, crear/actualizar el user asociado con rol 'padre'
    if (email || password) {
      const guardian = await prisma.guardian.findUnique({ where: { id: parseInt(id) } });
      if (!guardian) return res.status(404).json({ error: 'Guardián no encontrado.' });

      // Validar email único si se cambia/crea
      if (email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== guardian.userId) {
          return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
        }
      }

      if (guardian.userId) {
        // Actualizar usuario
        await prisma.user.update({
          where: { id: guardian.userId },
          data: {
            ...(email ? { email } : {}),
            ...(password ? { password: await bcrypt.hash(String(password), 10) } : {}),
            ...(guardianData.nombres || guardianData.apellidos ? { name: `${guardianData.nombres ?? guardian.nombres} ${guardianData.apellidos ?? guardian.apellidos}` } : {}),
          }
        });
      } else if (email && password) {
        // Crear usuario y asociar
        const newUser = await prisma.user.create({
          data: {
            email,
            password: await bcrypt.hash(String(password), 10),
            role: 'padre',
            name: `${guardianData.nombres ?? guardian?.nombres ?? ''} ${guardianData.apellidos ?? guardian?.apellidos ?? ''}`.trim(),
          }
        });
        guardianData.userId = newUser.id;
      }
    }

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

export const reactivateGuardian = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const guardian = await prisma.guardian.findUnique({
      where: { id: parseInt(id) },
      include: { students: true },
    });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardián no encontrado.' });
    }

    const hasActiveStudent = guardian.students.some(s => s.isActive);
    if (!hasActiveStudent) {
      return res.status(403).json({
        error: 'No se puede reactivar al guardián porque ninguno de sus estudiantes asociados está activo.'
      });
    }

    const reactivatedGuardian = await prisma.guardian.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
    });
    
    res.json({ message: 'Guardián reactivado correctamente.', guardian: reactivatedGuardian });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo reactivar al guardián.' });
  }
};
