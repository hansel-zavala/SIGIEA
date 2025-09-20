// frontend/src/pages/ReportsListPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import reportService from '../services/reportService';
import { FaUserCircle, FaFileMedicalAlt } from 'react-icons/fa';
import Pagination from '../components/ui/Pagination';

interface Student {
  id: number;
  fullName: string;
  therapist: { id: number; fullName: string } | null;
}

const REPORTS_LIST_PAGE_SIZE_KEY = 'reports-list-page-size';

function ReportsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const stored = window.localStorage.getItem(REPORTS_LIST_PAGE_SIZE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  });

  useEffect(() => {
    reportService.getStudentsForReporting()
      .then(data => setStudents(data))
      .catch(() => setError('No se pudo cargar la lista de estudiantes.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && itemsPerPage > 0) {
      window.localStorage.setItem(REPORTS_LIST_PAGE_SIZE_KEY, String(itemsPerPage));
    }
  }, [itemsPerPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(students.length / Math.max(itemsPerPage, 1)));
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [students.length, itemsPerPage]);

  const currentStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return students.slice(start, end);
  }, [students, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (size: number) => {
    if (size <= 0) return;
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Generar Reporte de Estudiante</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-xs text-gray-500 mt-1">Hacer click en la foto o nombre del estudiante para ver perfil y editar el reporte. </p>
      </div>


      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre del Estudiante</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Terapeuta Asignado</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-gray-500">Cargando estudiantes...</td>
              </tr>
            ) : currentStudents.length > 0 ? currentStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-5 py-4">
                  <Link
                    to={`/students/${student.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="text-gray-400 group-hover:text-violet-500 transition-colors">
                      <FaUserCircle size={40} />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 group-hover:text-violet-600 group-hover:underline">
                        {student.fullName}
                      </span>
                    </div>
                  </Link>
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
            )) : (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                  {error
                    ? 'No se pudieron cargar los estudiantes para reportes.'
                    : students.length === 0
                      ? 'No hay estudiantes disponibles para reportes.'
                      : 'No hay resultados en esta página.'}
                </td>
              </tr>
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
    </div>
  );
}

export default ReportsListPage;
