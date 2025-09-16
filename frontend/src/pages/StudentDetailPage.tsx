// frontend/src/pages/StudentDetailPage.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import studentService from "../services/studentService";
import therapySessionService from "../services/therapySessionService";
import reportService from "../services/reportService";
import { FaCalendarAlt, FaFileAlt, FaPrint, FaPencilAlt, FaEye, FaFilePdf, FaFileWord, FaPlus } from "react-icons/fa";
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
  const [exportSize, setExportSize] = useState<'A4' | 'OFICIO'>('A4'); // Tamaño de exportación para PDF/DOCX
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

  // Descarga un reporte como PDF o DOCX usando la API con auth y abre/descarga
  const handleDownloadReport = async (reportId: number, format: 'pdf' | 'docx') => {
    try {
      const resp = await reportService.downloadReport(reportId, format, exportSize);
      const blob = new Blob([resp.data], { type: resp.headers['content-type'] || (format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') });
      const url = window.URL.createObjectURL(blob);

      // Try to extract filename from Content-Disposition
      const cd = resp.headers['content-disposition'] as string | undefined;
      let filename = `reporte-${reportId}.${format}`;
      if (cd) {
        const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
        const name = decodeURIComponent(match?.[1] || match?.[2] || '');
        if (name) filename = name;
      }

      // Descargar siempre (evita errores del visor del navegador)
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo descargar el reporte.';
      alert(msg);
      console.error('Descarga de reporte falló:', e);
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
                <button className="min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
                  <FaPencilAlt /> Editar
                </button>
              </Link>
              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
              >
                <FaFileAlt /> Ver Ficha Completa
              </button>
              <button
                onClick={handlePrint}
                className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
              >
                <FaPrint /> Imprimir Matricula
              </button>
              <Link to={`/students/${studentId}/guardians/new`}>
                <button
                  className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
                >
                  <FaPlus /> Nuevo Padre/Tutor
                </button>
              </Link>
            </div>
          </div>
          
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
        </div>
        

        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Historial de Sesiones
          </h3>
          <div className="overflow-hidden rounded-xl bg-white shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">
                    Fecha
                  </th>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Historial de Reportes</h3>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-gray-600">Tamaño:</label>
              <select value={exportSize} onChange={(e) => setExportSize(e.target.value as 'A4' | 'OFICIO')} className="border rounded px-2 py-1">
                <option value="A4">A4</option>
                <option value="OFICIO">Oficio</option>
              </select>
            </div>
          </div>
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
                      <div className="flex gap-4 items-center">
                        <Link to={`/reports/view/${report.id}`} title="Ver Reporte" className="flex items-center gap-1 text-blue-600 hover:underline">
                          <FaEye /> Ver
                        </Link>
                        <Link to={`/reports/edit/${report.id}`} title="Editar Reporte" className="flex items-center gap-1 text-green-600 hover:underline">
                          <FaPencilAlt /> Editar
                        </Link>
                        <button
                          onClick={() => handleDownloadReport(report.id, 'pdf')}
                          title="Exportar PDF"
                          className="flex items-center gap-1 text-red-600 hover:underline"
                        >
                          <FaFilePdf /> PDF
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report.id, 'docx')}
                          title="Exportar Word"
                          className="flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <FaFileWord /> DOCX
                        </button>
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
          <h3 className="text-2xl font-bold text-gray-800">Próximas Sesiones</h3>
          <Link to={`/students/${student.id}/schedule`}>
            <button className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-m">
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

      {/* Modal removido; ahora se usa AddGuardionPage */}

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onRequestClose={() => setIsDetailModalOpen(false)}
        student={student}
      />
    </>
  );
}

export default StudentDetailPage;
