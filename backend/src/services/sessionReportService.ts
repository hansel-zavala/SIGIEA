// backend/src/services/sessionReportService.ts
import { sessionReportRepository } from '../repositories/sessionReportRepository.js';
import { StudentNotFoundError, ReportAccessDeniedError } from '../errors/sessionReportErrors.js';
import { SessionStatus } from '@prisma/client';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const formatFullName = (names?: string | null, lastNames?: string | null) => {
  return [names, lastNames].filter(Boolean).join(' ').trim();
};

const buildInitials = (names?: string | null, lastNames?: string | null) => {
  const takeInitial = (value?: string | null) =>
    value && value.length ? value.trim().charAt(0).toUpperCase() : '';
  const initials = `${takeInitial(names)}${takeInitial(lastNames)}`;
  return initials.length === 0 ? 'NA' : initials;
};

const generateInsights = (
  totalSessions: number,
  monthName: string,
  year: number,
  completionRate: number,
  attendanceRate: number,
  completedSessions: number,
  cancelledSessions: number,
  absentSessions: number,
  therapistCount: number
) => {
  const insights: string[] = [];
  if (totalSessions === 0) {
    insights.push('No se registran sesiones en el periodo seleccionado.');
  } else {
    insights.push(`Se registraron ${totalSessions} sesión(es) durante ${monthName} ${year}.`);
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
    if (therapistCount > 1) {
      insights.push('Más de un terapeuta trabajó con el estudiante en este periodo.');
    }
  }
  return insights;
};

const generateRecommendations = (
  totalSessions: number,
  attendanceRate: number,
  objectiveCoverage: number,
  hasLecciones: boolean,
  cancelledSessions: number,
  highlightCount: number
) => {
  const recommendations: string[] = [];
  if (totalSessions === 0) {
    recommendations.push('Programa sesiones o ajusta los filtros para visualizar información relevante.');
  } else {
    if (attendanceRate < 85) {
      recommendations.push('Refuerza los recordatorios y la coordinación con los tutores para mejorar la asistencia.');
    }
    if (objectiveCoverage < 70 && hasLecciones) {
      recommendations.push('Considera revisar los objetivos del plan terapéutico para asegurar que se cubran las lecciones pendientes.');
    }
    if (cancelledSessions > 0) {
      recommendations.push('Analiza las razones de cancelación para prevenir interrupciones en el proceso terapéutico.');
    }
    if (highlightCount === 0) {
      recommendations.push('Registra observaciones en cada sesión para dar seguimiento a los avances del estudiante.');
    }
  }
  return recommendations;
};

