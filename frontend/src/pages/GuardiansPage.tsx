// frontend/src/pages/GuardiansPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import guardianService from '../services/guardianService';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { FaUserCircle, FaPencilAlt, FaTrash } from 'react-icons/fa';

interface Guardian {
  id: number;
  nombres: string;
  apellidos: string;
  fullName: string;
  telefono: string;
  numeroIdentidad: string;
  parentesco: string;
  student: {
    fullName: string;
  }
}

function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchGuardians = () => {
        setLoading(true);
        guardianService.getAllGuardians(searchTerm, currentPage, itemsPerPage)
            .then(response => {
                setGuardians(response.data);
                setTotalItems(response.total);
            })
            .catch(() => {
                setError('No se pudo cargar la lista de guardianes.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const timerId = setTimeout(fetchGuardians, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, currentPage, itemsPerPage]);

  const handleDelete = async (guardianId: number) => {
    if (window.confirm('¿Seguro que quieres desactivar a este guardián?')) {
      try {
        await guardianService.deleteGuardian(guardianId);
        setGuardians(guardians.filter(g => g.id !== guardianId));
        setTotalItems(prev => prev - 1);
      } catch (err) {
        setError('No se pudo desactivar al guardián.');
      }
    }
  };

  const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de los Padres</h2>
        <div className="flex-grow">
            <Input
                type="text"
                placeholder="Buscar por nombre, identidad o estudiante..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
            />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre del Guardián</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">No. de Identidad</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Parentesco</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Estudiante Asociado</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Teléfono</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr><td colSpan={4} className="text-center p-8 text-gray-500">Cargando...</td></tr>
            ) : guardians.length > 0 ? (
                guardians.map((guardian) => (
                  <tr key={guardian.id}>
                    <td className="px-5 py-4">
                      <Link to={`/guardians/${guardian.id}`} className="flex items-center gap-3 group">
                        <div className="text-gray-400 group-hover:text-violet-500">
                          <FaUserCircle size={40} />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 group-hover:underline group-hover:text-violet-600">
                            {guardian.fullName}
                          </span>
                          <span className="block text-gray-500 text-xs">ID: {guardian.id}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{guardian.numeroIdentidad}</td>
                    <td className="px-5 py-4 text-gray-500">{guardian.parentesco.replace('_', ' ')}</td>
                    <td className="px-5 py-4 text-gray-500">{guardian.student.fullName}</td>
                    <td className="px-5 py-4 text-gray-500">{guardian.telefono}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                        <Link to={`/guardians/edit/${guardian.id}`} title="Editar Guardián">
                          <FaPencilAlt className="text-blue-500 hover:text-blue-700" />
                        </Link>
                        <button onClick={() => handleDelete(guardian.id)} title="Desactivar Guardián">
                          <FaTrash className="text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
                <tr><td colSpan={4} className="text-center p-8 text-gray-500">No se encontraron guardianes.</td></tr>
            )}
          </tbody>
        </table>
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

export default GuardiansPage;