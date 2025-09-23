import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import studentService from '../services/studentService';
import therapistService from '../services/therapistService';
import therapySessionService from '../services/therapySessionService';
import reportService from '../services/reportService';
import eventService from '../services/eventService';
import { FaUser, FaUserMd, FaCalendarAlt, FaFileAlt, FaChartLine, FaClock, FaCheckCircle } from 'react-icons/fa';

type Student = {
  id: number;
  nombres: string;
  apellidos: string;
  dateOfBirth: string;
  jornada?: string;
  genero?: string;
  tipoSangre?: string;
  therapistId?: number;
};

type TherapistProfile = {
  id: number;
  nombres: string;
  apellidos: string;
  specialty: string;
  phone?: string | null;
  email: string;
};

type TherapySession = {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  leccion: { title: string };
};

type Report = {
  id: number;
  reportDate: string;
  template: { title: string };
  therapist: { name: string };
};

type Event = {
  id: number;
  title: string;
  description?: string;
  startDate: string;
};

function ParentStudentViewPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('User:', user);
      if (!user?.guardian) {
        console.log('No guardian');
        setLoading(false);
        return;
      }

      try {
        // Load students for this parent
        const studentsData = await studentService.getAllStudents();
        console.log('Students data:', studentsData);
        setStudents(studentsData.data);

        if (studentsData.data.length > 0) {
          const student = studentsData.data[0]; // Assume one student for simplicity
          console.log('Selected student:', student);
          setSelectedStudent(student);

          // Load therapist
          if (student.therapistId) {
            console.log('Loading therapist for id:', student.therapistId);
            const therapistData = await therapistService.getTherapistById(student.therapistId);
            console.log('Therapist data:', therapistData);
            setTherapist(therapistData);
          } else {
            console.log('No therapistId');
          }

          // Load sessions
          const sessionsData = await therapySessionService.getSessionsByStudent(student.id);
          console.log('Sessions data:', sessionsData);
          setSessions(sessionsData);

          // Load reports
          const reportsData = await reportService.getReportsByStudent(student.id);
          console.log('Reports data:', reportsData);
          setReports(reportsData);

          // Load events
          const eventsData = await eventService.getAllEvents();
          console.log('Events data:', eventsData);
          setEvents(eventsData);
        } else {
          console.log('No students found');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">Cargando información...</div>
      </div>
    );
  }

  if (user?.role !== 'PARENT') {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-500">Acceso denegado. Esta página es solo para padres.</div>
      </div>
    );
  }

  if (!user?.guardian) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">No se encontró información de guardián asociada a su cuenta.</div>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">No se encontraron estudiantes asociados a su cuenta de padre.</div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => new Date(s.startTime) > new Date()).slice(0, 3);
  const recentReports = reports.slice(0, 3);
  const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).slice(0, 3);
  const completedSessions = sessions
    .filter(s => s.status === 'Completada')
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Portal del Estudiante</h1>
        <p className="text-gray-600">Información y progreso de {selectedStudent.nombres} {selectedStudent.apellidos}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Student Profile Card */}
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-white/20 p-3">
              <FaUser size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{selectedStudent.nombres} {selectedStudent.apellidos}</h3>
              <p className="text-blue-100">
                {Math.floor((new Date().getTime() - new Date(selectedStudent.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} años
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Jornada:</strong> {selectedStudent.jornada}</p>
            <p><strong>Género:</strong> {selectedStudent.genero}</p>
            <p><strong>Tipo de Sangre:</strong> {selectedStudent.tipoSangre || 'No especificado'}</p>
          </div>
        </div>

        {/* Therapist Card */}
        {therapist && (
          <div className="rounded-xl bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-white/20 p-3">
                <FaUserMd size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Terapeuta</h3>
                <p className="text-green-100">{therapist.nombres} {therapist.apellidos}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Especialidad:</strong> {therapist.specialty}</p>
              <p><strong>Teléfono:</strong> {therapist.phone || 'No disponible'}</p>
              <p><strong>Email:</strong> {therapist.email}</p>
            </div>
          </div>
        )}

        {/* Attendance Card */}
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-white/20 p-3">
              <FaChartLine size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Asistencia</h3>
              <p className="text-orange-100">
                {sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'Completada').length / sessions.length) * 100) : 0}% de sesiones completadas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions */}
        <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <FaClock className="text-blue-500" />
            <h3 className="text-lg font-semibold">Próximas Sesiones</h3>
          </div>
          {upcomingSessions.length > 0 ? (
            <ul className="space-y-3">
              {upcomingSessions.map(session => (
                <li key={session.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="font-medium">{session.leccion.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.startTime).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    session.status === 'Programada' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'Completada' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay sesiones próximas programadas.</p>
          )}
        </div>

        {/* Recent Reports */}
        <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <FaFileAlt className="text-green-500" />
            <h3 className="text-lg font-semibold">Reportes Recientes</h3>
          </div>
          {recentReports.length > 0 ? (
            <ul className="space-y-3">
              {recentReports.map(report => (
                <li key={report.id} className="rounded-lg bg-gray-50 p-3">
                  <p className="font-medium">{report.template.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(report.reportDate).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-sm text-gray-500">Por: {report.therapist.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay reportes disponibles.</p>
          )}
        </div>

        {/* Completed Sessions */}
        <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <FaCheckCircle className="text-emerald-500" />
            <h3 className="text-lg font-semibold">Sesiones Completadas Recientes</h3>
          </div>
          {completedSessions.length > 0 ? (
            <ul className="space-y-3">
              {completedSessions.map(session => (
                <li key={session.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="font-medium">{session.leccion.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(session.endTime).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                    Completada
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay sesiones completadas recientemente.</p>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <FaCalendarAlt className="text-purple-500" />
          <h3 className="text-lg font-semibold">Eventos Próximos</h3>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(event.startDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay eventos próximos.</p>
        )}
      </div>
    </div>
  );
}

export default ParentStudentViewPage;