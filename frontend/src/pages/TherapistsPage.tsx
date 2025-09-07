// frontend/src/pages/TherapistsPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import therapistService from '../services/therapistService.js';
import type { TherapistProfile } from '../services/therapistService.js';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { FaUserMd, FaPencilAlt, FaTrash, FaPlus } from 'react-icons/fa';

function TherapistsPage() {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchTherapists = () => {
        setLoading(true);
        therapistService.getAllTherapists(searchTerm, currentPage, itemsPerPage)
            .then(response => {
                setTherapists(response.data);
                setTotalItems(response.total);
            })
            .catch(() => setError('No se pudo cargar la lista de terapeutas.'))
            .finally(() => setLoading(false));
    };

    const timerId = setTimeout(fetchTherapists, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, currentPage, itemsPerPage]);

  const handleDelete = async (therapistId: number) => {
    if (window.confirm('¿Seguro que quieres desactivar a este terapeuta?')) {
      try {
        await therapistService.deleteTherapist(therapistId);
        setTherapists(therapists.filter(t => t.id !== therapistId));
        setTotalItems(prev => prev - 1);
      } catch (err) {
        setError('No se pudo desactivar al terapeuta.');
      }
    }
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
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
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
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className=" bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Contacto</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Especialidad</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {therapists.map((therapist) => (
              <tr key={therapist.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400"><FaUserMd size={40} /></div>
                    <div>
                      <span className="block font-medium text-gray-800">{therapist.fullName}</span>
                      <span className="block text-gray-500 text-xs">ID de Perfil: {therapist.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500">{therapist.email}</td>
                <td className="px-5 py-4 text-gray-500">{therapist.specialty || 'N/A'}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-4">
                    <Link to={`/therapists/edit/${therapist.id}`} title="Editar Terapeuta">
                      <FaPencilAlt className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                    </Link>
                    <button onClick={() => handleDelete(therapist.id)} title="Desactivar Terapeuta">
                      <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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