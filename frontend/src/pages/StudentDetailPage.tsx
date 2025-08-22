// frontend/src/pages/StudentDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import therapySessionService from '../services/therapySessionService'; // ✅ USAMOS EL NUEVO SERVICIO
import { FaCalendarAlt } from 'react-icons/fa';
import Badge from '../components/ui/Badge';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { EventInput } from '@fullcalendar/core';

// ✅ Interfaz para la nueva estructura de sesión
interface TherapySession {
    id: number;
    startTime: string;
    endTime: string;
    leccion: {
        title: string;
    };
}

function StudentDetailPage() {
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id: studentId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([]);

    useEffect(() => {
        if (studentId) {
            // Obtenemos los datos del estudiante y sus sesiones en paralelo
            Promise.all([
                studentService.getStudentById(parseInt(studentId)),
                therapySessionService.getSessionsByStudent(parseInt(studentId))
            ]).then(([studentData, sessionsData]) => {
                setStudent(studentData);
                
                // ✅ Convertimos las sesiones individuales en eventos de calendario
                const events = sessionsData.map((session: TherapySession) => ({
                    id: String(session.id), // El ID ahora es de la sesión individual
                    title: session.leccion.title,
                    start: session.startTime,
                    end: session.endTime
                }));
                setCalendarEvents(events);

            }).catch(err => {
                setError('No se pudo cargar la información del estudiante.');
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [studentId]);

    // ✅ La lógica de clic ahora es más simple
    const handleEventClick = (clickInfo: any) => {
        // La página de LogSession sigue funcionando, pero ahora con el ID de la sesión
        const sessionId = clickInfo.event.id;
        // NOTA: Podríamos necesitar ajustar la ruta o la página de LogSession más adelante
        // Por ahora, lo dejamos así para mantener la funcionalidad.
        console.log(`Navegando al registro de la sesión individual ID: ${sessionId}`);
        // navigate(`/students/${studentId}/sessions/${sessionId}/log`);
    };

    if (loading) return <p>Cargando perfil del estudiante...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!student) return <p>No se encontró al estudiante.</p>;

    return (
        <div className="space-y-8">
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

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Horario de Terapias</h3>
                    <Link to={`/students/${student.id}/schedule`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                            <FaCalendarAlt /> Gestionar Horario
                        </button>
                    </Link>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {calendarEvents.length > 0 ? (
                        <FullCalendar
                            plugins={[timeGridPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                            events={calendarEvents}
                            allDaySlot={false}
                            locale='es'
                            slotMinTime="07:00:00"
                            slotMaxTime="18:00:00"
                            height="auto"
                            eventClick={handleEventClick}
                            eventClassNames={'cursor-pointer'}
                        />
                    ) : (
                        <p className="text-center text-gray-500 py-8">Este estudiante aún no tiene un horario asignado.</p>
                    )}
                </div>
            </div>
            
            {/* La sección de historial de sesiones la podríamos integrar en el futuro, por ahora la dejamos */}
        </div>
    );
}

export default StudentDetailPage;