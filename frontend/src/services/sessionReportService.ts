// frontend/src/services/sessionReportService.ts
import api from './api';

export type SessionReportHighlightType = 'progress' | 'behavior' | 'note';

export interface SessionReportSessionDetail {
  id: number;
  startTime: string;
  endTime: string;
  status: 'Programada' | 'Completada' | 'Cancelada' | 'Ausente';
  therapistId: number;
  therapistName: string | null;
  leccionId: number;
  leccionTitle: string;
  leccionObjective: string | null;
  notes: string | null;
  behavior: string | null;
  progress: string | null;
  duration: number;
}

export interface SessionReportResponse {
  student: {
    id: number;
    fullName: string;
    initials: string;
    therapist: { id: number; fullName: string } | null;
  };
  period: {
    month: number;
    year: number;
    label: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSessions: number;
    completedSessions: number;
    plannedSessions: number;
    cancelledSessions: number;
    absentSessions: number;
    attendanceRate: number;
    completionRate: number;
    averageDuration: number;
    objectiveCoverage: number;
    uniqueLecciones: number;
    therapistsInvolved: number;
    totalDuration: number;
  };
  statusBreakdown: { status: string; count: number }[];
  leccionBreakdown: {
    leccionId: number;
    title: string;
    objective: string | null;
    totalSessions: number;
    completedSessions: number;
  }[];
  sessions: SessionReportSessionDetail[];
  highlights: { sessionId: number; type: SessionReportHighlightType; text: string; date: string }[];
  insights: string[];
  recommendations: string[];
  therapists: { id: number; fullName: string }[];
  metadata: {
    generatedAt: string;
    firstSessionDate: string | null;
    lastSessionDate: string | null;
  };
}

export async function getSessionReport(params: {
  studentId: number;
  month?: number;
  year?: number;
  therapistId?: number;
}): Promise<SessionReportResponse> {
  const response = await api.get('/reports-sessions', { params });
  return response.data as SessionReportResponse;
}

export default {
  getSessionReport,
};