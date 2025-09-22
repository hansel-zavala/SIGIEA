// backend/src/controllers/controlesController.ts

import { Response } from 'express';
import { PrismaClient, PermissionType } from '@prisma/client';
import { AuthRequest } from '../types/express.js';

const prisma = new PrismaClient();

export const getTherapistsWithPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'THERAPIST' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        therapistProfile: {
          include: {
            permissions: {
              select: {
                permission: true,
                granted: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const therapistsWithPermissions = users.map(user => {
      const profile = user.therapistProfile;
      if (profile) {
        return {
          id: profile.id,
          fullName: `${profile.nombres} ${profile.apellidos}`,
          email: profile.email,
          permissions: profile.permissions.reduce((acc: Record<PermissionType, boolean>, perm: { permission: PermissionType, granted: boolean }) => {
            acc[perm.permission] = perm.granted;
            return acc;
          }, {} as Record<PermissionType, boolean>)
        };
      } else {
        return {
          id: user.id,
          fullName: user.name || 'Sin perfil',
          email: user.email,
          permissions: {} as Record<PermissionType, boolean>
        };
      }
    });

    res.json({ data: therapistsWithPermissions });
  } catch (error) {
    console.error('Error al obtener terapeutas con permisos:', error);
    res.status(500).json({ error: 'No se pudieron obtener los terapeutas.' });
  }
};

export const updateTherapistPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { therapistId } = req.params;
    const { permissions } = req.body; // { VIEW_STUDENTS: true, EDIT_STUDENTS: false, ... }

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ error: 'Permisos inválidos.' });
    }

    // Validate permission types
    const validPermissions = Object.values(PermissionType);
    for (const perm of Object.keys(permissions)) {
      if (!validPermissions.includes(perm as PermissionType)) {
        return res.status(400).json({ error: `Permiso inválido: ${perm}` });
      }
    }

    // Update permissions in transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing permissions
      await tx.therapistPermission.deleteMany({
        where: { therapistId: parseInt(therapistId) }
      });

      // Create new permissions
      const permissionEntries = Object.entries(permissions).map(([perm, granted]) => ({
        therapistId: parseInt(therapistId),
        permission: perm as PermissionType,
        granted: Boolean(granted)
      }));

      await tx.therapistPermission.createMany({
        data: permissionEntries
      });
    });

    res.json({ message: 'Permisos actualizados correctamente.' });
  } catch (error) {
    console.error('Error al actualizar permisos:', error);
    res.status(500).json({ error: 'No se pudieron actualizar los permisos.' });
  }
};

export const getDefaultPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const defaultPermissions = Object.values(PermissionType).reduce((acc, perm) => {
      acc[perm] = true; // All permissions granted by default
      return acc;
    }, {} as Record<PermissionType, boolean>);

    res.json(defaultPermissions);
  } catch (error) {
    console.error('Error al obtener permisos por defecto:', error);
    res.status(500).json({ error: 'No se pudieron obtener los permisos por defecto.' });
  }
};