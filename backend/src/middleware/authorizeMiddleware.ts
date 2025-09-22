// backend/src/middleware/authorizeMiddleware.ts

import { Response, NextFunction } from 'express';
import { PrismaClient, Role, PermissionType } from '@prisma/client';
import { AuthRequest } from '../types/express.js';

const prisma = new PrismaClient();

interface PermissionCheck {
  role?: Role[];
  permission?: PermissionType;
  resourceOwnerCheck?: (req: AuthRequest) => Promise<boolean>;
}

const authorize = (checks: PermissionCheck | PermissionCheck[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const checkArray = Array.isArray(checks) ? checks : [checks];

      let authorized = false;

      for (const check of checkArray) {
        let checkPasses = true;

        // Check role
        if (check.role && req.user && !check.role.some(r => r.toUpperCase() === req.user!.role.toUpperCase())) {
          checkPasses = false;
        }

        // Check permission for therapists
        if (req.user.role === Role.THERAPIST && check.permission) {
          const therapistProfile = await prisma.therapistProfile.findUnique({
            where: { userId: req.user.id },
            include: { permissions: true }
          });

          if (!therapistProfile) {
            checkPasses = false;
          } else {
            const hasPermission = therapistProfile.permissions.some(
              p => p.permission === check.permission && p.granted
            );

            if (!hasPermission) {
              checkPasses = false;
            }
          }
        }

        // Check resource ownership
        if (check.resourceOwnerCheck) {
          const isOwner = await check.resourceOwnerCheck(req);
          if (!isOwner) {
            checkPasses = false;
          }
        }

        if (checkPasses) {
          authorized = true;
          break;
        }
      }

      if (!authorized) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      next();
    } catch (error) {
      console.error('Error en autorización:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
};

// Helper functions for common checks
const isAdmin = authorize({ role: [Role.ADMIN] });

const isTherapist = authorize({ role: [Role.THERAPIST] });

const isParent = authorize({ role: [Role.PARENT] });

const canViewStudents = authorize({ permission: PermissionType.VIEW_STUDENTS });

const canEditStudents = authorize({ permission: PermissionType.EDIT_STUDENTS });

const canManageSessions = authorize({ permission: PermissionType.MANAGE_SESSIONS });

const canViewReports = authorize({ permission: PermissionType.VIEW_REPORTS });

const canCreateReports = authorize({ permission: PermissionType.CREATE_REPORTS });

const canManageDocuments = authorize({ permission: PermissionType.MANAGE_DOCUMENTS });

// Resource ownership checks
const isStudentTherapist = async (req: AuthRequest): Promise<boolean> => {
  const studentId = parseInt(req.params.id);
  const therapistProfile = await prisma.therapistProfile.findUnique({
    where: { userId: req.user!.id }
  });
  if (!therapistProfile) return false;

  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });
  return student?.therapistId === therapistProfile.id;
};

const isParentOfStudent = async (req: AuthRequest): Promise<boolean> => {
  const studentId = parseInt(req.params.id);
  const guardian = await prisma.guardian.findUnique({
    where: { userId: req.user!.id }
  });
  if (!guardian) return false;

  const studentGuardian = await prisma.student.findFirst({
    where: {
      id: studentId,
      guardians: { some: { id: guardian.id } }
    }
  });
  return !!studentGuardian;
};

export {
  authorize,
  isAdmin,
  isTherapist,
  isParent,
  canViewStudents,
  canEditStudents,
  canManageSessions,
  canViewReports,
  canCreateReports,
  canManageDocuments,
  isStudentTherapist,
  isParentOfStudent
};