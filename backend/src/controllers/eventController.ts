// backend/src/controllers/eventController.ts
import { Request, Response } from 'express';
import prisma from '../db.js';
import { Prisma, EventAudience } from '@prisma/client';
import { toCsv, sendCsvResponse, buildTimestampedFilename } from '../utils/csv.js';

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
    const day = Number(dayStr);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day)
    ) {
      throw new Error(INVALID_DATE_ERROR);
    }

    const hours = type === 'end' ? 23 : 0;
    const minutes = type === 'end' ? 59 : 0;
    const seconds = type === 'end' ? 59 : 0;
    const milliseconds = type === 'end' ? 999 : 0;

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

export const getAllEvents = async (req: Request, res: Response) => {
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

    if (format !== 'csv') {
      return res.status(400).json({ error: 'Formato no soportado. Actualmente solo se permite CSV.' });
    }

    const whereClause: Prisma.EventWhereInput = {};
    if (status === 'active') whereClause.isActive = true;
    if (status === 'inactive') whereClause.isActive = false;

    const events = await prisma.event.findMany({
      where: status === 'all' ? undefined : whereClause,
      orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
      include: { category: true },
    });

    const rows = events.map((event) => [
      event.id,
      event.title,
      event.description ?? '',
      event.startDate.toISOString(),
      event.endDate.toISOString(),
      event.isAllDay ? 'Sí' : 'No',
      event.location ?? '',
      event.audience ?? EventAudience.General,
      event.category?.name ?? 'Sin categoría',
      event.isActive ? 'Activo' : 'Inactivo',
      event.createdAt.toISOString(),
    ]);

    const headers = [
      'ID',
      'Título',
      'Descripción',
      'Fecha inicio',
      'Fecha fin',
      'Todo el día',
      'Ubicación',
      'Audiencia',
      'Categoría',
      'Estado',
      'Fecha de creación',
    ];

    const csv = toCsv(headers, rows);
    const filename = buildTimestampedFilename(`eventos-${status}`);
    sendCsvResponse(res, filename, csv);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo exportar la lista de eventos.' });
  }
};
