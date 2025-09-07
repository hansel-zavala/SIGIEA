// frontend/src/pages/StudentDetailPage.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import studentService from "../services/studentService";
import therapySessionService from "../services/therapySessionService";
import reportService from "../services/reportService";
import { FaCalendarAlt, FaFileAlt, FaPrint, FaPencilAlt, FaEye } from "react-icons/fa";
import Badge from "../components/ui/Badge";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import Modal from "react-modal";
import Label from "../components/ui/Label";
import Select from "../components/ui/Select";
import Pagination from "../components/ui/Pagination";
import StudentDetailModal from "./StudentDetailModal";

interface Leccion {
  id: number;
  title: string;
}
interface TherapySession {
  id: number;
  startTime: string;
  endTime: string;
  leccion: Leccion;
  leccionId: number;
  status: string;
  notes?: string;
  behavior?: string;
  progress?: string;
}

interface Report {
  id: number;
  reportDate: string;
  template: {
    title: string;
  };
  therapist: {
    name: string;
  };
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
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id: studentId } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionsPerPage] = useState(5);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sessionToLog, setSessionToLog] = useState<TherapySession | null>(null);
  const [logFormData, setLogFormData] = useState({
    status: "Completada",
    notes: "",
    behavior: "",
    progress: "",
  });

  useEffect(() => {
    if (studentId) {
      Promise.all([
        studentService.getStudentById(parseInt(studentId)),
        therapySessionService.getSessionsByStudent(parseInt(studentId)),
        reportService.getReportsByStudent(parseInt(studentId))
      ])
        .then(([studentData, sessionsData, reportsData]) => {
          setStudent(studentData);
          setSessions(sessionsData);
          setReports(reportsData);
        })
        .catch(() =>
          setError("No se pudo cargar la información del estudiante.")
        )
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  const handlePrint = () => {
    if (studentId) {
      window.open(`/students/${studentId}/print`, "_blank");
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const sessionId = parseInt(clickInfo.event.id);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSessionToLog(session);
      const initialStatus =
        session.status === "Programada" ? "Completada" : session.status;

      setLogFormData({
        status: initialStatus,
        notes: session.notes || "",
        behavior: session.behavior || "",
        progress: session.progress || "",
      });
      setIsLogModalOpen(true);
    }
  };

  const handleLogSelectChange = (name: string, value: string | null) => {
    setLogFormData((prev) => ({ ...prev, [name]: value || "" }));
  };

  const handleLogFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setLogFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToLog || !studentId) return;
    try {
      await therapySessionService.updateSession(
        parseInt(studentId),
        sessionToLog.id,
        logFormData
      );
      const updatedSessions = await therapySessionService.getSessionsByStudent(
        parseInt(studentId)
      );
      setSessions(updatedSessions);
      closeLogModal();
    } catch (error) {
      alert("Error al guardar el registro.");
    }
  };

  const closeLogModal = () => setIsLogModalOpen(false);

  const calendarEvents = sessions
    .filter((s) => s.status === "Programada")
    .map((s) => ({
      id: String(s.id),
      title: s.leccion.title,
      start: s.startTime,
      end: s.endTime,
    }));

  const sessionHistory = sessions
    .filter((s) => s.status !== "Programada")
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessionHistory.slice(
    indexOfFirstSession,
    indexOfLastSession
  );

  const onPageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  const father = student?.guardians?.find((g: any) => g.parentesco === "Padre");
  const studentAge = student ? calculateAge(student.dateOfBirth) : null;
  const admissionDate = student
    ? new Date(student.anoIngreso).toLocaleDateString()
    : null;

  const statusOptions = [
    { value: "Completada", label: "Completada" },
    { value: "Ausente", label: "Ausente" },
    { value: "Cancelada", label: "Cancelada" },
  ];

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Perfil de: {student?.fullName}
            </h2>
            <div className="flex gap-2">
              <Link to={`/students/edit/${studentId}`}>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 border border-yellow-600 rounded shadow-sm flex items-center gap-2">
                  <FaPencilAlt /> Editar
                </button>
              </Link>
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
            <div>
              <h3 className="font-semibold text-gray-400">
                Terapeuta Asignado
              </h3>
              <p>{student?.therapist?.fullName || "No especificado"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">Edad</h3>
              <p>{studentAge !== null ? `${studentAge} años` : "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">Género</h3>
              <p>{student?.genero || "No asignado"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">Padre de Familia</h3>
              <p>{father?.fullName || "No especificado"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-400">Fecha de Ingreso</h3>
              <p>{admissionDate || "N/A"}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Historial de Sesiones
          </h3>
          <div className="overflow-hidden rounded-xl bg-white shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Lección
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Estado
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-5 py-4">
                      {new Date(session.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">{session.leccion.title}</td>
                    <td className="px-5 py-4">
                      <Badge
                        color={
                          session.status === "Completada"
                            ? "success"
                            : session.status === "Cancelada"
                            ? "warning"
                            : "error"
                        }
                      >
                        {session.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() =>
                          handleEventClick({
                            event: { id: String(session.id) },
                          })
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Ver/Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {sessionHistory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                      No hay registros en el historial.
                    </td>
                  </tr>
                )}
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
         <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Historial de Reportes
          </h3>
          <div className="overflow-hidden rounded-xl bg-white shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">Fecha de Creación</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Tipo de Reporte</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Generado por</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-5 py-4">{new Date(report.reportDate).toLocaleDateString()}</td>
                    <td className="px-5 py-4">{report.template.title}</td>
                    <td className="px-5 py-4">{report.therapist.name}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                          <Link to={`/reports/view/${report.id}`} title="Ver Reporte" className="flex items-center gap-1 text-blue-600 hover:underline">
                              <FaEye /> Ver
                          </Link>
                          <Link to={`/reports/edit/${report.id}`} title="Editar Reporte" className="flex items-center gap-1 text-green-600 hover:underline">
                              <FaPencilAlt /> Editar
                          </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                      No hay reportes generados para este estudiante.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-1"></div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Próximas Sesiones</h3>
          <Link to={`/students/${student.id}/schedule`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
              <FaCalendarAlt /> Gestionar Horario
            </button>
          </Link>
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
            events={calendarEvents}
            allDaySlot={false}
            locale="es"
            slotMinTime="07:00:00"
            slotMaxTime="18:00:00"
            height="auto"
            eventClick={handleEventClick}
            eventClassNames={"cursor-pointer"}
          />
        </div>
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
              <p>
                <strong>Lección:</strong> {sessionToLog.leccion.title}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(sessionToLog.startTime).toLocaleString()}
              </p>
            </div>
            <div>
              <Label htmlFor="status">Estado de la Asistencia</Label>
              <Select
                instanceId="status-select"
                inputId="status"
                name="status"
                value={
                  statusOptions.find((o) => o.value === logFormData.status) ||
                  null
                }
                onChange={(option) =>
                  handleLogSelectChange("status", option?.value || null)
                }
                options={statusOptions}
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

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onRequestClose={() => setIsDetailModalOpen(false)}
        student={student}
      />
    </>
  );
}

export default StudentDetailPage;
