import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import dashboardService, {
  type DashboardStats,
} from '../services/dashboardService.js';
import eventService, { type Event as EventType } from '../services/eventService.js';
import categoryService, { type Category } from '../services/categoryService.js';
import StatCard from '../components/ui/StatCard.js';
import { FaUserGraduate, FaUserMd, FaUsers, FaBook, FaCalendarAlt } from 'react-icons/fa';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventDetailModal from '../components/modals/EventDetailModal.js';

function DashboardPage() {
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  useEffect(() => {
    const loadDashboardData = () => {
      setLoading(true);
      Promise.all([
        dashboardService.getStats(),
        eventService.getAllEvents(),
        categoryService.getAllCategories(),
      ]).then(([statsData, eventsData, categoriesData]) => {
        setStats(statsData);
        setEvents(eventsData);
        setCategories(categoriesData);
      }).catch(() => {
        setError('No se pudo cargar la información del dashboard.');
      }).finally(() => {
        setLoading(false);
      });
    };

    loadDashboardData();

  }, [location]);

  const calendarEvents = events.map(event => ({
    id: String(event.id),
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    allDay: event.isAllDay,
    extendedProps: {
      ...event,
      categoryColor: event.category?.color || '#808080'
    }
  }));

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.extendedProps as EventType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const upcomingEvents = [...events]
    .filter(e => new Date(e.endDate || e.startDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 6);

  const formatDate = (iso: string, allDay?: boolean) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
    const time = allDay ? '' : ` • ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    return `${date}${time}`;
  };

  return (
    <div className="space-y-8">
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {stats && (
            <section aria-label="Resumen" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <Link to="/students" className="cursor-pointer">
                <StatCard
                  title="Alumnos Matriculados"
                  value={stats.students}
                  icon={<FaUserGraduate size={24} />}
                  color="pink"
                  growth={stats.studentGrowthPercentage}
                />
              </Link>
              <Link to="/therapists" className="cursor-pointer">
                <StatCard
                  title="Terapeutas Activos"
                  value={stats.therapists}
                  icon={<FaUserMd size={24} />}
                  color="blue"
                />
              </Link>
              <Link to="/guardians" className="cursor-pointer">
                <StatCard
                  title="Padres Registrados"
                  value={stats.parents}
                  icon={<FaUsers size={24} />}
                  color="green"
                />
              </Link>
              <Link to="/lecciones" className="cursor-pointer">
                <StatCard
                  title="Lecciones Creadas"
                  value={stats.lecciones}
                  icon={<FaBook size={24} />}
                  color="purple"
                />
              </Link>
            </section>
          )}

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <div className="mb-4">
                <div className="flex items-center justify-between bg-white rounded-xl shadow-sm ring-1 ring-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-[var(--brand-primary)]" />
                    <h3 className="text-lg font-semibold tracking-tight">Calendario de Eventos</h3>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {categories.map(cat => (
                      <span
                        key={cat.id}
                        className="inline-flex items-center gap-2 bg-violet-50/70 text-gray-700 px-2.5 py-1 rounded-full text-xs ring-1 ring-black/5 whitespace-nowrap"
                      >
                        <span style={{ backgroundColor: cat.color }} className="w-2.5 h-2.5 rounded-full inline-block"></span>
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md ring-1 ring-gray-100 custom-calendar-container">
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
              </div>
            </div>

            <aside className="space-y-4">
              <div className="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-5">
                <h4 className="text-lg font-semibold mb-4">Próximos eventos</h4>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay eventos próximos.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {upcomingEvents.map(ev => (
                      <li key={ev.id} className="py-3 flex items-start gap-3">
                        <span
                          className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: ev.category?.color || '#7c3aed' }}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
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
        </>
      )}

      <EventDetailModal event={selectedEvent} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default DashboardPage;