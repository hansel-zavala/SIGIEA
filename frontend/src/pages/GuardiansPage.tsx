// frontend/src/pages/GuardiansPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import guardianService from '../services/guardianService';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { FaUserCircle, FaPencilAlt, FaTrash, FaUndo } from 'react-icons/fa';
import Badge from '../components/ui/Badge';

interface Guardian {
  id: number;
  nombres: string;
  apellidos: string;
  fullName: string;
  telefono: string;
  numeroIdentidad: string;
  parentesco: string;
  isActive: boolean;
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
  const [statusFilter, setStatusFilter] = useState('active');

  const fetchGuardians = () => {
      setLoading(true);
      guardianService.getAllGuardians(searchTerm, currentPage, itemsPerPage, statusFilter)
          .then(response => {
              setGuardians(response.data);
              setTotalItems(response.total);
              setError("");
          })
          .catch(() => {
              setError('No se pudo cargar la lista de guardianes.');
          })
          .finally(() => {
              setLoading(false);
          });
  };

  useEffect(() => {
    const timerId = setTimeout(fetchGuardians, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, currentPage, itemsPerPage, statusFilter]);

  const handleDelete = async (guardianId: number) => {
    if (window.confirm('¿Seguro que quieres desactivar a este guardián?')) {
      try {
        await guardianService.deleteGuardian(guardianId);
        fetchGuardians();
      } catch (err) {
        setError('No se pudo desactivar al guardián.');
      }
    }
  };

  const handleReactivate = async (guardianId: number) => {
    if (window.confirm('¿Seguro que quieres reactivar a este guardián?')) {
      try {
        await guardianService.reactivateGuardian(guardianId);
        fetchGuardians(); 
      } catch (err: any) {
        alert(err.response?.data?.error || 'No se pudo reactivar al guardián.');
      }
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
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
                    const value = e.target.value;
                    const validCharsRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                    if (validCharsRegex.test(value)) {
                      setSearchTerm(value);
                      setCurrentPage(1);
                    }
                }}
            />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mt-1">Estos botones son para filtrar la lista de padres por estado.</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => handleFilterChange('active')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'active' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Activos</button>
        <button onClick={() => handleFilterChange('inactive')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'inactive' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Inactivos</button>
        <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'all' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Todos</button>
      </div>

      <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-xs text-gray-500 mt-1">Hacer click en la foto o nombre del Padre para ver perfil. </p>
        <p className="text-xs text-gray-500 mt-1">ACCIONES: El lápiz es para editar, el bote es para eliminar.</p>
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
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Estado</th>
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
                      <Badge color={guardian.isActive ? "success" : "error"}>{guardian.isActive ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                        <Link to={`/guardians/edit/${guardian.id}`} title="Editar Guardián">
                          <FaPencilAlt className="text-blue-500 hover:text-blue-700" />
                        </Link>
                        {guardian.isActive ? (
                          <button onClick={() => handleDelete(guardian.id)} title="Desactivar Guardián">
                            <FaTrash className="text-red-500 hover:text-red-700" />
                          </button>
                        ) : (
                          <button onClick={() => handleReactivate(guardian.id)} title="Reactivar Guardián">
                            <FaUndo className="text-green-500 hover:text-green-700" />
                          </button>
                        )}
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