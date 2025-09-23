import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import therapySessionService from '../services/therapySessionService';
import therapistService, { type TherapistProfile } from '../services/therapistService';
import studentService from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Label from './ui/Label';
import Select from './ui/Select';
import Badge from './ui/Badge';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

interface TherapySession {
  id: number;
  startTime: string;
  endTime: string;
  leccion: { id: number; title: string; };
  leccionId: number;
  status: string;
  notes?: string;
  behavior?: string;
  progress?: string;
  student?: { id: number; fullName: string; };
}

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    borderRadius: "8px",
    padding: "25px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 10 },
};
Modal.setAppElement("#root");

function TherapistSchedulePanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [sessionToLog, setSessionToLog] = useState<TherapySession | null>(null);
  const [logFormData, setLogFormData] = useState({
    status: "Completada",
    notes: "",
    behavior: "",
    progress: "",
  });

  useEffect(() => {
    if (user?.role === 'THERAPIST') {
      setSelectedTherapistId(String(user.id));
    } else {
      loadTherapists();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTherapistId) {
      loadSessions();
    }
  }, [selectedTherapistId]);

  const loadTherapists = async () => {
    try {
      const response = await therapistService.getAllTherapists('', 1, 1000);
      setTherapists(response.data);
    } catch (error) {
      console.error('Error loading therapists:', error);
    }
  };

  const loadSessions = async () => {
    try {
      // Fetch all students and filter by therapistId
      const allStudentsResponse = await studentService.getAllStudents('', 1, 10000);
      const assignedStudents = allStudentsResponse.data.filter((s: any) => String(s.therapist?.id) === selectedTherapistId);

      const allSessions: TherapySession[] = [];
      for (const student of assignedStudents) {
        const studentSessions = await therapySessionService.getSessionsByStudent(student.id);
        // Add student info
        studentSessions.forEach((s: TherapySession) => ((s as any).student = student));
        allSessions.push(...studentSessions);
      }
      const filteredSessions = allSessions.filter(s => s.status === 'Programada').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setSessions(filteredSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleRegisterClick = (session: TherapySession) => {
    setSessionToLog(session);
    // Determine initial status based on time
    const now = new Date();
    const sessionStart = new Date(session.startTime);
    const diffMinutes = (now.getTime() - sessionStart.getTime()) / (1000 * 60);
    const initialStatus = diffMinutes > 10 ? 'Ausente' : 'Completada';

    setLogFormData({
      status: initialStatus,
      notes: session.notes || "",
      behavior: session.behavior || "",
      progress: session.progress || "",
    });
    setIsLogModalOpen(true);
  };

  const handleLogSelectChange = (name: string, value: string | null) => {
    setLogFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

  const handleLogFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setLogFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToLog || !sessionToLog.student) return;
    try {
      await therapySessionService.updateSession(
        sessionToLog.student.id,
        sessionToLog.id,
        logFormData
      );
      showToast({ message: "Ya terminó dicha sesión.", type: "success" });
      loadSessions(); // Refresh
      closeLogModal();
    } catch (error) {
      showToast({ message: "Error al registrar la sesión.", type: "error" });
    }
  };

  const closeLogModal = () => setIsLogModalOpen(false);

  const therapistOptions = therapists.map(t => ({ value: String(t.id), label: t.fullName }));

  return (
    <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Horarios de Terapias</h3>
        <div className="flex gap-2">
          {user?.role === 'ADMIN' && (
            <Select
              instanceId="therapist-select"
              value={therapistOptions.find(o => o.value === selectedTherapistId) || null}
              onChange={(option) => setSelectedTherapistId(option?.value || '')}
              options={therapistOptions}
              placeholder="Seleccionar Terapeuta"
              className="w-70"
            />
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <FullCalendar
          plugins={[timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={sessions.map((s) => ({
            id: String(s.id),
            title: `${s.leccion.title} - ${s.student?.fullName}`,
            start: s.startTime,
            end: s.endTime,
          }))}
          allDaySlot={false}
          locale="es"
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          height="auto"
          eventClick={(clickInfo) => {
            const sessionId = parseInt(clickInfo.event.id);
            const session = sessions.find((s) => s.id === sessionId);
            if (session) {
              handleRegisterClick(session);
            }
          }}
          eventClassNames={"cursor-pointer"}
        />
      </div>

      <Modal
        isOpen={isLogModalOpen}
        onRequestClose={closeLogModal}
        style={modalStyles}
        contentLabel="Registrar Sesión"
      >
        {sessionToLog && (
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <h3 className="text-xl font-bold">Registrar Sesión</h3>
            <div>
              <p><strong>Estudiante:</strong> {sessionToLog.student?.fullName}</p>
              <p><strong>Lección:</strong> {sessionToLog.leccion.title}</p>
              <p><strong>Fecha:</strong> {new Date(sessionToLog.startTime).toLocaleString()}</p>
            </div>
            <div>
              <Label htmlFor="status">Estado de la Asistencia</Label>
              <Select
                instanceId="status-select"
                inputId="status"
                name="status"
                value={{ value: logFormData.status, label: logFormData.status }}
                onChange={(option) => handleLogSelectChange("status", option?.value || null)}
                options={[
                  { value: "Completada", label: "Completada" },
                  { value: "Ausente", label: "Ausente" },
                  { value: "Cancelada", label: "Cancelada" },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notas Clínicas</Label>
              <textarea
                name="notes"
                value={logFormData.notes}
                onChange={handleLogFormChange}
                rows={4}
                className="w-full p-2 border rounded mt-1"
              ></textarea>
            </div>
            <div>
              <Label htmlFor="behavior">Observaciones de Comportamiento</Label>
              <textarea
                name="behavior"
                value={logFormData.behavior}
                onChange={handleLogFormChange}
                rows={3}
                className="w-full p-2 border rounded mt-1"
              ></textarea>
            </div>
            <div>
              <Label htmlFor="progress">Progreso</Label>
              <textarea
                name="progress"
                value={logFormData.progress}
                onChange={handleLogFormChange}
                rows={3}
                className="w-full p-2 border rounded mt-1"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
              >
                Guardar Registro
              </button>
              <button
                type="button"
                onClick={closeLogModal}
                className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default TherapistSchedulePanel;