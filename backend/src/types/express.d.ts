// backend/src/types/express.d.ts

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  } | null;
}