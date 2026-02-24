import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import dashboardService, { type DashboardStats } from '../services/dashboardService.js';
import eventService, { type Event as EventType } from '../services/eventService.js';
import StatCard from '../components/ui/StatCard.js';
import { FaUserGraduate, FaUserMd, FaUsers, FaBook, FaCalendarAlt, FaClock, FaFileAlt } from 'react-icons/fa';
import MonthlyCalendar from '../components/ui/MonthlyCalendar.js';
import EventDetailModal from '../components/modals/EventDetailModal.js';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
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

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const statsData = await dashboardService.getStats();
        setStats(statsData);

        if (canViewEvents) {
          try {
            const eventsData = await eventService.getAllEvents();
            setEvents(eventsData);
          } catch (err) {
            console.warn('No se pudieron cargar los eventos:', err);
            setEvents([]);
          }
        }
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        setError('No se pudo cargar la información del dashboard.');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [location, canViewEvents]);

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const isStatsLoading = loading && !stats;

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

      <section>
        <div className="max-w-lg">
          <MonthlyCalendar events={events} onEventClick={handleEventClick} />
        </div>
      </section>

      <EventDetailModal event={selectedEvent} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default DashboardPage;
