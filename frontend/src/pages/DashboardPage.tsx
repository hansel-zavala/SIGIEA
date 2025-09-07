// frontend/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import dashboardService, { type DashboardStats } from '../services/dashboardService.js';
import eventService, { type Event as EventType } from '../services/eventService.js';
import categoryService, { type Category } from '../services/categoryService.js';
import StatCard from '../components/ui/StatCard.js';
import { FaUserGraduate, FaUserMd, FaUsers, FaBook } from 'react-icons/fa';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventDetailModal from '../components/modals/EventDetailModal.js';

function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadDashboardData = () => {
      setLoading(true);
      Promise.all([
        dashboardService.getStats(),
        eventService.getAllEvents(),
        categoryService.getAllCategories()
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

  return (
    <div className="space-y-8">
      {/*<div>
        <h2 className="text-2xl font-bold">Dashboard del {user?.role}</h2>
        <p className="mt-2 text-gray-600">Bienvenido, {user?.name}. Aquí tienes un resumen del sistema.</p>
      </div>*/}

      {loading ? ( <p>Cargando...</p> ) : 
       error ? ( <p className="text-red-500">{error}</p> ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            {stats && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard 
            title="Alumnos Matriculados" 
            value={stats.students} 
            icon={<FaUserGraduate size={24} />}
            color="pink"
            growth={stats.studentGrowthPercentage}
        />
        <StatCard 
            title="Terapeutas Activos" 
            value={stats.therapists} 
            icon={<FaUserMd size={24} />}
            color="blue"
        />
        <StatCard 
            title="Padres Registrados" 
            value={stats.parents} 
            icon={<FaUsers size={24} />}
            color="green"
        />
        <StatCard 
            title="Lecciones Creadas" 
            value={stats.lecciones} 
            icon={<FaBook size={24} />}
            color="purple"
        />
    </div>
)}
          </div>

          <div className="lg:col-span-1 bg-violet-100 rounded-lg p-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">{"Calendario de Eventos"}</h3>
              <div className="flex items-center gap-4">
                 <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center gap-2 text-sm">
                        <div style={{ backgroundColor: cat.color }} className="w-4 h-4 rounded-full"></div>
                        <span>{cat.name}</span>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md custom-calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: '',
                  center: 'title',
                  right: 'prev,next'
                }}
                datesSet={(arg) => {
                  setCurrentDate(arg.view.currentStart);
                }}
                events={calendarEvents}
                locale='es'
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
        </div>
      )}

      <EventDetailModal event={selectedEvent} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default DashboardPage;