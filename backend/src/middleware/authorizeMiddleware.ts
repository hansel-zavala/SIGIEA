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

const canDeleteStudents = authorize({ permission: PermissionType.DELETE_STUDENTS });

const canExportStudents = authorize({ permission: PermissionType.EXPORT_STUDENTS });

const canManageSessions = authorize({ permission: PermissionType.MANAGE_SESSIONS });

const canViewReports = authorize({ permission: PermissionType.VIEW_REPORTS });

const canCreateReports = authorize({ permission: PermissionType.CREATE_REPORTS });

const canEditReports = authorize({ permission: PermissionType.EDIT_REPORTS });

const canExportReports = authorize({ permission: PermissionType.EXPORT_REPORTS });

const canViewDocuments = authorize({ permission: PermissionType.VIEW_DOCUMENTS });

const canManageDocuments = authorize({ permission: PermissionType.MANAGE_DOCUMENTS });

const canViewGuardians = authorize({ permission: PermissionType.VIEW_GUARDIANS });

const canEditGuardians = authorize({ permission: PermissionType.EDIT_GUARDIANS });

const canCreateGuardians = authorize({ permission: PermissionType.CREATE_GUARDIANS });

const canDeleteGuardians = authorize({ permission: PermissionType.DELETE_GUARDIANS });

const canExportGuardians = authorize({ permission: PermissionType.EXPORT_GUARDIANS });

const canViewEvents = authorize({ permission: PermissionType.VIEW_EVENTS });

const canEditEvents = authorize({ permission: PermissionType.EDIT_EVENTS });

const canCreateEvents = authorize({ permission: PermissionType.CREATE_EVENTS });

const canDeleteEvents = authorize({ permission: PermissionType.DELETE_EVENTS });

const canExportEvents = authorize({ permission: PermissionType.EXPORT_EVENTS });

const canViewTherapists = authorize({ permission: PermissionType.VIEW_THERAPISTS });

const canEditTherapists = authorize({ permission: PermissionType.EDIT_THERAPISTS });

const canCreateTherapists = authorize({ permission: PermissionType.CREATE_THERAPISTS });

const canDeleteTherapists = authorize({ permission: PermissionType.DELETE_THERAPISTS });

const canExportTherapists = authorize({ permission: PermissionType.EXPORT_THERAPISTS });

const canManageCategories = authorize({ permission: PermissionType.MANAGE_CATEGORIES });

const canViewLecciones = authorize({ permission: PermissionType.VIEW_LECCIONES });

const canEditLecciones = authorize({ permission: PermissionType.EDIT_LECCIONES });

const canCreateLecciones = authorize({ permission: PermissionType.CREATE_LECCIONES });

const canDeleteLecciones = authorize({ permission: PermissionType.DELETE_LECCIONES });

const canExportLecciones = authorize({ permission: PermissionType.EXPORT_LECCIONES });

const canViewTemplates = authorize({ permission: PermissionType.VIEW_TEMPLATES });

const canManageTemplates = authorize({ permission: PermissionType.MANAGE_TEMPLATES });

const canManageUsers = authorize({ permission: PermissionType.MANAGE_USERS });

const canViewDashboard = authorize({ permission: PermissionType.VIEW_DASHBOARD });

const canViewMatricula = authorize({ permission: PermissionType.VIEW_MATRICULA });

const canViewControls = authorize({ permission: PermissionType.VIEW_CONTROLS });

const canManagePermissions = authorize({ permission: PermissionType.MANAGE_PERMISSIONS });

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
  canDeleteStudents,
  canExportStudents,
  canManageSessions,
  canViewReports,
  canCreateReports,
  canEditReports,
  canExportReports,
  canViewDocuments,
  canManageDocuments,
  canViewGuardians,
  canEditGuardians,
  canCreateGuardians,
  canDeleteGuardians,
  canExportGuardians,
  canViewEvents,
  canEditEvents,
  canCreateEvents,
  canDeleteEvents,
  canExportEvents,
  canViewTherapists,
  canEditTherapists,
  canCreateTherapists,
  canDeleteTherapists,
  canExportTherapists,
  canManageCategories,
  canViewLecciones,
  canEditLecciones,
  canCreateLecciones,
  canDeleteLecciones,
  canExportLecciones,
  canViewTemplates,
  canManageTemplates,
  canManageUsers,
  canViewDashboard,
  canViewMatricula,
  canViewControls,
  canManagePermissions,
  isStudentTherapist,
  isParentOfStudent
};