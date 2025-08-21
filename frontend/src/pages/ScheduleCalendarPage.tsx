// frontend/src/pages/ScheduleCalendarPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import therapyPlanService from '../services/therapyPlanService';
import leccionService from '../services/leccionService';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';

// Tipos para nuestros datos
interface Leccion {
  id: number;
  title: string;
}

interface TherapyPlan {
    id: number;
    daysOfWeek: string[];
    startTime: string;
    duration: number;
    leccion: Leccion;
}

const dayNameToNumber: { [key: string]: number } = {
    'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6
};

function ScheduleCalendarPage() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventInput[]>([]);
    const [lecciones, setLecciones] = useState<Leccion[]>([]);
    
    // Estado para el formulario de creación
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState('08:00');
    const [duration, setDuration] = useState(45);
    const [leccionId, setLeccionId] = useState('');

    useEffect(() => {
        if (studentId) {
            // Cargar lecciones y planes existentes
            Promise.all([
                leccionService.getAllLecciones(),
                therapyPlanService.getPlansForStudent(parseInt(studentId))
            ]).then(([leccionesData, plansData]) => {
                setLecciones(leccionesData);
                const calendarEvents = plansData.map(planToEvent);
                setEvents(calendarEvents);
            }).catch(error => {
                console.error("Error al cargar datos:", error);
            });
        }
    }, [studentId]);

    const planToEvent = (plan: TherapyPlan): EventInput => {
    const days = plan.daysOfWeek.map((day: string) => dayNameToNumber[day]);

    return {
        id: String(plan.id),
        title: plan.leccion.title,
        daysOfWeek: days,
        startTime: plan.startTime,
        duration: { minutes: plan.duration },
        allDay: false
    };
};

    const handleAddPlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || selectedDays.length === 0 || !leccionId || !startTime) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const planData = {
            leccionId: parseInt(leccionId),
            daysOfWeek: selectedDays,
            startTime,
            duration,
        };
        
        try {
            const newPlanData = await therapyPlanService.createPlan(parseInt(studentId), planData);
            // ✅ CAMBIA ESTAS DOS LÍNEAS
            const newEvent = planToEvent({ ...newPlanData, leccion: lecciones.find(l => l.id === parseInt(leccionId))! });
            setEvents(prev => [...prev, newEvent]);
            
            // Limpiar formulario
            setSelectedDays([]);
            setLeccionId('');

        } catch (error) {
            alert("No se pudo crear el plan.");
        }
    };
    
    const handleDayToggle = (day: string) => {
        setSelectedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleEventClick = (clickInfo: any) => {
        if (!studentId) return;
        const planId = clickInfo.event.id;
        
        // Navegamos a la página de registro de sesión para este plan
        navigate(`/students/${studentId}/plans/${planId}/log-session`);
    };

    

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Añadir Terapia Recurrente</h3>
                <form onSubmit={handleAddPlan} className="space-y-4">
                    <div>
                        <Label>Días de la semana</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {Object.keys(dayNameToNumber).map(day => (
                                <button
                                    type="button"
                                    key={day}
                                    onClick={() => handleDayToggle(day)}
                                    className={`px-3 py-1 text-sm rounded-full ${selectedDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                >
                                    {day.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="leccionId">Lección</Label>
                        <Select id="leccionId" value={leccionId} onChange={e => setLeccionId(e.target.value)} required options={lecciones.map(l => ({ value: String(l.id), label: l.title }))} placeholder="-- Selecciona Lección --" />
                    </div>
                    <div>
                        <Label htmlFor="startTime">Hora de Inicio</Label>
                        <Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="duration">Duración (minutos)</Label>
                        <Input id="duration" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Guardar Horario
                    </button>
                </form>
            </div>
            <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg shadow-md">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={events}
                    eventContent={renderEventContent}
                    allDaySlot={false}
                    eventClick={handleEventClick}
                    eventClassNames={'cursor-pointer'}
                />
            </div>
        </div>
    );
}

const renderEventContent = (eventInfo: any) => (
    <div className="p-1">
        <b>{eventInfo.timeText}</b>
        <i className="ml-2">{eventInfo.event.title}</i>
    </div>
);

export default ScheduleCalendarPage;