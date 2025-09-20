// backend/src/controllers/leccionController.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express.js';
import { toCsv, sendCsvResponse, buildTimestampedFilename } from '../utils/csv.js';

const prisma = new PrismaClient();


export const createLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const { title, objective, description, category, keySkill } = req.body;
    const createdById = req.user?.id;

    if (!createdById) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const newLeccion = await prisma.leccion.create({
      data: { title, objective, description, category, keySkill, createdById },
    });
    res.status(201).json(newLeccion);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la lección.' });
  }
};

export const getAllLecciones = async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : undefined;

    let whereClause: { isActive?: boolean } | undefined;

    if (!status || status === 'active') {
      whereClause = { isActive: true };
    } else if (status === 'inactive') {
      whereClause = { isActive: false };
    }

    const lecciones = await prisma.leccion.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    res.json(lecciones);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener las lecciones.' });
  }
};

export const getLeccionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const leccion = await prisma.leccion.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!leccion) return res.status(404).json({ error: 'Lección no encontrada.' });
    res.json(leccion);
  } catch (error) { res.status(500).json({ error: 'Error al obtener la lección.' }); }
};

export const updateLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedLeccion = await prisma.leccion.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(updatedLeccion);
  } catch (error) { res.status(500).json({ error: 'No se pudo actualizar la lección.' }); }
};

export const deleteLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.leccion.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    res.json({ message: 'Lección desactivada correctamente.' });
  } catch (error) { res.status(500).json({ error: 'No se pudo desactivar la lección.' }); }
};

export const activateLeccion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.leccion.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
    });
    res.json({ message: 'Lección activada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo activar la lección.' });
  }
};

export const exportLecciones = async (req: AuthRequest, res: Response) => {
  try {
    const { status = 'active', format = 'csv' } = req.query as { status?: string; format?: string };

    if (format !== 'csv') {
      return res.status(400).json({ error: 'Formato no soportado. Actualmente solo se permite CSV.' });
    }

    const whereClause: { isActive?: boolean } = {};
    if (status === 'active') whereClause.isActive = true;
    if (status === 'inactive') whereClause.isActive = false;

    const lecciones = await prisma.leccion.findMany({
      where: status === 'all' ? undefined : whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    const rows = lecciones.map((leccion) => [
      leccion.id,
      leccion.title,
      leccion.objective ?? '',
      leccion.category ?? 'Sin categoría',
      leccion.keySkill ?? '',
      leccion.createdBy?.name ?? leccion.createdBy?.email ?? 'No registrado',
      leccion.isActive ? 'Activa' : 'Inactiva',
      leccion.createdAt.toISOString(),
    ]);

    const headers = [
      'ID',
      'Título',
      'Objetivo',
      'Categoría',
      'Habilidad clave',
      'Creador',
      'Estado',
      'Fecha de creación',
    ];

    const csv = toCsv(headers, rows);
    const filename = buildTimestampedFilename(`lecciones-${status}`);
    sendCsvResponse(res, filename, csv);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo exportar la lista de lecciones.' });
  }
};
