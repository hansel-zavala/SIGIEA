// backend/src/controllers/eventController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import { Prisma, EventAudience } from '@prisma/client';
import { AuthRequest } from '../types/express.js';
import { toCsv, sendCsvResponse, buildTimestampedFilename } from '../utils/csv.js';
import { sendExcelResponse } from '../utils/excel.js';
import { sendPdfTableResponse } from '../utils/pdf.js';

const INVALID_DATE_ERROR = 'INVALID_DATE'; 

const getTodayStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const parseBoolean = (value: unknown, defaultValue = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
  }
  if (typeof value === 'number') return value === 1;
  return defaultValue;
};

const normalizeDateInput = (
  value: string | Date,
  isAllDay: boolean,
  type: 'start' | 'end'
): Date => {
  if (value instanceof Date) return value;
  const trimmed = value?.trim?.() ?? '';
  if (!trimmed) {
    throw new Error(INVALID_DATE_ERROR);
  }

  if (isAllDay && !trimmed.includes('T')) {
    const [yearStr, monthStr, dayStr] = trimmed.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr) + (type === 'end' ? 1 : 0);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day)
    ) {
      throw new Error(INVALID_DATE_ERROR);
    }

    const hours = 0;
    const minutes = 0;
    const seconds = 0;
    const milliseconds = 0;

    const dateValue = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
    if (Number.isNaN(dateValue.getTime())) {
      throw new Error(INVALID_DATE_ERROR);
    }
    return dateValue;
  }

  const dateValue = new Date(trimmed);
  if (Number.isNaN(dateValue.getTime())) {
    throw new Error(INVALID_DATE_ERROR);
  }
  return dateValue;
};

