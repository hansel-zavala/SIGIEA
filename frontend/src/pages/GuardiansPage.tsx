// frontend/src/pages/GuardiansPage.tsx
import { useState, useEffect } from 'react';
import guardianService from '../services/guardianService';
import { FaUserCircle } from 'react-icons/fa';

interface Guardian {
  id: number;
  fullName: string;
  telefono: string;
  direccionEmergencia: string | null;
  student: { // Objeto anidado del estudiante
    fullName: string;
  }
}

function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGuardians = async () => {
      try {
        const data = await guardianService.getAllGuardians();
        setGuardians(data);
      } catch (err) {
        setError('No se pudo cargar la lista de guardianes.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuardians();
  }, []);

  if (loading) return <p>Cargando guardianes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Guardianes</h2>
        {/* Aquí podría ir un botón para añadir guardianes si fuera necesario */}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre del Guardián</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Estudiante Asociado</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Teléfono</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guardians.map((guardian) => (
              <tr key={guardian.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400"><FaUserCircle size={40} /></div>
                    <div>
                      <span className="block font-medium text-gray-800">{guardian.fullName}</span>
                      <span className="block text-gray-500 text-xs">ID: {guardian.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500 font-medium">{guardian.student.fullName}</td>
                <td className="px-5 py-4 text-gray-500">{guardian.telefono}</td>
                <td className="px-5 py-4">
                  {/* Aquí irán los botones de Editar y Desactivar */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GuardiansPage;