// frontend/src/pages/TherapistsPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import therapistService from '../services/therapistService.js';
import type { TherapistProfile } from '../services/therapistService.js';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { FaUserMd, FaPencilAlt, FaTrash, FaPlus, FaUndo } from 'react-icons/fa';
import Badge from '../components/ui/Badge.js';

function TherapistsPage() {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('active');

  const fetchTherapists = () => {
      setLoading(true);
      therapistService.getAllTherapists(searchTerm, currentPage, itemsPerPage, statusFilter)
          .then(response => {
              setTherapists(response.data);
              setTotalItems(response.total);
          })
          .catch(() => setError('No se pudo cargar la lista de personal.'))
          .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timerId = setTimeout(fetchTherapists, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, currentPage, itemsPerPage, statusFilter])

  const handleDelete = async (therapistId: number) => {
    if (window.confirm('¿Seguro que quieres desactivar al terapeuta?')) {
      try {
        await therapistService.deleteTherapist(therapistId);
        fetchTherapists(); // Recargamos la lista
      } catch (err) {
        setError('No se pudo desactivar al terapeuta.');
      }
    }
  };

  const handleReactivate = async (therapistId: number) => {
    if (window.confirm('¿Seguro que quieres reactivar a este miembro del personal?')) {
      try {
        await therapistService.reactivateTherapist(therapistId);
        fetchTherapists(); // Recargamos la lista
      } catch (err: any) {
        alert(err.response?.data?.error || 'No se pudo reactivar al miembro del personal.');
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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Terapeutas</h2>
        <div className="flex-grow max-w-md">
            <Input
                type="text"
                placeholder="Buscar por nombre..."
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

        <Link to="/therapists/new">
          <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
            <FaPlus className="text-xl" />
              <span className="text-lg">Crear Nuevo Terapeuta</span>
          </button>
        </Link>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mt-1">Estos botones son para filtrar la lista de terapeuta por estado.</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => handleFilterChange('active')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'active' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Activos</button>
        <button onClick={() => handleFilterChange('inactive')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'inactive' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Inactivos</button>
        <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'all' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Todos</button>
      </div>

      <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-xs text-gray-500 mt-1">Hacer click en la foto o nombre del terapeuta para ver perfil. </p>
        <p className="text-xs text-gray-500 mt-1">ACCIONES: El lápiz es para editar, el bote es para eliminar.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className=" bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Email</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Especialidad</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Estado</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {therapists.length > 0 ? (
              therapists.map((therapist) => (
                <tr key={therapist.id}>
                  <td className="px-5 py-4">
                    <Link to={`/therapists/${therapist.id}`} className="flex items-center gap-3 group">
                    <div className="text-gray-400 group-hover:text-violet-500">
                        <FaUserMd size={40} />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 group-hover:underline group-hover:text-violet-600">
                        {therapist.fullName}
                      </span>
                      <span className="block text-gray-500 text-xs">ID de Perfil: {therapist.id}</span>
                    </div>
                  </Link>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{therapist.email}</td>
                  <td className="px-5 py-4 text-gray-600">{therapist.specialty}</td>
                  <td className="px-5 py-4">
                    <Badge color={therapist.isActive ? "success" : "error"}>{therapist.isActive ? "Activo" : "Inactivo"}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4">
                      <Link to={`/therapists/edit/${therapist.id}`} title="Editar">
                        <FaPencilAlt className="text-blue-500 hover:text-blue-700" />
                      </Link>
                      {therapist.isActive ? (
                        <button onClick={() => handleDelete(therapist.id)} title="Desactivar">
                          <FaTrash className="text-red-500 hover:text-red-700" />
                        </button>
                      ) : (
                        <button onClick={() => handleReactivate(therapist.id)} title="Reactivar">
                          <FaUndo className="text-green-500 hover:text-green-700" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">
                  No se encontró terapeuta.
                </td>
              </tr>
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
  );
}
export default TherapistsPage;