export const getAllEvents = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.event.updateMany({
      where: {
        isActive: true,
        endDate: { lt: new Date() },
      },
      data: { isActive: false },
    });

    const { status, search } = req.query;
    const where: Prisma.EventWhereInput = {};

    if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'all') {
      // No explicit filter, include all statuses
    } else {
      where.isActive = true;
    }

    // Role-based filtering
    if (req.user?.role === 'PARENT') {
      where.audience = { in: ['General', 'Padres'] };
    }

    const searchTerm = typeof search === 'string' ? search.trim() : '';
    if (searchTerm) {
      const normalized = searchTerm.toLowerCase();
      const audienceMatches = (['General', 'Padres', 'Terapeutas', 'Personal'] as EventAudience[])
        .filter(value => value.toLowerCase().includes(normalized));

      const orFilters: Prisma.EventWhereInput[] = [
        { title: { contains: searchTerm } },
        {
          category: {
            name: { contains: searchTerm },
          },
        },
      ];

      if (audienceMatches.length > 0) {
        orFilters.push({ audience: { in: audienceMatches } });
      }

      where.OR = orFilters;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los eventos.' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, startDate, endDate, ...rest } = req.body;

    const isAllDay = parseBoolean(req.body.isAllDay);

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'El título y las fechas de inicio y fin son obligatorios.' });
    }

    const normalizedStart = normalizeDateInput(startDate, isAllDay, 'start');
    const normalizedEnd = normalizeDateInput(endDate, isAllDay, 'end');

    if (normalizedEnd < normalizedStart) {
      return res.status(400).json({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
    }

    const todayStart = getTodayStart();
    if (normalizedStart < todayStart || normalizedEnd < todayStart) {
      return res.status(400).json({ error: 'Las fechas no pueden ser anteriores al día de hoy.' });
    }

    const newEvent = await prisma.event.create({
      data: {
        ...rest,
        title,
        isAllDay,
        startDate: normalizedStart,
        endDate: normalizedEnd,
      },
    });
    res.status(201).json(newEvent);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === INVALID_DATE_ERROR) {
      return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas.' });
    }
    console.error("Error al crear el evento:", error);
    res.status(500).json({ error: 'No se pudo crear el evento.' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findFirst({
      where: { id: parseInt(id), isActive: true },
    });
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado.' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el evento.' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dataToUpdate = { ...req.body };

    if ('isAllDay' in dataToUpdate) {
      dataToUpdate.isAllDay = parseBoolean(dataToUpdate.isAllDay);
    }

    let effectiveIsAllDay: boolean | undefined =
      typeof dataToUpdate.isAllDay === 'boolean' ? dataToUpdate.isAllDay : undefined;

    let existingEvent: { isAllDay: boolean; startDate: Date; endDate: Date } | null = null;

    if ((dataToUpdate.startDate || dataToUpdate.endDate) && typeof effectiveIsAllDay === 'undefined') {
      existingEvent = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        select: { isAllDay: true, startDate: true, endDate: true },
      });
      effectiveIsAllDay = existingEvent?.isAllDay ?? false;
    } else if (dataToUpdate.startDate || dataToUpdate.endDate) {
      existingEvent = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        select: { isAllDay: true, startDate: true, endDate: true },
      });
    }

    if (!existingEvent) {
      existingEvent = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        select: { isAllDay: true, startDate: true, endDate: true },
      });
    }

    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento no encontrado.' });
    }

    if (typeof effectiveIsAllDay === 'undefined') {
      effectiveIsAllDay = existingEvent.isAllDay;
    }

    if (dataToUpdate.startDate) {
      dataToUpdate.startDate = normalizeDateInput(
        dataToUpdate.startDate,
        effectiveIsAllDay ?? false,
        'start'
      );
    }
    if (dataToUpdate.endDate) {
      dataToUpdate.endDate = normalizeDateInput(
        dataToUpdate.endDate,
        effectiveIsAllDay ?? false,
        'end'
      );
    }

    const finalStartDate = (dataToUpdate.startDate as Date | undefined) ?? existingEvent.startDate;
    const finalEndDate = (dataToUpdate.endDate as Date | undefined) ?? existingEvent.endDate;

    if ((dataToUpdate.startDate || dataToUpdate.endDate) && finalEndDate < finalStartDate) {
      return res.status(400).json({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
    }

    const todayStart = getTodayStart();
    if (dataToUpdate.startDate && finalStartDate < todayStart) {
      return res.status(400).json({ error: 'Las fechas no pueden ser anteriores al día de hoy.' });
    }
    if (dataToUpdate.endDate && finalEndDate < todayStart) {
      return res.status(400).json({ error: 'Las fechas no pueden ser anteriores al día de hoy.' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });
    res.json(updatedEvent);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === INVALID_DATE_ERROR) {
      return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas.' });
    }
    res.status(500).json({ error: 'No se pudo actualizar el evento.' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.event.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    res.json({ message: 'Evento desactivado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo desactivar el evento.' });
  }
};

export const reactivateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado.' });
    }

    if (event.endDate < new Date()) {
      return res.status(400).json({ error: 'No se puede reactivar un evento que ya finalizó.' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { isActive: true },
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo reactivar el evento.' });
  }
};

export const exportEvents = async (req: Request, res: Response) => {
  try {
    const { status = 'all', format = 'csv' } = req.query as { status?: string; format?: string };

    const where: any = {};
    if (status === 'active') {where.isActive = true;} 
      else if (status === 'inactive') {where.isActive = false;
    }

    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        isAllDay: true,
        location: true,
        audience: true,
        category: { select: { name: true } },
        createdAt: true,
        isActive: true,
      },
      orderBy: { startDate: 'asc' },
    });

    const filenameBase = `eventos-${status}`;
    const formatDate = (date: Date) => date.toLocaleDateString('es-HN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });

    const processedData = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description ?? 'N/A',
      startDate: formatDate(e.startDate),
      endDate: formatDate(e.endDate),
      isAllDay: e.isAllDay ? 'Sí' : 'No',
      location: e.location ?? 'No especificado',
      audience: e.audience,
      category: e.category?.name ?? 'Sin categoría',
      createdAt: formatDate(e.createdAt),
      isActive: e.isActive ? 'Activo' : 'Inactivo',
    }));

    const headersForExcel = [
      { key: 'id', header: 'ID', width: 10 },
      { key: 'title', header: 'Título', width: 30 },
      { key: 'description', header: 'Descripción', width: 40 },
      { key: 'startDate', header: 'Fecha de Inicio', width: 20 },
      { key: 'endDate', header: 'Fecha de Fin', width: 20 },
      { key: 'isAllDay', header: 'Todo el día', width: 15 },
      { key: 'location', header: 'Ubicación', width: 25 },
      { key: 'audience', header: 'Público', width: 15 },
      { key: 'category', header: 'Categoría', width: 20 },
      { key: 'createdAt', header: 'Fecha de Creación', width: 20 },
      { key: 'isActive', header: 'Estado', width: 15 },
    ];
    const dataForExcel = processedData.map((e) => ({...e, isActive: e.isActive ? 'Activo' : 'Inactivo'}));

    const headersForPdfAndCsv = ['ID', 'Título', 'Descripción', 'Fecha de Inicio', 'Fecha de Fin', 'Todo el día', 'Ubicación', 'Público', 'Categoría', 'Fecha de Creación', 'Estado'];
    const dataForPdfAndCsv = processedData.map((e) => [
      e.id,
      e.title,
      e.description,
      e.startDate,
      e.endDate,
      e.isAllDay,
      e.location,
      e.audience,
      e.category,
      e.createdAt,
      e.isActive ? 'Activo' : 'Inactivo',
    ]);

    switch (format) {
          case 'excel':
            const excelFilename = buildTimestampedFilename(filenameBase, 'xlsx'); 
            await sendExcelResponse(res, excelFilename, headersForExcel, dataForExcel);
            break;
    
          case 'pdf':
            const pdfFilename = buildTimestampedFilename(filenameBase, 'pdf');
            sendPdfTableResponse(res, pdfFilename, {
              title: 'Lista de Eventos',
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
        console.error('Error al exportar la lista de eventos:', error);
        res.status(500).json({ error: 'No se pudo generar el archivo de exportación.' });
      }
};
