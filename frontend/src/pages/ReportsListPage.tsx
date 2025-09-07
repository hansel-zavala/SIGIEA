// frontend/src/pages/ReportsListPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reportService from '../services/reportService';
import { FaUserCircle, FaFileMedicalAlt } from 'react-icons/fa';

interface Student {
  id: number;
  fullName: string;
  therapist: { fullName: string } | null;
}

function ReportsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    reportService.getStudentsForReporting()
      .then(data => setStudents(data))
      .catch(() => setError('No se pudo cargar la lista de estudiantes.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Generar Reporte de Estudiante</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre del Estudiante</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Terapeuta Asignado</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400"><FaUserCircle size={40} /></div>
                    <div>
                      <span className="block font-medium text-gray-800">{student.fullName}</span>
                      <span className="block text-gray-500 text-xs">ID: {student.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{student.therapist?.fullName || 'No asignado'}</td>
                <td className="px-5 py-4">
                  <Link to={`/reports/new/${student.id}`}>
                    <button className="py-2 px-4 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center gap-2">
                      <FaFileMedicalAlt />
                      <span>Generar Reporte</span>
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsListPage;