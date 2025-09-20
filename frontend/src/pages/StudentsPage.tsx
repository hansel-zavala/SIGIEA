// frontend/src/pages/StudentsPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import studentService from "../services/studentService";
import Badge from "../components/ui/Badge";
import SearchInput from "../components/ui/SearchInput";
import Pagination from "../components/ui/Pagination";
import { FaUserCircle, FaPencilAlt, FaTrash, FaCalendarPlus, FaPlus, FaUndo, FaSearch } from "react-icons/fa";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { useToast } from '../context/ToastContext';
import ExportMenu from '../components/ExportMenu';
import { downloadBlob, inferFilenameFromResponse } from '../utils/downloadFile';
import { actionButtonStyles } from '../styles/actionButtonStyles';

interface Student {
  id: number;
  nombres: string;
  apellidos: string;
  fullName: string;
  therapist: { fullName: string } | null;
  age: number;
  jornada: string;
  guardianName: string;
  guardianPhone: string;
  isActive: boolean;
}

const STUDENTS_PAGE_SIZE_KEY = 'students-list-page-size';

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const stored = window.localStorage.getItem(STUDENTS_PAGE_SIZE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  });
  const [statusFilter, setStatusFilter] = useState('active');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"deactivate" | "reactivate" | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const fetchStudents = () => {
      setLoading(true);
      studentService.getAllStudents(searchTerm, currentPage, itemsPerPage, statusFilter)
          .then(response => {
              setStudents(response.data);
              setTotalItems(response.total);
              setError("");
          })
          .catch(() => setError("No se pudo cargar la lista de estudiantes."))
          .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timerId = setTimeout(fetchStudents, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, currentPage, itemsPerPage, statusFilter]);

  useEffect(() => {
    if (typeof window !== 'undefined' && itemsPerPage > 0) {
      window.localStorage.setItem(STUDENTS_PAGE_SIZE_KEY, String(itemsPerPage));
    }
  }, [itemsPerPage]);

  const handleDelete = async (studentId: number) => {
    try {
      await studentService.deleteStudent(studentId);
      showToast({ message: 'Se eliminó correctamente.', type: 'error' });
      fetchStudents();
    } catch (err) {
      setError("No se pudo desactivar el estudiante.");
    }
  };
  
  const handlePageChange = (pageNumber: number) => { setCurrentPage(pageNumber); };

  const handleItemsPerPageChange = (size: number) => {
    if (size <= 0) return;
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleReactivate = async (studentId: number) => {
    try {
      await studentService.reactivateStudent(studentId);
      if (statusFilter === 'inactive') {
        setStatusFilter('active');
      } else {
        fetchStudents();
      }
      showToast({ message: 'Se reactivó correctamente.' });
    } catch (err) {
      setError("No se pudo reactivar al estudiante.");
    }
  };

  const handleExportStudents = async ({ status, format }: { status: string; format: string }) => {
    try {
      setIsExporting(true);
      const response = await studentService.exportStudents(status, format);
      const filename = inferFilenameFromResponse(response, `estudiantes-${status}.csv`);
      downloadBlob(response.data, filename);
      showToast({ message: 'Exportación de estudiantes generada correctamente.' });
    } catch (err) {
      console.error('Error al exportar estudiantes', err);
      showToast({ message: 'No se pudo exportar la lista de estudiantes.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const openDeactivateDialog = (studentId: number) => {
    setSelectedStudentId(studentId);
    setConfirmAction("deactivate");
    setConfirmOpen(true);
  };

  const openReactivateDialog = (studentId: number) => {
    setSelectedStudentId(studentId);
    setConfirmAction("reactivate");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedStudentId || !confirmAction) return;
    if (confirmAction === "deactivate") await handleDelete(selectedStudentId);
    if (confirmAction === "reactivate") await handleReactivate(selectedStudentId);
    setConfirmOpen(false);
    setSelectedStudentId(null);
    setConfirmAction(null); 
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Gestión de Estudiantes</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="group relative flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow border border-gray-200">
              <FaSearch className="text-gray-400" size={16} />
                <SearchInput
                  type="text"
                  className="text-base"
                  placeholder="Buscar por nombre, apellido o terapeuta..."
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    const validCharsRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                    if (validCharsRegex.test(value)) {
                      setSearchTerm(value);
                      setCurrentPage(1);
                    }
                  }}
                />
                <span className="pointer-events-none absolute inset-x-4 bottom-[6px] h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-500 transition-transform duration-200 group-focus-within:scale-x-100" />
              </div>
            </div>


        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Link to="/matricula">
            <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
              <FaPlus className="text-xl" />
              <span className="text-lg">Crear Nuevo Estudiante</span>
            </button>
          </Link>
          <ExportMenu
            defaultStatus={statusFilter}
            onExport={handleExportStudents}
            statuses={[
              { value: 'all', label: 'Todos' },
              { value: 'active', label: 'Activos' },
              { value: 'inactive', label: 'Inactivos' },
            ]}
            triggerLabel={isExporting ? 'Exportando…' : 'Exportar'}
            disabled={isExporting}
          />
        </div>
      </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mt-1">Estos botones son para filtrar la lista de estudiantes por estado.</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => handleFilterChange('active')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'active' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Activos</button>
        <button onClick={() => handleFilterChange('inactive')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'inactive' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Inactivos</button>
        <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'all' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Todos</button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-xs text-gray-500 mt-1">Hacer click en la foto o nombre de estudiante para ver perfil. </p>
        <p className="text-xs text-gray-500 mt-1">ACCIONES: El lápiz es para editar, el bote es para eliminar, y el calendario es para agregar horarios.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Edad</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Terapeuta</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Tutor Principal</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Teléfono</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Jornada</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Estado</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
  {loading ? (
    <tr><td colSpan={7} className="text-center p-8 text-gray-500">Cargando...</td></tr>
  ) : students.length > 0 ? (
    students.map((student) => (
      <tr key={student.id}>
        <td className="px-5 py-4">
          <Link to={`/students/${student.id}`} className="flex items-center gap-3 group">
            <div className="text-gray-400 group-hover:text-violet-500">
              <FaUserCircle size={40} />
            </div>
            <div>
              <span className="block font-medium text-gray-800 group-hover:underline group-hover:text-violet-600">
                {student.fullName}
              </span>
              <span className="block text-gray-500 text-xs">ID: {student.id}</span>
            </div>
          </Link>
        </td>
        <td className="px-5 py-4 text-gray-500">{student.age} años</td>
        <td className="px-5 py-4 text-gray-500">{student.therapist?.fullName || "No asignado"}</td>
        <td className="px-5 py-4 text-gray-500">{student.guardianName}</td>
        <td className="px-5 py-4 text-gray-500">{student.guardianPhone}</td>
        <td className="px-5 py-4 text-gray-500">{student.jornada === 'Matutina' ? 'Matutina' : 'Vespertina'}</td>
        <td className="px-5 py-4">
          <Badge color={student.isActive ? "success" : "error"}>{student.isActive ? "Activo" : "Inactivo"}</Badge>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <Link
              to={`/students/edit/${student.id}`}
              title="Editar Estudiante"
              className={actionButtonStyles.edit}
            >
              <FaPencilAlt className="text-lg" />
            </Link>

            {student.isActive ? (
              <button
                onClick={() => openDeactivateDialog(student.id)}
                title="Desactivar Estudiante"
                className={actionButtonStyles.delete}
              >
                <FaTrash className="text-lg" />
              </button>
            ) : (
              <button
                onClick={() => openReactivateDialog(student.id)}
                title="Reactivar Estudiante"
                className={actionButtonStyles.reactivate}
              >
                <FaUndo className="text-lg" />
              </button>
            )}

            <Link
              to={`/students/${student.id}/schedule`}
              title="Asignar Horario"
              className={actionButtonStyles.schedule}
            >
              <FaCalendarPlus className="text-lg" />
            </Link>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr><td colSpan={7} className="text-center p-8 text-gray-500">No se encontraron estudiantes.</td></tr>
  )}
</tbody>
          </table>
        </div>
        {students.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={students.length}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
        />
        </div>
      )}
      </div>
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={confirmAction === 'deactivate' ? 'Desactivar estudiante' : 'Reactivar estudiante'}
        description={
          confirmAction === 'deactivate'
            ? '¿Estás seguro que deseas desactivar a este estudiante? Podrás reactivarlo más adelante.'
            : '¿Estás seguro que deseas reactivar a este estudiante?'
        }
        confirmText={confirmAction === 'deactivate' ? 'Desactivar' : 'Reactivar'}
        confirmButtonClassName={
          confirmAction === 'deactivate'
            ? 'min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md'
            : 'min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md'
        }
      />
    </div>
  );
}

export default StudentsPage;
