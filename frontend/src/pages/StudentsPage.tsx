// frontend/src/pages/StudentsPage.tsx
// frontend/src/pages/StudentsPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import studentService from "../services/studentService";
import Badge from "../components/ui/Badge"; // ¡Importamos nuestro nuevo Badge!
import { FaUserCircle } from "react-icons/fa"; // Un ícono de usuario como placeholder
import { FaPencilAlt, FaTrash, FaCalendarPlus } from "react-icons/fa";

interface Student {
  id: number;
  fullName: string;
  diagnosis: string | null;
  supportLevel: string | null;
}

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAllStudents();
        setStudents(data);
      } catch (err) {
        setError("No se pudo cargar la lista de estudiantes.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleDelete = async (studentId: number) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres desactivar a este estudiante?"
      )
    ) {
      try {
        await studentService.deleteStudent(studentId);
        setStudents(students.filter((student) => student.id !== studentId));
      } catch (err) {
        setError("No se pudo desactivar el estudiante.");
      }
    }
  };

  if (loading) return <p>Cargando estudiantes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Estudiantes
        </h2>
        <Link to="/students/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Añadir Estudiante
          </button>
        </Link>
      </div>

      {/* Contenedor principal de la tabla, adaptado de tu código */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            {/* Cabecera de la tabla */}
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Nombre
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Diagnóstico
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Nivel de Apoyo
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Acciones
                </th>
              </tr>
            </thead>

            {/* Cuerpo de la tabla */}
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {/* Usamos un ícono genérico ya que no tenemos imágenes de estudiantes */}
                        <FaUserCircle size={40} />
                      </div>
                      <div>
                        <Link
                          to={`/students/${student.id}`}
                          className="block font-medium text-gray-800 hover:underline"
                        >
                          {student.fullName}
                        </Link>
                        <span className="block text-gray-500 text-xs">
                          ID: {student.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {student.diagnosis || "N/A"}
                  </td>
                  <td className="px-5 py-4">
                    {/* Usamos nuestro componente Badge para el nivel de apoyo */}
                    <Badge color={student.supportLevel ? "info" : "warning"}>
                      {student.supportLevel || "No asignado"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4 items-center">
                      <Link
                        to={`/students/edit/${student.id}`}
                        title="Editar Estudiante"
                      >
                        <FaPencilAlt className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id)}
                        title="Desactivar Estudiante"
                      >
                        <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />
                      </button>
                      <Link
                        to={`/students/${student.id}/assign-plan`}
                        title="Asignar Plan Terapéutico"
                      >
                        <FaCalendarPlus className="text-green-500 hover:text-green-700 cursor-pointer" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentsPage;
