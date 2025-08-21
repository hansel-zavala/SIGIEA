// frontend/src/pages/StudentDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import { FaCalendarAlt } from 'react-icons/fa';
import Badge from '../components/ui/Badge';

// ✅ PASO 1: Importar los componentes del calendario
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { EventInput } from '@fullcalendar/core';

// ✅ PASO 2: Añadir la función para convertir planes en eventos del calendario
const dayNameToNumber: { [key: string]: number } = {
    'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6
};

const planToEvent = (plan: any): EventInput => {
    // 1. Toma el array de nombres ["Lunes", "Miércoles"]...
    const days = plan.daysOfWeek.map((day: string) => dayNameToNumber[day]);
    // 2. ...y lo convierte en un array de números [1, 3]

    return {
        id: String(plan.id),
        title: plan.leccion.title,
        daysOfWeek: days, // 3. Pasa el array completo [1, 3] al calendario
        startTime: plan.startTime,
        duration: { minutes: plan.duration },
        allDay: false,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8'
    };
};


function StudentDetailPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();
  const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);
  const navigate = useNavigate();

  const handleEventClick = (clickInfo: any) => {
    if (!id) return;
    const planId = clickInfo.event.id;
    navigate(`/students/${id}/plans/${planId}/log-session`);
  };

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        try {
          const data = await studentService.getStudentById(parseInt(id, 10));
          setStudent(data);
          // ✅ PASO 4: Cuando se cargan los datos del estudiante, procesar sus planes
          if (data.therapyPlans) {
            const events = data.therapyPlans.map(planToEvent);
            setCalendarEvents(events);
          }
        } catch (err) {
          setError('No se pudo cargar la información del estudiante.');
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
    
  }, [id]);

  if (loading) return <p>Cargando perfil del estudiante...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!student) return <p>No se encontró al estudiante.</p>;
  if (loading) return <p>Cargando perfil del estudiante...</p>;

  return (
    <div className="space-y-8">
      {/* --- SECCIÓN DE INFORMACIÓN GENERAL (SIN CAMBIOS) --- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil de: {student.fullName}</h2>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-600">Terapeuta Asignado</h3>
            <p>{student.therapist?.fullName || 'No especificado'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Género</h3>
            <Badge color={student.genero ? 'info' : 'warning'}>
              {student.genero || 'No asignado'}
            </Badge>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE HORARIO SEMANAL --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Horario Semanal de Terapias</h3>
          {/* ✅ PASO 5: Actualizar el botón y el enlace */}
          <Link to={`/students/${student.id}/schedule`}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                  <FaCalendarAlt /> Gestionar Horario
              </button>
          </Link>
        </div>
        {/* ✅ PASO 6: Reemplazar la tabla por el componente FullCalendar */}
        <div className="bg-white p-4 rounded-lg shadow-md">
            {calendarEvents.length > 0 ? (
                <FullCalendar
                    plugins={[timeGridPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: '',
                        center: '',
                        right: ''
                    }}
                    events={calendarEvents}
                    allDaySlot={false}
                    locale='es' // Poner el calendario en español
                    slotMinTime="07:00:00" // Hora de inicio visible
                    slotMaxTime="18:00:00" // Hora de fin visible
                    height="auto" // Ajustar altura al contenido
                    eventClick={handleEventClick} // <-- AÑADE ESTA LÍNEA
                    eventClassNames={'cursor-pointer'} 
                />
            ) : (
                <p className="text-center text-gray-500 py-8">Este estudiante aún no tiene un horario asignado.</p>
            )}
        </div>
      </div>

      {/* --- SECCIÓN DE HISTORIAL DE SESIONES (SIN CAMBIOS) --- */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Sesiones Registradas</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Fecha</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Asistencia</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {student.sessionLogs.map((log: any) => (
                <tr key={log.id}>
                  <td className="px-5 py-4 text-gray-500">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4"><Badge color={log.attendance === 'Presente' ? 'success' : 'error'}>{log.attendance}</Badge></td>
                  <td className="px-5 py-4 text-gray-500">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailPage;