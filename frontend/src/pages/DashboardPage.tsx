import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom'; // Se agregó Link aquí
import dashboardService, { type DashboardStats } from '../services/dashboardService.js';
import eventService, { type Event as EventType } from '../services/eventService.js';
import categoryService, { type Category } from '../services/categoryService.js';
import StatCard from '../components/ui/StatCard.js';
import { FaUserGraduate, FaUserMd, FaUsers, FaBook, FaCalendarAlt, FaClock, FaFileAlt } from 'react-icons/fa';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventDetailModal from '../components/modals/EventDetailModal.js';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // Check permissions
  const isParent = user?.role === 'PARENT';
  const canViewStudents = user?.role === 'ADMIN' || user?.permissions?.['VIEW_STUDENTS'];
  const canViewTherapists = user?.role === 'ADMIN' || user?.permissions?.['VIEW_THERAPISTS'];
  const canViewGuardians = user?.role === 'ADMIN' || user?.permissions?.['VIEW_GUARDIANS'];
  const canViewLecciones = user?.role === 'ADMIN' || user?.permissions?.['VIEW_LECCIONES'];
  const canViewEvents = user?.role === 'ADMIN' || user?.role === 'PARENT' || user?.permissions?.['VIEW_EVENTS'];
  const canManageCategories = user?.role === 'ADMIN' || user?.permissions?.['MANAGE_CATEGORIES'];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        // Always load stats (dashboard permission is required to access this page)
        const statsData = await dashboardService.getStats();
        setStats(statsData);

        // Load events only if user has permission
        if (canViewEvents) {
          try {
            const eventsData = await eventService.getAllEvents();
            setEvents(eventsData);
          } catch (error) {
            console.warn('No se pudieron cargar los eventos:', error);
            setEvents([]);
          }
        } else {
          setEvents([]);
        }

        // Load categories only if user has permission
        if (canManageCategories) {
          try {
            const categoriesData = await categoryService.getAllCategories();
            setCategories(categoriesData);
          } catch (error) {
            console.warn('No se pudieron cargar las categorías:', error);
            setCategories([]);
          }
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        setError('No se pudo cargar la información del dashboard.');
        setStats(null);
        setEvents([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

  }, [location, canViewEvents, canManageCategories]);

  const toDateOnly = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  };

  const addDays = (value: string, amount: number) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().split('T')[0];
  };

  const calendarEvents = events.map(event => {
    const baseEvent = {
      id: String(event.id),
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      allDay: event.isAllDay,
      extendedProps: {
        ...event,
        categoryColor: event.category?.color || '#808080'
      }
    };

    if (!event.isAllDay) {
      return baseEvent;
    }

    const normalizedStart = toDateOnly(event.startDate);
    const normalizedEnd = toDateOnly(event.endDate || event.startDate);

    return {
      ...baseEvent,
      start: normalizedStart,
      end: normalizedEnd,
    };
  });

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.extendedProps as EventType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // util para ordenar y formatear próximos eventos
  const upcomingEvents = [...events]
    .filter(e => new Date(e.endDate || e.startDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 6);

  const dayFormatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  const dayFormatterUTC = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });

  const timeFormatter = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatDate = (iso: string, allDay?: boolean) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    if (allDay) {
      return dayFormatterUTC.format(date);
    }
    return `${dayFormatter.format(date)} • ${timeFormatter.format(date)}`;
  };
  const isStatsLoading = loading && !stats;
  const isCalendarLoading = loading && events.length === 0;
  const isUpcomingLoading = loading && events.length === 0;

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <section aria-label="Resumen" className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats ? (
          <>
            {isParent ? (
              <>
                <StatCard
                  title="Total de Sesiones"
                  value={stats.totalSessions || 0}
                  icon={<FaCalendarAlt size={24} />}
                  color="blue"
                />
                <StatCard
                  title="Sesiones Completadas"
                  value={stats.completedSessions || 0}
                  icon={<FaUserMd size={24} />}
                  color="green"
                />
                <StatCard
                  title="Próximas Sesiones"
                  value={stats.upcomingSessions || 0}
                  icon={<FaClock size={24} />}
                  color="pink"
                />
                <StatCard
                  title="Reportes Recientes"
                  value={stats.recentReports || 0}
                  icon={<FaFileAlt size={24} />}
                  color="purple"
                />
              </>
            ) : (
              <>
                {canViewStudents && (
                  <Link to="/students" className="cursor-pointer">
                    <StatCard
                      title="Alumnos Matriculados"
                      value={stats.students || 0}
                      icon={<FaUserGraduate size={24} />}
                      color="pink"
                      growth={stats.studentGrowthPercentage}
                    />
                  </Link>
                )}
                {canViewTherapists && (
                  <Link to="/therapists" className="cursor-pointer">
                    <StatCard
                      title="Terapeutas Activos"
                      value={stats.therapists || 0}
                      icon={<FaUserMd size={24} />}
                      color="blue"
                    />
                  </Link>
                )}
                {canViewGuardians && (
                  <Link to="/guardians" className="cursor-pointer">
                    <StatCard
                      title="Padres Registrados"
                      value={stats.parents || 0}
                      icon={<FaUsers size={24} />}
                      color="green"
                    />
                  </Link>
                )}
                {canViewLecciones && (
                  <Link to="/lecciones" className="cursor-pointer">
                    <StatCard
                      title="Lecciones Creadas"
                      value={stats.lecciones || 0}
                      icon={<FaBook size={24} />}
                      color="purple"
                    />
                  </Link>
                )}
              </>
            )}
          </>
        ) : isStatsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-4 w-2/5 rounded bg-gray-200 animate-pulse" />
              <div className="mt-4 h-8 w-1/3 rounded bg-gray-200 animate-pulse" />
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-sm text-yellow-700">
            No se pudieron cargar las estadísticas del dashboard.
          </div>
        )}
      </section>

      {canViewEvents && (
        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <div className="mb-2">
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-[var(--brand-primary)]" />
                  <h3 className="text-lg font-semibold tracking-tight">Calendario de Eventos</h3>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs text-gray-500">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="inline-flex items-center gap-2 rounded-full bg-violet-50/70 px-2.5 py-1 text-gray-700 ring-1 ring-black/5 whitespace-nowrap"
                      >
                        <span style={{ backgroundColor: cat.color }} className="inline-block h-2.5 w-2.5 rounded-full" />
                        {cat.name}
                      </span>
                    ))
                  ) : (
                    <span>{loading ? 'Cargando categorías...' : 'Sin categorías disponibles.'}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="custom-calendar-container rounded-xl bg-white p-4 shadow-md ring-1 ring-gray-100">
              {isCalendarLoading ? (
                <div className="flex h-72 items-center justify-center text-gray-500">Cargando calendario...</div>
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: '',
                    center: 'title',
                    right: 'prev,next'
                  }}
                  events={calendarEvents}
                  locale="es"
                  height="auto"
                  eventClick={handleEventClick}
                  eventDidMount={(info) => {
                    if (info.event.extendedProps.categoryColor) {
                      info.el.style.setProperty('--fc-event-border-color', info.event.extendedProps.categoryColor);
                    }
                  }}
                />
              )}
            </div>
          </div>

        <aside className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-gray-100">
            <h4 className="mb-4 text-lg font-semibold">Próximos eventos</h4>
            {isUpcomingLoading ? (
              <p className="text-sm text-gray-500">Cargando eventos...</p>
            ) : error ? (
              <p className="text-sm text-red-500">No se pudieron cargar los eventos próximos.</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No hay eventos próximos.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {upcomingEvents.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3 py-3">
                    <span
                      className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: ev.category?.color || '#7c3aed' }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{ev.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(ev.startDate, ev.isAllDay)}
                        {ev.endDate && ev.endDate !== ev.startDate ? ` – ${formatDate(ev.endDate, ev.isAllDay)}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>
      )}


      <EventDetailModal event={selectedEvent} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default DashboardPage;
