// backend/src/middleware/authMiddleware.ts

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express.js';

const prisma = new PrismaClient();


const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true },
      });

      if (req.user) {
        const newToken = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET as string, {
          expiresIn: '8h',
        });
        res.setHeader('X-New-Token', newToken);
        next();
      } else {
        res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
      }
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'No autorizado, token falló' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};

export { protect, isAdmin };