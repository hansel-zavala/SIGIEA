// frontend/src/pages/StudentsPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import studentService from "../services/studentService";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input"; // ✅ Importamos el Input
import { FaUserCircle, FaPencilAlt, FaTrash, FaCalendarPlus } from "react-icons/fa";

interface Student {
  id: number;
  fullName: string;
  diagnosis: string | null;
  supportLevel: string | null;
  // Añadimos la propiedad therapist para que TypeScript la reconozca
  therapist: { fullName: string } | null;
}

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ✅ PASO 3.1: Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ PASO 3.2: Modificamos useEffect para que reaccione a los cambios en la búsqueda
  useEffect(() => {
    // Usamos un temporizador (debounce) para no hacer una llamada a la API en cada tecla presionada
    const timerId = setTimeout(() => {
      setLoading(true);
      studentService.getAllStudents(searchTerm)
        .then(data => {
          setStudents(data);
        })
        .catch(() => {
          setError("No se pudo cargar la lista de estudiantes.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    // Limpiamos el temporizador si el componente se desmonta o el término de búsqueda cambia
    return () => clearTimeout(timerId);
  }, [searchTerm]); // Este efecto se ejecutará cada vez que `searchTerm` cambie

  const handleDelete = async (studentId: number) => {
    if (window.confirm("¿Estás seguro de que quieres desactivar a este estudiante?")) {
      try {
        await studentService.deleteStudent(studentId);
        setStudents(students.filter((student) => student.id !== studentId));
      } catch (err) {
        setError("No se pudo desactivar el estudiante.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Estudiantes
        </h2>
        
        {/* ✅ PASO 3.3: Añadimos el campo de búsqueda */}
        <div className="bg-white flex-grow max-w-md  py-2 px-2 rounded">
            <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <Link to="/matricula">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Añadir Estudiante
          </button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-lg">
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
      </div>
    </div>
  );
}

export default StudentsPage;