// frontend/src/pages/GuardianDetailPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import guardianService, { type GuardianProfile, type TherapySession } from '../services/guardianService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge'; // Importamos el componente Badge
import { FaUserEdit, FaBaby, FaClipboardList } from 'react-icons/fa';

function GuardianDetailPage() {
    const [guardian, setGuardian] = useState<GuardianProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            setLoading(true);
            guardianService.getGuardianById(Number(id))
                .then(setGuardian)
                .catch(() => setError('No se pudo cargar el perfil del guardián.'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    // Función para dar formato legible a la fecha y hora
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('es-HN', {
            dateStyle: 'long',
            timeStyle: 'short',
        });
    };
    
    // Función para asignar un color al badge según el estado
    const getStatusColor = (status: TherapySession['status']) => {
        switch (status) {
            case 'Completada': return 'success';
            case 'Cancelada': return 'error';
            case 'Ausente': return 'warning';
            default: return 'info';
        }
    };

    if (loading) return <div className="text-center p-8">Cargando perfil...</div>;
    if (error) return <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>;
    if (!guardian) return <p>No se encontró el guardián.</p>;

    const studentName = `${guardian.student.nombres} ${guardian.student.apellidos}`;
    
    // Filtramos las sesiones para mostrar solo las que tienen un estado final
    const loggedSessions = guardian.student.therapySessions.filter(
        session => session.status !== 'Programada'
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">
                Perfil de {guardian.nombres} y Progreso de {studentName}
            </h1>

            {/* SECCIÓN 1: DATOS DEL GUARDIÁN (Sin cambios) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4"><FaUserEdit /> Datos del Guardián</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><Label>Nombres</Label><Input value={guardian.nombres} readOnly /></div>
                    <div><Label>Apellidos</Label><Input value={guardian.apellidos} readOnly /></div>
                    <div><Label>DNI</Label><Input value={guardian.numeroIdentidad} readOnly /></div>
                    <div><Label>Teléfono</Label><Input value={guardian.telefono} readOnly /></div>
                    <div><Label>Parentesco</Label><Input value={guardian.parentesco.replace('_', ' ')} readOnly /></div>
                    <div className="md:col-span-2"><Label>Dirección de Emergencia</Label><Input value={guardian.direccionEmergencia || 'No especificada'} readOnly /></div>
                </div>
                <div className="text-right mt-6">
                    <Link to={`/guardians/edit/${guardian.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Editar Guardián
                    </Link>
                </div>
            </div>

            {/* SECCIÓN 2: DATOS DEL ESTUDIANTE (Sin cambios) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4"><FaBaby /> Información del Estudiante Asociado</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                    <p><strong>Nombre:</strong> {studentName}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {new Date(guardian.student.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Terapeuta:</strong> {guardian.student.therapist ? `${guardian.student.therapist.nombres} ${guardian.student.therapist.apellidos}` : 'No asignado'}</p>
                </div>
            </div>

            {/* SECCIÓN 3: HISTORIAL DE SESIONES DE TERAPIA */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-3 mb-4"><FaClipboardList /> Historial de Sesiones de Terapia</h2>
                <div className="space-y-4">
                    {loggedSessions.length > 0 ? (
                        loggedSessions.map(session => (
                            <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-lg font-bold text-violet-700">Lección: {session.leccion.title}</p>
                                        <p className="text-sm text-gray-500">Fecha: {formatDateTime(session.startTime)}</p>
                                    </div>
                                    <Badge color={getStatusColor(session.status)}>{session.status}</Badge>
                                </div>
                                <div className="space-y-2 text-gray-800 bg-gray-50 p-3 rounded-md">
                                    <div>
                                        <p className="font-semibold">Notas Clínicas:</p>
                                        <p className="text-sm whitespace-pre-wrap">{session.notes || 'No se registraron notas.'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Observaciones de Comportamiento:</p>
                                        <p className="text-sm whitespace-pre-wrap">{session.behavior || 'No se registraron observaciones.'}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Progreso:</p>
                                        <p className="text-sm whitespace-pre-wrap">{session.progress || 'No se registró progreso.'}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No hay sesiones registradas para este estudiante.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GuardianDetailPage;