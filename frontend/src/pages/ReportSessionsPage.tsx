// frontend/src/pages/ReportSessionsPage.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FaBullseye,
  FaCalendarAlt,
  FaCalendarCheck,
  FaChartLine,
  FaCheckCircle,
  FaClipboardCheck,
  FaClipboardList,
  FaLightbulb,
  FaUserCircle,
  FaUserMd,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import reportService from '../services/reportService';
import therapistService from '../services/therapistService.js';
import sessionReportService from '../services/sessionReportService.js';
import type {
  SessionReportResponse,
  SessionReportHighlightType,
  SessionReportSessionDetail,
} from '../services/sessionReportService.js';

const MONTHS = [
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

interface StudentOption {
  id: number;
  fullName: string;
  therapistId?: number | null;
  therapistName?: string | null;
}

interface TherapistOption {
  id: number;
  fullName: string;
}

const statusStyles: Record<string, { label: string; classes: string }> = {
  Completada: {
    label: 'Completada',
    classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  Programada: {
    label: 'Programada',
    classes: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  Cancelada: {
    label: 'Cancelada',
    classes: 'bg-rose-100 text-rose-700 border border-rose-200',
  },
  Ausente: {
    label: 'Ausente',
    classes: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatTimeRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

function ReportSessionsPage() {
  const { studentId: routeStudentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hasPermission = user && (user.role === 'ADMIN' || user.permissions?.['MANAGE_SESSIONS'] || user.permissions?.['VIEW_REPORTS']);

  const currentDate = useMemo(() => new Date(), []);
  const availableYears = useMemo(
    () => Array.from({ length: 6 }, (_, index) => currentDate.getFullYear() - index),
    [currentDate],
  );

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [therapists, setTherapists] = useState<TherapistOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(() => {
    if (routeStudentId) {
      const parsed = Number(routeStudentId);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  });
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<SessionReportResponse | null>(null);

  useEffect(() => {
    reportService
      .getStudentsForReporting()
      .then((data) => {
        const mapped: StudentOption[] = data.map((student: any) => ({
          id: student.id,
          fullName: student.fullName,
          therapistId: student.therapist?.id ?? null,
          therapistName: student.therapist?.fullName ?? null,
        }));
        setStudents(mapped);
      })
      .catch(() => setError('No se pudo cargar la lista de estudiantes.'));
  }, []);

  useEffect(() => {
    therapistService
      .getAllTherapists(undefined, 1, 200, 'active')
      .then((response) => {
        const mapped: TherapistOption[] = response.data.map((therapist: any) => ({
          id: therapist.id,
          fullName: therapist.fullName || `${therapist.nombres} ${therapist.apellidos}`.trim(),
        }));
        setTherapists(mapped);
      })
      .catch(() => {
        // mantener silencio, la sección se mostrará vacía
      });
  }, []);

  useEffect(() => {
    if (!students.length) {
      return;
    }
    if (selectedStudentId && students.some((student) => student.id === selectedStudentId)) {
      return;
    }
    const defaultStudentId = selectedStudentId ?? students[0]?.id ?? null;
    if (defaultStudentId) {
      setSelectedStudentId(defaultStudentId);
    }
  }, [students, selectedStudentId]);

  useEffect(() => {
    if (selectedStudentId) {
      navigate(`/reports/sessions/${selectedStudentId}`, { replace: true });
    }
  }, [selectedStudentId, navigate]);

  const fetchReport = useCallback(async () => {
    if (!selectedStudentId) {
      setReport(null);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await sessionReportService.getSessionReport({
        studentId: selectedStudentId,
        month: selectedMonth,
        year: selectedYear,
        therapistId: selectedTherapistId !== 'all' ? selectedTherapistId : undefined,
      });
      setReport(data);
    } catch (err) {
      console.error('Error fetching session report', err);
      setReport(null);
      setError('No se pudo generar el reporte con los filtros seleccionados.');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, selectedMonth, selectedYear, selectedTherapistId]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchReport();
    }
  }, [selectedStudentId, selectedMonth, selectedYear, selectedTherapistId, fetchReport]);

  const statusBreakdown = useMemo(() => {
    if (!report) {
      return [];
    }
    const total = report.summary.totalSessions || 0;
    return report.statusBreakdown.map((item: { status: string; count: number }) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  }, [report]);

  const totalHoursWorked = useMemo(() => {
    if (!report) return 0;
    return Number((report.summary.totalDuration / 60).toFixed(1));
  }, [report]);

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para generar este reporte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 px-8 py-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/80 mb-2">Reporte de Sesiones</p>
              <h1 className="text-3xl lg:text-4xl font-bold">
                {report ? `Resumen de ${report.student.fullName}` : 'Selecciona un estudiante'}
              </h1>
              <p className="mt-3 text-white/80 flex flex-wrap items-center gap-2">
                <FaCalendarAlt className="text-white/90" />
                <span>
                  {report ? `Periodo: ${report.period.label}` : `Periodo: ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
                </span>
                {report?.metadata.generatedAt && (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-white/50">•</span>
                    Generado el {formatDateTime(report.metadata.generatedAt)}
                  </span>
                )}
              </p>
            </div>
            {report?.student && (
              <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-2xl font-semibold">
                  {report.student.initials}
                </div>
                <div>
                  <p className="text-sm text-white/70">Terapeuta asignado</p>
                  <p className="font-semibold text-lg">
                    {report.student.therapist?.fullName ?? 'Sin terapeuta asignado'}
                  </p>
                  <p className="text-xs text-white/70">
                    {report.metadata.lastSessionDate
                      ? `Última sesión registrada: ${formatDate(report.metadata.lastSessionDate)}`
                      : 'Sin sesiones registradas en el periodo'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Estudiante</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={selectedStudentId ?? ''}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value)) {
                    setSelectedStudentId(value);
                  } else {
                    setSelectedStudentId(null);
                  }
                }}
              >
                <option value="" disabled>
                  Selecciona un estudiante
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Mes</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Año</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Terapeuta</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={selectedTherapistId}
                onChange={(event) => {
                  if (event.target.value === 'all') {
                    setSelectedTherapistId('all');
                  } else {
                    setSelectedTherapistId(Number(event.target.value));
                  }
                }}
              >
                <option value="all">Todos los terapeutas</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <p className="text-sm text-gray-500">
              Ajusta los filtros para explorar el comportamiento de las sesiones registradas durante el periodo seleccionado.
            </p>
            <button
              type="button"
              onClick={fetchReport}
              disabled={loading || !selectedStudentId}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-violet-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400"
            >
              <FaCalendarCheck />
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Sesiones registradas</span>
            <FaClipboardList className="text-violet-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{report?.summary.totalSessions ?? 0}</p>
          <p className="mt-1 text-xs text-gray-500">
            {report?.metadata.firstSessionDate
              ? `Desde ${formatDate(report.metadata.firstSessionDate)}`
              : 'Sin registros en el periodo'}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Sesiones completadas</span>
            <FaCheckCircle className="text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{report?.summary.completedSessions ?? 0}</p>
          <p className="mt-1 text-xs text-emerald-600">
            {report ? `${report.summary.completionRate}% del total` : '---'}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Asistencia</span>
            <FaChartLine className="text-blue-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{report ? `${report.summary.attendanceRate}%` : '0%'}</p>
          <p className="mt-1 text-xs text-gray-500">Tasa de asistencia global</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Objetivos cubiertos</span>
            <FaBullseye className="text-purple-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">{report ? `${report.summary.objectiveCoverage}%` : '0%'}</p>
          <p className="mt-1 text-xs text-gray-500">Lecciones trabajadas en el periodo</p>
        </div>
      </div>

      {report ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FaUserCircle className="text-3xl text-violet-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Resumen del estudiante</h3>
                  <p className="text-sm text-gray-500">Información general del periodo seleccionado</p>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-start justify-between">
                  <span className="text-gray-500">Terapeuta principal</span>
                  <span className="font-medium text-gray-800 text-right">
                    {report.student.therapist?.fullName ?? 'No asignado'}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500">Terapeutas involucrados</span>
                  <span className="font-medium text-gray-800 text-right">{report.summary.therapistsInvolved}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500">Horas totales registradas</span>
                  <span className="font-medium text-gray-800 text-right">{totalHoursWorked} h</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500">Duración promedio por sesión</span>
                  <span className="font-medium text-gray-800 text-right">{report.summary.averageDuration} min</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500">Sesiones programadas</span>
                  <span className="font-medium text-gray-800 text-right">{report.summary.plannedSessions}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500">Ausencias registradas</span>
                  <span className="font-medium text-gray-800 text-right">{report.summary.absentSessions}</span>
                </div>
              </div>
              {report.therapists.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Equipo que registró sesiones</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.therapists.map((therapist: { id: number; fullName: string }) => (
                      <span
                        key={therapist.id}
                        className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600"
                      >
                        <FaUserMd />
                        {therapist.fullName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Distribución de sesiones</h3>
                  <FaClipboardCheck className="text-xl text-violet-500" />
                </div>
                <div className="mt-4 space-y-4">
                  {statusBreakdown.map((status: { status: string; count: number; percentage: number }) => (
                    <div key={status.status}>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{statusStyles[status.status]?.label ?? status.status}</span>
                        <span>{status.count} ({status.percentage}%)</span>
                      </div>
                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-3 rounded-full ${
                            status.status === 'Completada'
                              ? 'bg-emerald-400'
                              : status.status === 'Programada'
                                ? 'bg-blue-400'
                                : status.status === 'Cancelada'
                                  ? 'bg-rose-400'
                                  : 'bg-amber-400'
                          }`}
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Lecciones trabajadas</h3>
                  <FaClipboardList className="text-xl text-violet-500" />
                </div>
                {report.leccionBreakdown.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {report.leccionBreakdown.map((leccion: { leccionId: number; title: string; objective: string | null; totalSessions: number; completedSessions: number }) => (
                      <div key={leccion.leccionId} className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{leccion.title}</p>
                            {leccion.objective && (
                              <p className="text-xs text-gray-500 mt-1 max-w-xl">{leccion.objective}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">{leccion.completedSessions} completadas</p>
                            <p className="text-xs text-gray-500">de {leccion.totalSessions} registro(s)</p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-violet-400"
                            style={{
                              width: `${leccion.totalSessions > 0 ? Math.round((leccion.completedSessions / leccion.totalSessions) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No se registraron lecciones en este periodo.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FaLightbulb className="text-2xl text-amber-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Hallazgos destacados</h3>
                  <p className="text-sm text-gray-500">Puntos clave identificados a partir de las sesiones registradas</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                {report.insights.length > 0 ? (
                  report.insights.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        {index + 1}
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No hay hallazgos disponibles para este periodo.</li>
                )}
              </ul>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FaClipboardCheck className="text-2xl text-emerald-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recomendaciones</h3>
                  <p className="text-sm text-gray-500">Acciones sugeridas para fortalecer el proceso terapéutico</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                {report.recommendations.length > 0 ? (
                  report.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <FaCheckCircle />
                      </span>
                      <span>{recommendation}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No se generaron recomendaciones específicas.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Sesiones registradas</h3>
              <p className="text-xs text-gray-500">
                Detalles capturados por los terapeutas durante el registro de cada sesión
              </p>
            </div>
            {report.sessions.length > 0 ? (
              <div className="mt-6 space-y-4">
                {report.sessions.map((session: SessionReportSessionDetail) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-gray-100 p-5 transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{formatDate(session.startTime)}</p>
                        <h4 className="text-base font-semibold text-gray-800 mt-1">{session.leccionTitle}</h4>
                        <p className="text-xs text-gray-500">{formatTimeRange(session.startTime, session.endTime)}</p>
                        {session.therapistName && (
                          <p className="text-xs text-gray-500 mt-1">Registrado por: {session.therapistName}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyles[session.status]?.classes ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {statusStyles[session.status]?.label ?? session.status}
                        </span>
                        <span className="text-xs text-gray-500">Duración: {session.duration} min</span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Progreso</p>
                        <p className="mt-1 text-gray-700 whitespace-pre-wrap min-h-[3rem]">
                          {session.progress?.trim() || 'Sin registro'}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Comportamiento</p>
                        <p className="mt-1 text-gray-700 whitespace-pre-wrap min-h-[3rem]">
                          {session.behavior?.trim() || 'Sin registro'}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas clínicas</p>
                        <p className="mt-1 text-gray-700 whitespace-pre-wrap min-h-[3rem]">
                          {session.notes?.trim() || 'Sin registro'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                No se encontraron sesiones con los filtros seleccionados.
              </div>
            )}
          </div>

          {report.highlights.length > 0 && (
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">Notas destacadas de las sesiones</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.highlights.map((highlight: { sessionId: number; type: SessionReportHighlightType; text: string; date: string }, index: number) => (
                  <div key={`${highlight.sessionId}-${index}`} className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      {highlight.type === 'progress'
                        ? 'Progreso'
                        : highlight.type === 'behavior'
                          ? 'Comportamiento'
                          : 'Nota clínica'}
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-800">Sesión del {formatDate(highlight.date)}</p>
                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{highlight.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          Selecciona un estudiante y haz clic en "Generar Reporte" para visualizar el resumen de sesiones.
          {students.length === 0 && (
            <div className="mt-2 text-xs text-gray-400">Asegúrate de tener estudiantes activos con sesiones registradas.</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 mt-12">
        <span>SIGIEA · Reporte de Sesiones</span>
        <span>
          ¿Necesitas otro tipo de informe?{' '}
          <Link to="/reports" className="font-medium text-violet-500 hover:underline">
            Explora otros reportes disponibles
          </Link>
        </span>
      </div>
    </div>
  );
}

export default ReportSessionsPage;