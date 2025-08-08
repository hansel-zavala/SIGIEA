// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ LA CORRECCIÓN ESTÁ AQUÍ
declare global {
  namespace Express {
    interface Request {
      // Definimos la forma exacta del objeto que vamos a adjuntar
      user?: {
        id: number;
        email: string;
        name: string | null;
        role: string;
      } | null; // Puede ser 'null' si el usuario no se encuentra en la BD
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
      
      // La 'forma' del objeto que devuelve esta consulta ahora coincide con nuestra definición
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true }
      });

      next();
    } catch (error) {
      return res.status(401).json({ error: 'No autorizado, el token falló.' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado, no hay token.' });
  }
};