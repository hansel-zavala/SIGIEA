// frontend/src/pages/StudentsPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import studentService from "../services/studentService";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Pagination from "../components/ui/Pagination";
import { FaUserCircle, FaPencilAlt, FaTrash, FaCalendarPlus, FaPlus, FaUndo } from "react-icons/fa";

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

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('active');

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

  const handleDelete = async (studentId: number) => {
    if (window.confirm("¿Seguro que quieres desactivar a este estudiante?")) {
      try {
        await studentService.deleteStudent(studentId);
        fetchStudents();
      } catch (err) {
        setError("No se pudo desactivar el estudiante.");
      }
    }
  };
  
  const handlePageChange = (pageNumber: number) => {setCurrentPage(pageNumber);};

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleReactivate = async (studentId: number) => {
    if (window.confirm("¿Seguro que quieres reactivar a este estudiante?")) {
      try {
        await studentService.reactivateStudent(studentId);
        if (statusFilter === 'inactive') {
          setStatusFilter('active');
        } else {
          fetchStudents();
        }
      } catch (err) {
        setError("No se pudo reactivar al estudiante.");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Estudiantes
        </h2>
        
        <div className="flex-grow ">
            <Input
                type="text"
                placeholder="Buscar por nombre, apellido o terapeuta..."
                value={searchTerm}
                onChange={(e) => { 
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
            />
        </div>

        <Link to="/matricula">
          <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
            <FaPlus className="text-xl" />
            <span className="text-lg">Crear Nuevo Estudiante</span>
          </button>
        </Link>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mt-1">Estos botones son para filtrar la lista de estudiantes por estado.</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => handleFilterChange('active')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'active' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Activos</button>
        <button onClick={() => handleFilterChange('inactive')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'inactive' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Inactivos</button>
        <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'all' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Todos</button>
      </div>

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
          <div className="flex items-center gap-3">
            <Link to={`/students/${student.id}`} className="block font-medium text-violet-800 hover:underline">
              <div className="text-gray-400"><FaUserCircle size={40} /></div>
            </Link>
            <div>
              <Link to={`/students/${student.id}`} className="block font-medium text-violet-800 hover:underline">
                {student.fullName}
              </Link>
              <span className="block text-gray-500 text-xs">ID: {student.id}</span>
            </div>
          </div>
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
          <div className="flex gap-4 items-center">
            <Link to={`/students/edit/${student.id}`} title="Editar Estudiante">
              <FaPencilAlt className="text-blue-500 hover:text-blue-700 cursor-pointer" style={{ fontSize: '15px' }} />
            </Link>
            
            {student.isActive ? (
              <button onClick={() => handleDelete(student.id)} title="Desactivar Estudiante">
                <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" style={{ fontSize: '15px' }} />
              </button>
            ) : (
              <button onClick={() => handleReactivate(student.id)} title="Reactivar Estudiante">
                <FaUndo className="text-green-500 hover:text-green-700 cursor-pointer" style={{ fontSize: '15px' }} />
              </button>
            )}

            <Link to={`/students/${student.id}/schedule`} title="Asignar Horario">
              <FaCalendarPlus className="text-green-500 hover:text-green-700 cursor-pointer" style={{ fontSize: '15px' }} />
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
        <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default StudentsPage;