export const getSessionReport = async (
  studentId: number,
  monthParam: number | undefined,
  yearParam: number | undefined,
  therapistParam: number | undefined,
  user: any
) => {
  const student = await sessionReportRepository.findStudentWithAccessDetails(studentId);
  if (!student) {
    throw new StudentNotFoundError();
  }

  if (user.role === 'PARENT') {
    const isOwner = user.guardian?.id && student.guardians.some((g) => g.id === user.guardian.id);
    if (!isOwner) throw new ReportAccessDeniedError();
  } else if (user.role === 'THERAPIST') {
    const therapistProfileId = user.therapistProfile?.id;
    if (!therapistProfileId || student.therapistId !== therapistProfileId) {
      throw new ReportAccessDeniedError();
    }
  }

  const now = new Date();
  const targetMonth = monthParam && monthParam >= 1 && monthParam <= 12 ? monthParam : now.getMonth() + 1;
  const targetYear = yearParam && yearParam >= 2000 ? yearParam : now.getFullYear();
  const startOfPeriod = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
  const endOfPeriod = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  const sessions = await sessionReportRepository.findSessionsInPeriod(
    studentId,
    startOfPeriod,
    endOfPeriod,
    therapistParam
  );

  const statusCounts: Record<SessionStatus, number> = {
    [SessionStatus.Programada]: 0,
    [SessionStatus.Completada]: 0,
    [SessionStatus.Cancelada]: 0,
    [SessionStatus.Ausente]: 0,
  };

  let totalDuration = 0;
  const leccionTotals = new Map<number, any>();
  const therapistMap = new Map<number, string>();

  sessions.forEach((session) => {
    statusCounts[session.status] = (statusCounts[session.status] ?? 0) + 1;
    totalDuration += session.duration ?? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000);

    const leccionEntry = leccionTotals.get(session.leccionId) ?? {
      title: session.leccion?.title ?? 'Sesión sin lección',
      objective: session.leccion?.objective ?? null,
      total: 0,
      completed: 0,
    };
    leccionEntry.total += 1;
    if (session.status === SessionStatus.Completada) leccionEntry.completed += 1;
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
  const absentSessions = statusCounts[SessionStatus.Ausente] ?? 0;
  const cancelledSessions = statusCounts[SessionStatus.Cancelada] ?? 0;

  const attendanceRate = totalSessions > 0 ? Math.round(((totalSessions - absentSessions) / totalSessions) * 100) : 0;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

  const leccionBreakdown = Array.from(leccionTotals.entries()).map(([leccionId, info]) => ({
    leccionId,
    title: info.title,
    objective: info.objective,
    totalSessions: info.total,
    completedSessions: info.completed,
  }));

  const completedLeccionesCount = leccionBreakdown.filter((entry) => entry.completedSessions > 0).length;
  const objectiveCoverage = leccionBreakdown.length > 0 ? Math.round((completedLeccionesCount / leccionBreakdown.length) * 100) : 0;

  const sessionDetails = sessions.map((session) => ({
    id: session.id,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime.toISOString(),
    status: session.status,
    therapistId: session.therapistId,
    therapistName: session.therapist ? formatFullName(session.therapist.nombres, session.therapist.apellidos) : null,
    leccionId: session.leccionId,
    leccionTitle: session.leccion?.title ?? 'Sesión sin lección',
    leccionObjective: session.leccion?.objective ?? null,
    notes: session.notes ?? null,
    behavior: session.behavior ?? null,
    progress: session.progress ?? null,
    duration: session.duration,
  }));

  const highlightEntries = sessionDetails
    .filter((detail) => (detail.progress && detail.progress.trim()) || (detail.behavior && detail.behavior.trim()) || (detail.notes && detail.notes.trim()))
    .map((detail) => {
      if (detail.progress && detail.progress.trim()) return { sessionId: detail.id, type: 'progress', text: detail.progress.trim(), date: detail.startTime };
      if (detail.behavior && detail.behavior.trim()) return { sessionId: detail.id, type: 'behavior', text: detail.behavior.trim(), date: detail.startTime };
      return { sessionId: detail.id, type: 'note', text: (detail.notes ?? '').trim(), date: detail.startTime };
    })
    .slice(0, 6);

  const insights = generateInsights(
    totalSessions, MONTH_NAMES[targetMonth - 1], targetYear, completionRate,
    attendanceRate, completedSessions, cancelledSessions, absentSessions, therapistMap.size
  );

  const recommendations = generateRecommendations(
    totalSessions, attendanceRate, objectiveCoverage,
    leccionBreakdown.length > 0, cancelledSessions, highlightEntries.length
  );

  return {
    student: {
      id: student.id,
      fullName: formatFullName(student.nombres, student.apellidos),
      initials: buildInitials(student.nombres, student.apellidos),
      therapist: student.therapist ? { id: student.therapist.id, fullName: formatFullName(student.therapist.nombres, student.therapist.apellidos) } : null,
    },
    period: {
      month: targetMonth,
      year: targetYear,
      label: `${MONTH_NAMES[targetMonth - 1]} ${targetYear}`,
      startDate: startOfPeriod.toISOString(),
      endDate: endOfPeriod.toISOString(),
    },
    summary: {
      totalSessions, completedSessions, plannedSessions: statusCounts[SessionStatus.Programada],
      cancelledSessions, absentSessions, attendanceRate, completionRate, averageDuration,
      objectiveCoverage, uniqueLecciones: leccionBreakdown.length, therapistsInvolved: therapistMap.size, totalDuration,
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
      firstSessionDate: sessions[0]?.startTime ? sessions[0].startTime.toISOString() : null,
      lastSessionDate: sessions[sessions.length - 1]?.startTime ? sessions[sessions.length - 1].startTime.toISOString() : null,
    },
  };
};