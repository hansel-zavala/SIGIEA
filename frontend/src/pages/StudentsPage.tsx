// frontend/src/pages/StudentsPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import studentService from "../services/studentService";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Pagination from "../components/ui/Pagination";
import { FaUserCircle, FaPencilAlt, FaTrash, FaCalendarPlus, FaPlus } from "react-icons/fa";

interface Student {
  id: number;
  nombres: string;
  apellidos: string;
  fullName: string;
  therapist: { fullName: string } | null;
}

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchStudents = () => {
        setLoading(true);
        studentService.getAllStudents(searchTerm, currentPage, itemsPerPage)
            .then(response => {
                setStudents(response.data);
                setTotalItems(response.total);
            })
            .catch(() => {
                setError("No se pudo cargar la lista de estudiantes.");
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    const timerId = setTimeout(fetchStudents, 500);
    return () => clearTimeout(timerId);

  }, [searchTerm, currentPage, itemsPerPage]);

  const handleDelete = async (studentId: number) => {
    if (window.confirm("¿Estás seguro de que quieres desactivar a este estudiante?")) {
      try {
        await studentService.deleteStudent(studentId);
        setStudents(students.filter((student) => student.id !== studentId));
        setTotalItems(prev => prev - 1);
      } catch (err) {
        setError("No se pudo desactivar el estudiante.");
      }
    }
  };
  
  const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Estudiantes
        </h2>
        
        <div className="flex-grow max-w-md">
            <Input
                type="text"
                placeholder="Buscar por nombre o apellido..."
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Terapeuta Asignado</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="text-center p-8 text-gray-500">Cargando...</td></tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400"><FaUserCircle size={40} /></div>
                        <div>
                          <Link to={`/students/${student.id}`} className="block font-medium text-gray-800 hover:underline">
                            {student.fullName}
                          </Link>
                          <span className="block text-gray-500 text-xs">ID: {student.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={student.therapist ? "info" : "warning"}>
                        {student.therapist?.fullName || "No asignado"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-4 items-center">
                        <Link to={`/students/edit/${student.id}`} title="Editar Estudiante">
                          <FaPencilAlt className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                        </Link>
                        <button onClick={() => handleDelete(student.id)} title="Desactivar Estudiante">
                          <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />
                        </button>
                        <Link to={`/students/${student.id}/schedule`} title="Asignar Horario">
                          <FaCalendarPlus className="text-green-500 hover:text-green-700 cursor-pointer" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="text-center p-8 text-gray-500">No se encontraron estudiantes.</td></tr>
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