// frontend/src/pages/StudentDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentService from '../services/studentService';
import therapySessionService from '../services/therapySessionService';
import { FaCalendarAlt, FaFileAlt, FaPrint } from 'react-icons/fa'; // ✅ Icono añadido
import Badge from '../components/ui/Badge';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { EventInput } from '@fullcalendar/core';
import Modal from 'react-modal';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import StudentDetailModal from './StudentDetailModal';

// ... (El resto del código inicial se mantiene igual) ...
interface Leccion { id: number; title: string; }
interface TherapySession { id: number; startTime: string; endTime: string; leccion: Leccion; leccionId: number; status: string; notes?: string; behavior?: string; progress?: string; }
const modalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '500px', borderRadius: '8px', padding: '25px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 10 }};
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

function StudentDetailPage() {
    const [student, setStudent] = useState<any>(null);
    const [sessions, setSessions] = useState<TherapySession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id: studentId } = useParams<{ id: string }>();
    const [currentPage, setCurrentPage] = useState(1);
    const [sessionsPerPage] = useState(5);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [sessionToLog, setSessionToLog] = useState<TherapySession | null>(null);
    const [logFormData, setLogFormData] = useState({ status: 'Completada', notes: '', behavior: '', progress: '' });

    useEffect(() => {
        if (studentId) {
            Promise.all([
                studentService.getStudentById(parseInt(studentId)),
                therapySessionService.getSessionsByStudent(parseInt(studentId))
            ]).then(([studentData, sessionsData]) => {
                setStudent(studentData);
                setSessions(sessionsData);
            }).catch(() => setError('No se pudo cargar la información del estudiante.'))
              .finally(() => setLoading(false));
        }
    }, [studentId]);
    
    // ✅ PASO 2.1: Función para manejar la impresión
    const handlePrint = () => {
        if (studentId) {
            window.open(`/students/${studentId}/print`, '_blank');
        }
    };

    // ... (El resto de las funciones: handleEventClick, handleLogSubmit, etc. se mantienen igual) ...
     const handleEventClick = (clickInfo: any) => {
        const sessionId = parseInt(clickInfo.event.id);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setSessionToLog(session);
            
            // ✅ LA CORRECCIÓN ESTÁ AQUÍ
            // Si la sesión está 'Programada', el estado por defecto del formulario será 'Completada'.
            // Si ya tiene otro estado (ej: ya fue completada antes), se mantiene ese estado.
            const initialStatus = session.status === 'Programada' ? 'Completada' : session.status;

            setLogFormData({
                status: initialStatus,
                notes: session.notes || '',
                behavior: session.behavior || '',
                progress: session.progress || '',
            });
            setIsLogModalOpen(true);
        }
    };

    const handleLogFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setLogFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionToLog || !studentId) return;
        try {
            // 1. Guardamos el registro en la base de datos (esto no cambia)
            await therapySessionService.updateSession(parseInt(studentId), sessionToLog.id, logFormData);
            
            // 2. ✅ ¡EL CAMBIO CLAVE! Le pedimos al servidor la lista FRESCA de sesiones
            const updatedSessions = await therapySessionService.getSessionsByStudent(parseInt(studentId));
            
            // 3. Actualizamos la "memoria" de la página con los nuevos datos
            setSessions(updatedSessions);

            // 4. Cerramos el modal
            closeLogModal();
        } catch (error) {
            alert("Error al guardar el registro.");
        }
    };
    
    const closeLogModal = () => setIsLogModalOpen(false);

    

    const calendarEvents = sessions
        .filter(s => s.status === 'Programada') // Solo mostrar sesiones programadas en el calendario
        .map(s => ({ id: String(s.id), title: s.leccion.title, start: s.startTime, end: s.endTime }));

    const sessionHistory = sessions
        .filter(s => s.status !== 'Programada') // El historial son las sesiones ya registradas
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // Ordenar por fecha descendente

        const indexOfLastSession = currentPage * sessionsPerPage;
    const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
    const currentSessions = sessionHistory.slice(indexOfFirstSession, indexOfLastSession);

    const onPageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    const father = student?.guardians?.find((g: any) => g.parentesco === 'Padre');
    const studentAge = student ? calculateAge(student.dateOfBirth) : null;
    const admissionDate = student ? new Date(student.anoIngreso).toLocaleDateString() : null;

    if (loading) return <p>Cargando perfil...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <div className="space-y-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Perfil de: {student?.fullName}</h2>
                        {/* ✅ PASO 2.2: Grupo de botones */}
                        <div className="flex gap-2">
                           <button 
                                onClick={() => setIsDetailModalOpen(true)}
                                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm flex items-center gap-2"
                            >
                                <FaFileAlt /> Ver Ficha Completa
                            </button>
                             <button 
                                onClick={handlePrint}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow-sm flex items-center gap-2"
                            >
                                <FaPrint /> Imprimir Ficha
                            </button>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div><h3 className="font-semibold text-gray-400">Terapeuta Asignado</h3><p>{student?.therapist?.fullName || 'No especificado'}</p></div>
                        <div><h3 className="font-semibold text-gray-400">Edad</h3><p>{studentAge !== null ? `${studentAge} años` : 'N/A'}</p></div>
                        <div><h3 className="font-semibold text-gray-400">Género</h3><p>{student?.genero || 'No asignado'}</p></div>
                        <div><h3 className="font-semibold text-gray-400">Padre de Familia</h3><p>{father?.fullName || 'No especificado'}</p></div>
                        <div><h3 className="font-semibold text-gray-400">Fecha de Ingreso</h3><p>{admissionDate || 'N/A'}</p></div>
                    </div>
                </div>

                {/* --- El resto del componente se mantiene igual --- */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Sesiones</h3>
                    <div className="overflow-hidden rounded-xl bg-white shadow-md">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50"><tr className="text-left"><th className="px-5 py-3 font-medium text-gray-500">Fecha</th><th className="px-5 py-3 font-medium text-gray-500">Lección</th><th className="px-5 py-3 font-medium text-gray-500">Estado</th><th className="px-5 py-3 font-medium text-gray-500">Acciones</th></tr></thead>
                            <tbody>
                                {currentSessions.map(session => (
                                    <tr key={session.id}>
                                        <td className="px-5 py-4">{new Date(session.startTime).toLocaleDateString()}</td>
                                        <td className="px-5 py-4">{session.leccion.title}</td>
                                        <td className="px-5 py-4"><Badge color={session.status === 'Completada' ? 'success' : (session.status === 'Cancelada' ? 'warning' : 'error')}>{session.status}</Badge></td>
                                        <td className="px-5 py-4"><button onClick={() => handleEventClick({ event: { id: String(session.id) }})} className="text-blue-600 hover:underline">Ver/Editar</button></td>
                                    </tr>
                                ))}
                                {sessionHistory.length === 0 && (<tr><td colSpan={4} className="text-center p-8 text-gray-500">No hay registros en el historial.</td></tr>)}
                            </tbody>
                        </table>
                        <Pagination 
                            itemsPerPage={sessionsPerPage}
                            totalItems={sessionHistory.length}
                            currentPage={currentPage}
                            onPageChange={onPageChange}
                        />
                    </div>
                </div>
                <div className="p-1"></div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-800">Próximas Sesiones</h3><Link to={`/students/${student.id}/schedule`}><button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"><FaCalendarAlt /> Gestionar Horario</button></Link></div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <FullCalendar plugins={[timeGridPlugin]} initialView="timeGridWeek" headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }} events={calendarEvents} allDaySlot={false} locale='es' slotMinTime="07:00:00" slotMaxTime="18:00:00" height="auto" eventClick={handleEventClick} eventClassNames={'cursor-pointer'}/>
                </div>
            </div>

            <Modal isOpen={isLogModalOpen} onRequestClose={closeLogModal} style={modalStyles} contentLabel="Registrar Sesión">
                {sessionToLog && (
                    <form onSubmit={handleLogSubmit} className="space-y-4">
                        <h3 className="text-xl font-bold">Registrar Sesión</h3>
                        <div>
                            <p><strong>Lección:</strong> {sessionToLog.leccion.title}</p>
                            <p><strong>Fecha:</strong> {new Date(sessionToLog.startTime).toLocaleString()}</p>
                        </div>
                        <div>
                            <Label htmlFor="status">Estado de la Asistencia</Label>
                            <Select name="status" value={logFormData.status} onChange={handleLogFormChange} options={[{value: 'Completada', label: 'Completada'}, {value: 'Ausente', label: 'Ausente'}, {value: 'Cancelada', label: 'Cancelada'}]} />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notas Clínicas</Label>
                            <textarea name="notes" value={logFormData.notes} onChange={handleLogFormChange} rows={4} className="w-full p-2 border rounded mt-1"></textarea>
                        </div>
                        <div>
                            <Label htmlFor="behavior">Observaciones de Comportamiento</Label>
                            <textarea name="behavior" value={logFormData.behavior} onChange={handleLogFormChange} rows={3} className="w-full p-2 border rounded mt-1"></textarea>
                        </div>
                        <div>
                            <Label htmlFor="progress">Progreso</Label>
                            <textarea name="progress" value={logFormData.progress} onChange={handleLogFormChange} rows={3} className="w-full p-2 border rounded mt-1"></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-3">
                            <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Guardar Registro</button>
                            <button type="button" onClick={closeLogModal} className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400">Cancelar</button>
                        </div>
                    </form>
                )}
            </Modal>
            
            <StudentDetailModal 
                isOpen={isDetailModalOpen}
                onRequestClose={() => setIsDetailModalOpen(false)}
                student={student}
            />
        </>
    );
}

export default StudentDetailPage;