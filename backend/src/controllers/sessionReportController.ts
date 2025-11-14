// backend/src/controllers/sessionReportController.ts
import { Response } from 'express';
import { SessionStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../types/express.js';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const formatFullName = (names?: string | null, lastNames?: string | null) => {
  const parts = [names, lastNames].filter(Boolean);
  return parts.join(' ').trim();
};

const buildInitials = (names?: string | null, lastNames?: string | null) => {
  const takeInitial = (value?: string | null) =>
    value && value.length ? value.trim().charAt(0).toUpperCase() : '';
  const initials = `${takeInitial(names)}${takeInitial(lastNames)}`;
  if (initials.length === 0) {
    return 'NA';
  }
  return initials;
};

const normalizeNumberParam = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const getSessionReport = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = normalizeNumberParam(req.query.studentId);
    if (!studentId) {
      return res
        .status(400)
        .json({ error: 'El parámetro "studentId" es obligatorio y debe ser numérico.' });
    }

    const monthParam = normalizeNumberParam(req.query.month);
    const yearParam = normalizeNumberParam(req.query.year);
    const therapistParam = normalizeNumberParam(req.query.therapistId);

    const now = new Date();
    const targetMonth = monthParam && monthParam >= 1 && monthParam <= 12 ? monthParam : now.getMonth() + 1;
    const targetYear = yearParam && yearParam >= 2000 ? yearParam : now.getFullYear();

    const startOfPeriod = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    const endOfPeriod = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        therapist: true,
        guardians: { select: { id: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }

    // Role-based access enforcement inside controller (query-based endpoint)
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    if (req.user.role === 'PARENT') {
      const guardianId = req.user.guardian?.id;
      const isOwner = guardianId
        ? student.guardians.some((g) => g.id === guardianId)
        : false;
      if (!isOwner) {
        return res.status(403).json({ error: 'Acceso denegado.' });
      }
    } else if (req.user.role === 'THERAPIST') {
      const therapistProfileId = req.user.therapistProfile?.id;
      if (!therapistProfileId || student.therapistId !== therapistProfileId) {
        return res.status(403).json({ error: 'Acceso denegado.' });
      }
    }
    // ADMIN: allowed

    const sessions = await prisma.therapySession.findMany({
      where: {
        studentId,
        startTime: {
          gte: startOfPeriod,
          lte: endOfPeriod,
        },
        ...(therapistParam ? { therapistId: therapistParam } : {}),
      },
      include: {
        therapist: true,
        leccion: {
          select: {
            id: true,
            title: true,
            objective: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const statusCounts: Record<SessionStatus, number> = {
      [SessionStatus.Programada]: 0,
      [SessionStatus.Completada]: 0,
      [SessionStatus.Cancelada]: 0,
      [SessionStatus.Ausente]: 0,
    };

    let totalDuration = 0;
    const leccionTotals = new Map<
      number,
      {
        title: string;
        objective: string | null;
        total: number;
        completed: number;
      }
    >();
    const therapistMap = new Map<number, string>();

    sessions.forEach((session) => {
      statusCounts[session.status] = (statusCounts[session.status] ?? 0) + 1;
      totalDuration +=
        session.duration ??
        Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000);

      const leccionEntry =
        leccionTotals.get(session.leccionId) ??
        {
          title: session.leccion?.title ?? 'Sesión sin lección',
          objective: session.leccion?.objective ?? null,
          total: 0,
          completed: 0,
        };
      leccionEntry.total += 1;
      if (session.status === SessionStatus.Completada) {
        leccionEntry.completed += 1;
      }
      leccionTotals.set(session.leccionId, leccionEntry);

      if (session.therapist) {
        therapistMap.set(
          session.therapistId,
          formatFullName(session.therapist.nombres, session.therapist.apellidos)
        );
      }
    });

    const totalSessions = sessions.length;
    const completedSessions = statusCounts[SessionStatus.Completada] ?? 0;
    const plannedSessions = statusCounts[SessionStatus.Programada] ?? 0;
    const cancelledSessions = statusCounts[SessionStatus.Cancelada] ?? 0;
    const absentSessions = statusCounts[SessionStatus.Ausente] ?? 0;

    const attendanceRate =
      totalSessions > 0 ? Math.round(((totalSessions - absentSessions) / totalSessions) * 100) : 0;
    const completionRate =
      totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    const leccionBreakdown = Array.from(leccionTotals.entries()).map(([leccionId, info]) => ({
      leccionId,
      title: info.title,
      objective: info.objective,
      totalSessions: info.total,
      completedSessions: info.completed,
    }));

    const completedLeccionesCount = leccionBreakdown.filter((entry) => entry.completedSessions > 0)
      .length;
    const objectiveCoverage =
      leccionBreakdown.length > 0
        ? Math.round((completedLeccionesCount / leccionBreakdown.length) * 100)
        : 0;

    const sessionDetails = sessions.map((session) => ({
      id: session.id,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      status: session.status,
      therapistId: session.therapistId,
      therapistName: session.therapist
        ? formatFullName(session.therapist.nombres, session.therapist.apellidos)
        : null,
      leccionId: session.leccionId,
      leccionTitle: session.leccion?.title ?? 'Sesión sin lección',
      leccionObjective: session.leccion?.objective ?? null,
      notes: session.notes ?? null,
      behavior: session.behavior ?? null,
      progress: session.progress ?? null,
      duration: session.duration,
    }));

    const highlightEntries = sessionDetails
      .filter(
        (detail) =>
          (detail.progress && detail.progress.trim()) ||
          (detail.behavior && detail.behavior.trim()) ||
          (detail.notes && detail.notes.trim())
      )
      .map((detail) => {
        if (detail.progress && detail.progress.trim()) {
          return {
            sessionId: detail.id,
            type: 'progress' as const,
            text: detail.progress.trim(),
            date: detail.startTime,
          };
        }
        if (detail.behavior && detail.behavior.trim()) {
          return {
            sessionId: detail.id,
            type: 'behavior' as const,
            text: detail.behavior.trim(),
            date: detail.startTime,
          };
        }
        return {
          sessionId: detail.id,
          type: 'note' as const,
          text: (detail.notes ?? '').trim(),
          date: detail.startTime,
        };
      })
      .slice(0, 6);

    const insights: string[] = [];
    if (totalSessions === 0) {
      insights.push('No se registran sesiones en el periodo seleccionado.');
    } else {
      insights.push(`Se registraron ${totalSessions} sesión(es) durante ${MONTH_NAMES[targetMonth - 1]} ${targetYear}.`);
      if (completedSessions > 0) {
        insights.push(`El ${completionRate}% de las sesiones registradas fueron marcadas como completadas.`);
      }
      if (attendanceRate >= 90) {
        insights.push('Excelente asistencia general a las sesiones registradas.');
      } else if (attendanceRate >= 70) {
        insights.push('La asistencia se mantiene estable, con oportunidades de mejora.');
      }
      if (cancelledSessions > 0) {
        insights.push(`${cancelledSessions} sesión(es) fueron canceladas en el periodo.`);
      }
      if (absentSessions > 0) {
        insights.push(`Se registraron ${absentSessions} ausencia(s) que afectan la continuidad del plan terapéutico.`);
      }
      if (therapistMap.size > 1) {
        insights.push('Más de un terapeuta trabajó con el estudiante en este periodo.');
      }
    }

    const recommendations: string[] = [];
    if (totalSessions === 0) {
      recommendations.push('Programa sesiones o ajusta los filtros para visualizar información relevante.');
    } else {
      if (attendanceRate < 85) {
        recommendations.push('Refuerza los recordatorios y la coordinación con los tutores para mejorar la asistencia.');
      }
      if (objectiveCoverage < 70 && leccionBreakdown.length > 0) {
        recommendations.push('Considera revisar los objetivos del plan terapéutico para asegurar que se cubran las lecciones pendientes.');
      }
      if (cancelledSessions > 0) {
        recommendations.push('Analiza las razones de cancelación para prevenir interrupciones en el proceso terapéutico.');
      }
      if (!highlightEntries.length) {
        recommendations.push('Registra observaciones en cada sesión para dar seguimiento a los avances del estudiante.');
      }
    }

    const firstSessionDate = sessions[0]?.startTime ?? null;
    const lastSessionDate = sessions[sessions.length - 1]?.startTime ?? null;

    return res.json({
      student: {
        id: student.id,
        fullName: formatFullName(student.nombres, student.apellidos),
        initials: buildInitials(student.nombres, student.apellidos),
        therapist: student.therapist
          ? {
              id: student.therapist.id,
              fullName: formatFullName(student.therapist.nombres, student.therapist.apellidos),
            }
          : null,
      },
      period: {
        month: targetMonth,
        year: targetYear,
        label: `${MONTH_NAMES[targetMonth - 1]} ${targetYear}`,
        startDate: startOfPeriod.toISOString(),
        endDate: endOfPeriod.toISOString(),
      },
      summary: {
        totalSessions,
        completedSessions,
        plannedSessions,
        cancelledSessions,
        absentSessions,
        attendanceRate,
        completionRate,
        averageDuration,
        objectiveCoverage,
        uniqueLecciones: leccionBreakdown.length,
        therapistsInvolved: therapistMap.size,
        totalDuration,
      },
      statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      leccionBreakdown,
      sessions: sessionDetails,
      highlights: highlightEntries,
      insights,
      recommendations,
      therapists: Array.from(therapistMap.entries()).map(([id, fullName]) => ({ id, fullName })),
      metadata: {
        generatedAt: new Date().toISOString(),
        firstSessionDate: firstSessionDate ? firstSessionDate.toISOString() : null,
        lastSessionDate: lastSessionDate ? lastSessionDate.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error al generar el reporte de sesiones:', error);
    return res.status(500).json({ error: 'No se pudo generar el reporte de sesiones.' });
  }
};

export default {
  getSessionReport,
};