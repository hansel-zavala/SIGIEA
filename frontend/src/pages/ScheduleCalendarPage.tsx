// frontend/src/pages/ScheduleCalendarPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import Modal from 'react-modal';
import therapySessionService from '../services/therapySessionService';
import leccionService from '../services/leccionService';
import therapistService, { type TherapistProfile } from '../services/therapistService';
import studentService from '../services/studentService';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { FaTrash, FaEdit } from 'react-icons/fa';

interface Leccion { id: number; title: string; }
interface TherapySession { id: number; startTime: string; endTime: string; leccion: Leccion; leccionId: number; duration?: number; }
const modalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '450px', borderRadius: '8px', padding: '25px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 10 }};
Modal.setAppElement('#root');

const calculateAge = (birthDate: string) => {
    const birthday = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return age;
};

function ScheduleCalendarPage() {
    const { studentId } = useParams<{ studentId: string }>();
    const [student, setStudent] = useState<any>(null);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [lecciones, setLecciones] = useState<Leccion[]>([]);
    const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState('08:00');
    const [duration, setDuration] = useState(45);
    const [leccionId, setLeccionId] = useState('');
    const [therapistId, setTherapistId] = useState('');
    const [weeksToSchedule, setWeeksToSchedule] = useState(4);
    const dayOptions = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<TherapySession | null>(null);
    const [editFormData, setEditFormData] = useState({ leccionId: '', startTime: '', duration: 45 });

    const sessionToEvent = (session: TherapySession): EventInput => ({ id: String(session.id), title: session.leccion.title, start: session.startTime, end: session.endTime });

    useEffect(() => {
        if (!studentId) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [studentData, leccionesData, therapistsResponse, sessionsData] = await Promise.all([
                    studentService.getStudentById(parseInt(studentId)),
                    leccionService.getAllLecciones(),
                    therapistService.getAllTherapists("", 1, 999), 
                    therapySessionService.getSessionsByStudent(parseInt(studentId))
                ]);
                setStudent(studentData);
                setLecciones(leccionesData);
                setTherapists(therapistsResponse.data); 
                setEvents(sessionsData.map(sessionToEvent));
            } catch (error) {
                console.error("Error al cargar los datos de la página:", error);
                alert("No se pudieron cargar los datos necesarios para la página.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    const handleSelectChange = (name: string, value: string | null) => {
        if (name === 'leccionId') setLeccionId(value || '');
        if (name === 'therapistId') setTherapistId(value || '');
    };

    const handleEditFormSelectChange = (name: string, value: string | null) => {
        setEditFormData(prev => ({...prev, [name]: value || ''}));
    };

    const handleCreateSessions = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || selectedDays.length === 0 || !leccionId || !therapistId) {
            alert("Por favor, completa todos los campos."); return;
        }
        const sessionData = { studentId: parseInt(studentId), therapistId: parseInt(therapistId), leccionId: parseInt(leccionId), daysOfWeek: selectedDays, startTime, duration, weeksToSchedule };
        try {
            await therapySessionService.createRecurringSessions(sessionData);
            alert("¡Horario creado exitosamente!");
            const sessionsData = await therapySessionService.getSessionsByStudent(parseInt(studentId));
            setEvents(sessionsData.map(sessionToEvent));
            setSelectedDays([]); setLeccionId(''); setTherapistId('');
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.error || "No se pudo crear el horario."}`);
        }
    };
    
    const handleDayToggle = (day: string) => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

    const handleEventClick = async (clickInfo: any) => {
        if (!studentId) return;
        const sessionId = parseInt(clickInfo.event.id);
        try {
            const sessions = await therapySessionService.getSessionsByStudent(parseInt(studentId));
            const session = sessions.find((s: TherapySession) => s.id === sessionId);
            if (session) {
                const durationInMinutes = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000;
                setSelectedSession({ ...session, duration: durationInMinutes });
                setIsManageModalOpen(true);
            }
        } catch (error) {
            console.error("Error al obtener datos de la sesión:", error);
        }
    };
    
    const openEditModal = () => {
        if (!selectedSession) return;
        const localStartTime = new Date(selectedSession.startTime).toLocaleString("sv-SE", { timeZone: "America/Tegucigalpa" }).replace(" ", "T").substring(0, 16);
        setEditFormData({
            leccionId: String(selectedSession.leccionId),
            startTime: localStartTime,
            duration: selectedSession.duration || 45,
        });
        setIsManageModalOpen(false);
        setIsEditModalOpen(true);
    };

    const handleUpdateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession || !studentId) return;
        const dataToUpdate = {
            leccionId: parseInt(editFormData.leccionId),
            startTime: new Date(editFormData.startTime).toISOString(),
            duration: editFormData.duration
        };
        try {
            await therapySessionService.updateSession(parseInt(studentId), selectedSession.id, dataToUpdate);
            alert("Sesión actualizada correctamente.");
            const sessionsData = await therapySessionService.getSessionsByStudent(parseInt(studentId));
            setEvents(sessionsData.map(sessionToEvent));
            closeEditModal();
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.error || "No se pudo actualizar la sesión."}`);
        }
    };
    
    const handleDeleteSession = async () => {
        if (!selectedSession || !studentId) return;
        if (window.confirm('¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.')) {
            try {
                await therapySessionService.deleteSession(parseInt(studentId), selectedSession.id);
                setEvents(prev => prev.filter(event => event.id !== String(selectedSession.id)));
                closeManageModal();
            } catch (error) {
                alert("No se pudo eliminar la sesión.");
            }
        }
    };
    
    const closeManageModal = () => { setIsManageModalOpen(false); setSelectedSession(null); };
    const closeEditModal = () => { setIsEditModalOpen(false); setSelectedSession(null); };

    const father = student?.guardians?.find((g: any) => g.parentesco === 'Padre');
    const studentAge = student ? calculateAge(student.dateOfBirth) : null;
    const admissionDate = student ? new Date(student.anoIngreso).toLocaleDateString() : null;
    const leccionOptions = lecciones.map(l => ({ value: String(l.id), label: l.title }));
    const therapistOptions = therapists.map(t => ({ value: String(t.id), label: t.fullName }));

    if (isLoading) {
        return <div className="text-center p-10">Cargando datos del horario...</div>;
    }

    return (
        <>
            {student && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestionando Horario para: {student.fullName}</h2>
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div><h3 className="font-semibold text-gray-600">Terapeuta Asignado</h3><p>{student.therapist?.fullName || 'No especificado'}</p></div>
                        <div><h3 className="font-semibold text-gray-600">Edad</h3><p>{studentAge !== null ? `${studentAge} años` : 'N/A'}</p></div>
                        <div><h3 className="font-semibold text-gray-400">Género</h3><p>{student?.genero || 'No asignado'}</p></div>
                        <div><h3 className="font-semibold text-gray-600">Padre de Familia</h3><p>{father?.fullName || 'No especificado'}</p></div>
                        <div><h3 className="font-semibold text-gray-600">Fecha de Ingreso</h3><p>{admissionDate || 'N/A'}</p></div>
                    </div>
                    <div className=" p-2"></div>
                </div>
            )}

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Añadir Horario Recurrente</h3>
                    <form onSubmit={handleCreateSessions} className="space-y-4"> 
                        <div>
                            <Label>Días de la semana</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {dayOptions.map(day => ( <button type="button" key={day} onClick={() => handleDayToggle(day)} className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{day.substring(0, 3)}</button>))}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="leccionId">Lección</Label>
                            <Select 
                                instanceId="leccion-select" 
                                inputId="leccionId" 
                                value={leccionOptions.find(o => o.value === leccionId) || null}
                                onChange={(option) => handleSelectChange('leccionId', option?.value || null)}
                                required 
                                options={leccionOptions} 
                                placeholder="-- Selecciona Lección --" 
                            />
                        </div>
                        <div>
                            <Label htmlFor="therapistId">Terapeuta</Label>
                            <Select 
                                instanceId="therapist-select"
                                inputId="therapistId"
                                value={therapistOptions.find(o => o.value === therapistId) || null}
                                onChange={(option) => handleSelectChange('therapistId', option?.value || null)}
                                required 
                                options={therapistOptions} 
                                placeholder="-- Asignar Terapeuta --" 
                            />
                        </div>
                        <div><Label htmlFor="startTime">Hora de Inicio</Label><Input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label htmlFor="duration">Duración (min)</Label><Input id="duration" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} required /></div>
                            <div><Label htmlFor="weeksToSchedule">Semanas</Label><Input id="weeksToSchedule" type="number" value={weeksToSchedule} onChange={e => setWeeksToSchedule(parseInt(e.target.value))} required /></div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Guardar Horario</button>
                    </form>
                </div>
                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-lg shadow-md">
                    <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="timeGridWeek" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }} events={events} eventClick={handleEventClick} eventClassNames={'cursor-pointer'} allDaySlot={false} locale='es'/>
                </div>
            </div>

            <Modal isOpen={isManageModalOpen} onRequestClose={closeManageModal} style={modalStyles} contentLabel="Gestionar Sesión">
                {selectedSession && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Gestionar Sesión</h3>
                        <p><span className="font-semibold">Lección:</span> {selectedSession.leccion.title}</p>
                        <p><span className="font-semibold">Hora:</span> {new Date(selectedSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <div className="flex justify-end gap-3 pt-3">
                            <button onClick={openEditModal} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 flex items-center gap-2"><FaEdit /> Editar</button>
                            <button onClick={handleDeleteSession} className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 flex items-center gap-2"><FaTrash /> Eliminar</button>
                            <button onClick={closeManageModal} className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400">Cancelar</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isEditModalOpen} onRequestClose={closeEditModal} style={modalStyles} contentLabel="Editar Sesión">
                <form onSubmit={handleUpdateSession} className="space-y-4">
                    <h3 className="text-xl font-bold">Editar Sesión</h3>
                    <div>
                        <Label htmlFor="edit-leccionId">Lección</Label>
                        <Select
                            instanceId="edit-leccionId-select" 
                            inputId="edit-leccionId" 
                            value={leccionOptions.find(o => o.value === editFormData.leccionId) || null} 
                            onChange={option => handleEditFormSelectChange('leccionId', option?.value || null)}
                            options={leccionOptions}
                        />
                    </div>
                    <div><Label htmlFor="edit-startTime">Nueva Fecha y Hora</Label><Input id="edit-startTime" type="datetime-local" value={editFormData.startTime} onChange={e => setEditFormData({...editFormData, startTime: e.target.value})} /></div>
                    <div><Label htmlFor="edit-duration">Duración (minutos)</Label><Input id="edit-duration" type="number" value={editFormData.duration} onChange={e => setEditFormData({...editFormData, duration: parseInt(e.target.value)})} /></div>
                    <div className="flex justify-end gap-3 pt-3">
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Guardar Cambios</button>
                        <button type="button" onClick={closeEditModal} className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400">Cancelar</button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default ScheduleCalendarPage;