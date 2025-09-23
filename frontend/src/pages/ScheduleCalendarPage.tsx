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
import { useToast } from '../context/ToastContext';

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
    const { showToast } = useToast();
    const [student, setStudent] = useState<any>(null);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [lecciones, setLecciones] = useState<Leccion[]>([]);
    const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState('07:00');
    const [duration, setDuration] = useState(45);
    const [leccionId, setLeccionId] = useState('');
    const [therapistId, setTherapistId] = useState('');
    const [weeksToSchedule, setWeeksToSchedule] = useState(4);
    const [therapistSessions, setTherapistSessions] = useState<TherapySession[]>([]);
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

                if (studentData.therapistId) {
                    setTherapistId(String(studentData.therapistId));
                }

            } catch (error) {
                console.error("Error al cargar los datos de la página:", error);
                alert("No se pudieron cargar los datos necesarios para la página.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    const calculateSuggestedStartTime = (sessions: TherapySession[], selectedDays: string[], therapist: TherapistProfile | undefined) => {
        if (!therapist || selectedDays.length === 0) return '07:00';

        const dayMap: { [key: string]: string } = {
            "Lunes": "Monday",
            "Martes": "Tuesday",
            "Miércoles": "Wednesday",
            "Jueves": "Thursday",
            "Viernes": "Friday",
            "Sábado": "Saturday",
            "Domingo": "Sunday"
        };

        let maxEndTime = '07:00';

        for (const day of selectedDays) {
            const dayName = dayMap[day];
            if (!dayName) continue;

            const daySessions = sessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate.toLocaleDateString('en-US', { weekday: 'long' }) === dayName;
            });

            if (daySessions.length > 0) {
                const latestEnd = daySessions.reduce((latest, session) => {
                    const endTime = new Date(session.endTime).toTimeString().substring(0, 5);
                    return endTime > latest ? endTime : latest;
                }, '00:00');
                if (latestEnd > maxEndTime) maxEndTime = latestEnd;
            }
        }

        return maxEndTime;
    };


    const updateSuggestedStartTime = async () => {
        if (!therapistId || !studentId) return;
        try {
            const therapist = await therapistService.getTherapistById(parseInt(therapistId));
            const studentSessions = await therapySessionService.getSessionsByStudent(parseInt(studentId));
            setTherapistSessions(studentSessions); // Use student sessions for now
            const suggested = calculateSuggestedStartTime(studentSessions, selectedDays, therapist);
            setStartTime(suggested);
        } catch (error) {
            console.error("Error al obtener sesiones del terapeuta:", error);
        }
    };

    useEffect(() => {
        updateSuggestedStartTime();
    }, [therapistId, selectedDays, therapists, duration]);

    const handleSelectChange = (name: string, value: string | null) => {
        if (name === 'leccionId') setLeccionId(value || '');
        //if (name === 'therapistId') setTherapistId(value || '');
    };

    const handleEditFormSelectChange = (name: string, value: string | null) => {
        setEditFormData(prev => ({...prev, [name]: value || ''}));
    };

    const validateSchedule = (startTime: string, duration: number, selectedDays: string[], therapist: TherapistProfile | undefined, sessions: TherapySession[]): { valid: boolean; message: string } => {
        if (!therapist) return { valid: false, message: "Terapeuta no encontrado." };

        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(start.getTime() + duration * 60000);
        const startStr = start.toTimeString().substring(0, 5);
        const endStr = end.toTimeString().substring(0, 5);

        // Check work hours
        if (therapist.workStartTime && therapist.workEndTime) {
            const workStart = new Date(`1970-01-01T${therapist.workStartTime}`);
            const workEnd = new Date(`1970-01-01T${therapist.workEndTime}`);
            if (start < workStart || end > workEnd) {
                return { valid: false, message: `El horario debe estar entre ${therapist.workStartTime} y ${therapist.workEndTime}.` };
            }
        }

        // Check overlaps
        const dayMap: { [key: string]: string } = {
            "Lunes": "Monday", "Martes": "Tuesday", "Miércoles": "Wednesday",
            "Jueves": "Thursday", "Viernes": "Friday", "Sábado": "Saturday", "Domingo": "Sunday"
        };

        for (const day of selectedDays) {
            const dayName = dayMap[day];
            if (!dayName) continue;

            const daySessions = sessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate.toLocaleDateString('en-US', { weekday: 'long' }) === dayName;
            });

            for (const session of daySessions) {
                const sessionStart = new Date(session.startTime).toTimeString().substring(0, 5);
                const sessionEnd = new Date(session.endTime).toTimeString().substring(0, 5);
                if ((startStr < sessionEnd && endStr > sessionStart)) {
                    return { valid: false, message: `Conflicto en ${day}: Ya hay una sesión de ${sessionStart} a ${sessionEnd}. Sugerencia: Iniciar a las ${sessionEnd}.` };
                }
            }
        }

        return { valid: true, message: "" };
    };

    const handleCreateSessions = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || selectedDays.length === 0 || !leccionId || !therapistId) {
            showToast({ message: "Por favor, completa todos los campos.", type: "error" });
            return;
        }

        const assignedTherapist = therapists.find(t => t.id === parseInt(therapistId));
        if (assignedTherapist && assignedTherapist.workDays) {
            for (const day of selectedDays) {
                if (!assignedTherapist.workDays.includes(day)) {
                    showToast({ message: `Error: El terapeuta no trabaja los días ${day}. Por favor, selecciona un día válido.`, type: "error" });
                    return;
                }
            }
        }

        // Validation
        const validation = validateSchedule(startTime, duration, selectedDays, assignedTherapist, therapistSessions);
        if (!validation.valid) {
            showToast({ message: validation.message, type: "error" });
            return;
        }

        const sessionData = { studentId: parseInt(studentId), therapistId: parseInt(therapistId), leccionId: parseInt(leccionId), daysOfWeek: selectedDays, startTime, duration, weeksToSchedule };
        try {
            await therapySessionService.createRecurringSessions(sessionData);
            showToast({ message: "¡Horario creado exitosamente!", type: "success" });
            const sessionsData = await therapySessionService.getSessionsByStudent(parseInt(studentId));
            setEvents(sessionsData.map(sessionToEvent));
            setSelectedDays([]); setLeccionId('');
            // Update suggested time after creation
            updateSuggestedStartTime();
        } catch (error: any) {
            showToast({ message: `Error: ${error.response?.data?.error || "No se pudo crear el horario."}`, type: "error" });
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
            showToast({ message: "Sesión actualizada correctamente.", type: "success" });
            const sessionsData = await therapySessionService.getSessionsByStudent(parseInt(studentId));
            setEvents(sessionsData.map(sessionToEvent));
            closeEditModal();
        } catch (error: any) {
            showToast({ message: `Error: ${error.response?.data?.error || "No se pudo actualizar la sesión."}`, type: "error" });
        }
    };
    
    const handleDeleteSession = async () => {
        if (!selectedSession || !studentId) return;
        if (window.confirm('¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.')) {
            try {
                await therapySessionService.deleteSession(parseInt(studentId), selectedSession.id);
                setEvents(prev => prev.filter(event => event.id !== String(selectedSession.id)));
                showToast({ message: "Sesión eliminada correctamente.", type: "success" });
                closeManageModal();
            } catch (error) {
                showToast({ message: "No se pudo eliminar la sesión.", type: "error" });
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
                    <div className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-6 py-3 font-medium text-gray-600">Terapeuta Asignado</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Edad</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Género</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Padre de Familia</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Fecha de Ingreso</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td className="px-6 py-4 text-gray-700">{student?.therapist?.fullName || "No especificado"}</td>
                  <td className="px-6 py-4 text-gray-700">{studentAge !== null ? `${studentAge} años` : "N/A"}</td>
                  <td className="px-6 py-4 text-gray-700">{student?.genero || "No asignado"}</td>
                  <td className="px-6 py-4 text-gray-700">{(father?.fullName || student?.guardians?.[0]?.fullName) || "No especificado"}</td>
                  <td className="px-6 py-4 text-gray-700">{admissionDate || "N/A"}</td>
                </tr>
              </tbody>
            </table>
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
                                {dayOptions.map(day => ( <button type="button" key={day} onClick={() => handleDayToggle(day)} className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedDays.includes(day) ? 'bg-violet-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{day.substring(0, 3)}</button>))}
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
                                placeholder="Selecciona una Lección" 
                            />
                        </div>
                        <div>
                            <Label htmlFor="therapistId">Terapeuta</Label>
                            <Select 
                                instanceId="therapist-select"
                                inputId="therapistId"
                                value={therapistOptions.find(o => o.value === therapistId) || null}
                                onChange={() => {}}
                                required 
                                options={therapistOptions} 
                                placeholder="Selecciona un Terapeuta" 
                                isDisabled={true} 
                            />
                        </div>
                        <div>
                            <Label htmlFor="startTime">Hora de Inicio</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">Sugerido: {startTime} (basado en sesiones previas)</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="duration">Duración (min)</Label>
                                <Input 
                                    id="duration" 
                                    type="number" 
                                    value={duration} 
                                    onChange={e => setDuration(parseInt(e.target.value))} 
                                    required 
                                />
                            </div>
                            <div>
                                <Label htmlFor="weeksToSchedule">Semanas</Label>
                                <Input 
                                    id="weeksToSchedule" 
                                    type="number" 
                                    value={weeksToSchedule} 
                                    onChange={e => setWeeksToSchedule(parseInt(e.target.value))} 
                                    required 
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-violet-500 hover:from-violet-500 hover:to-violet-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">Guardar Horario</button>
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
                        <p><span className="font-semibold">Fecha:</span> {new Date(selectedSession.startTime).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Hora:</span> {new Date(selectedSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <div className="flex justify-center gap-3 pt-3">
                            <button 
                                onClick={openEditModal} 
                                className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 flex items-center gap-2">
                                    <FaEdit /> Editar
                            </button>
                            <button 
                                onClick={handleDeleteSession} 
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 flex items-center gap-2">
                                    <FaTrash /> Eliminar
                            </button>
                            <button 
                                onClick={closeManageModal} 
                                className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 flex items-center gap-2">
                                    Cancelar
                            </button>
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
                    <div>
                        <Label htmlFor="edit-startTime">Nueva Fecha y Hora</Label>
                        <Input 
                            id="edit-startTime" 
                            type="datetime-local" 
                            value={editFormData.startTime} 
                            onChange={e => setEditFormData({...editFormData, startTime: e.target.value})} />
                    </div>
                    <div>
                        <Label htmlFor="edit-duration">Duración (minutos)</Label>
                        <Input 
                            id="edit-duration" 
                            type="number" 
                            value={editFormData.duration} 
                            onChange={e => setEditFormData({...editFormData, duration: parseInt(e.target.value)})} />
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                                Guardar Cambios
                        </button>
                        <button 
                            type="button" 
                            onClick={closeEditModal} 
                            className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400">
                                Cancelar
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default ScheduleCalendarPage;