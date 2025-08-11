// frontend/src/pages/StudentDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import studentService from '../services/studentService';
import { FaPencilAlt, FaTrash, FaPlus, FaCalendarCheck } from 'react-icons/fa';
import Badge from '../components/ui/Badge';

function StudentDetailPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        try {
          const data = await studentService.getStudentById(parseInt(id, 10));
          setStudent(data);
        } catch (err) {
          setError('No se pudo cargar la información del estudiante.');
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [id]);

  // Aquí iría la lógica para eliminar planes (handleDeletePlan),
  // que podemos añadir de nuevo si es necesario.

  if (loading) return <p>Cargando perfil del estudiante...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!student) return <p>No se encontró al estudiante.</p>;

  return (
    <div className="space-y-8">
      {/* --- SECCIÓN DE INFORMACIÓN GENERAL --- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil de: {student.fullName}</h2>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-600">Diagnóstico</h3>
            <p>{student.diagnosis || 'No especificado'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-600">Nivel de Apoyo</h3>
            <Badge color={student.supportLevel ? 'info' : 'warning'}>
              {student.supportLevel || 'No asignado'}
            </Badge>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE PLANES TERAPÉUTICOS --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Planes Terapéuticos Asignados</h3>
          <Link to={`/students/${student.id}/assign-plan`}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                  <FaPlus /> Asignar Plan
              </button>
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Terapia</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Día</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Hora</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {student.therapyPlans.map((plan: any) => (
                <tr key={plan.id}>
                  <td className="px-5 py-4 font-medium text-gray-800">{plan.leccion.title}</td>
                  <td className="px-5 py-4 text-gray-500">{plan.dayOfWeek}</td>
                  <td className="px-5 py-4 text-gray-500">{plan.time}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4 items-center">
                      <Link to={`/students/${student.id}/plans/${plan.id}/edit`} title="Editar Plan"><FaPencilAlt className="text-blue-500 hover:text-blue-700" /></Link>
                      <button title="Eliminar Plan"><FaTrash className="text-red-500 hover:text-red-700" /></button>
                      <Link to={`/students/${student.id}/plans/${plan.id}/log-session`} title="Registrar Sesión"><FaCalendarCheck className="text-green-500 hover:text-green-700" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SECCIÓN DE HISTORIAL DE SESIONES --- */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Sesiones Registradas</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Fecha</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Asistencia</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {student.sessionLogs.map((log: any) => (
                <tr key={log.id}>
                  <td className="px-5 py-4 text-gray-500">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4"><Badge color={log.attendance === 'Presente' ? 'success' : 'error'}>{log.attendance}</Badge></td>
                  <td className="px-5 py-4 text-gray-500">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailPage;