// backend/src/types/express.d.ts

import { Request } from 'express';
import { Role, PermissionType } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string | null;
    role: Role;
    permissions?: { permission: PermissionType; granted: boolean }[];
    therapistProfile?: { id: number; permissions: { permission: PermissionType; granted: boolean }[] };
    guardian?: { id: number };
  } | null;
}