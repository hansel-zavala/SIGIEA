// backend/src/controllers/leccionController.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express.js';
import { toCsv, sendCsvResponse, buildTimestampedFilename } from '../utils/csv.js';
import { sendExcelResponse } from '../utils/excel.js';
import { sendPdfTableResponse } from '../utils/pdf.js';

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
    const { status = 'all', format = 'csv' } = req.query as { status: string; format: string };
    
    const where: any = {};
    if (status === 'active') {where.isActive = true;} 
      else if (status === 'inactive') {where.isActive = false;
    }

    const lecciones = await prisma.leccion.findMany({
      where,
      select: {
        id: true,
        title: true,
        objective: true,
        category: true,
        keySkill: true,
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const filenameBase = `lecciones-${status}`;

    const processedData = lecciones.map(l =>{
      return {
      id: l.id,
      title: l.title,
      objective: l.objective,
      category: l.category,
      keySkill: l.keySkill,
      createdBy: l.createdBy?.name ?? 'No registrado',
      createdAt: l.createdAt.toISOString().split('T')[0],
      isActive: l.isActive,
      };
    });

    const headersForExcel = [
      { key: 'id', header: 'ID', width: 10 },
      { key: 'title', header: 'Título', width: 30 },
      { key: 'objective', header: 'Objetivo', width: 30 },
      { key: 'category', header: 'Categoría', width: 20 },
      { key: 'keySkill', header: 'Habilidad clave', width: 20 },
      { key: 'createdBy', header: 'Creador', width: 20 },
      { key: 'createdAt', header: 'Fecha de creación', width: 20 },
      { key: 'isActive', header: 'Estado', width: 15 },
    ];
    const dataForExcel = processedData.map((l) => ({ ...l, isActive: l.isActive ? 'Activo' : 'Inactivo' })); 

    const headersForPdfAndCsv = ['ID', 'Titulo', 'Objetivo', 'Categoria', 'Habilidad clave', 'Creador', 'Fecha de creación', 'Estado'];
    const dataForPdfAndCsv = processedData.map((l) => [
      l.id,
      l.title,
      l.objective,
      l.category,
      l.keySkill,
      l.createdBy,
      l.createdAt,
      l.isActive ? 'Activa' : 'Inactiva',
    ]);

    switch (format) {
      case 'excel':
        const excelFilename = buildTimestampedFilename(filenameBase, 'xlsx'); 
        await sendExcelResponse(res, excelFilename, headersForExcel, dataForExcel);
        break;
    
      case 'pdf':
        const pdfFilename = buildTimestampedFilename(filenameBase, 'pdf');
        sendPdfTableResponse(res, pdfFilename, {
          title: 'Lista de Estudiantes',
          headers: headersForPdfAndCsv,
          rows: dataForPdfAndCsv,
        });
        break;
    
      default:
        const csvFilename = buildTimestampedFilename(filenameBase, 'csv');
        const csvContent = toCsv(headersForPdfAndCsv, dataForPdfAndCsv);
        sendCsvResponse(res, csvFilename, csvContent);
        break;
        }
      } catch (error) {
        console.error('Error al exportar Lecciones:', error);
        res.status(500).json({ error: 'No se pudo generar el archivo de exportación.' });
      }
};
