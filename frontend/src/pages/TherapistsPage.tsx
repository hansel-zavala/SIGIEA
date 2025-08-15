// frontend/src/pages/TherapistsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import therapistService from '../services/therapistService.js';
import type { TherapistProfile } from '../services/therapistService.js';
import { FaUserMd, FaPencilAlt, FaTrash } from 'react-icons/fa';

function TherapistsPage() {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    therapistService.getAllTherapists()
      .then(data => setTherapists(data))
      .catch(() => setError('No se pudo cargar la lista de terapeutas.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (therapistId: number) => {
    if (window.confirm('¿Seguro que quieres desactivar a este terapeuta?')) {
      try {
        await therapistService.deleteTherapist(therapistId);
        setTherapists(therapists.filter(t => t.id !== therapistId));
      } catch (err) {
        setError('No se pudo desactivar al terapeuta.');
      }
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Terapeutas</h2>
        <Link to="/therapists/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Añadir Terapeuta
          </button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Contacto</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Especialidad</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
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
    </div>
  );
}
export default TherapistsPage;