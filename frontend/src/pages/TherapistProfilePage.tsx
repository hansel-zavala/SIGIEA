// frontend/src/pages/TherapistProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import therapistService, { type TherapistProfile } from '../services/therapistService';
import { FaUserMd, FaEdit, FaUserGraduate, FaPhone, FaEnvelope, FaIdCard} from 'react-icons/fa';


const InfoField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined | null }) => (
  <div className="flex items-start gap-3">
    <div className="text-blue-500 mt-1">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
      <p className="text-md text-gray-800">{value || 'No especificado'}</p>
    </div>
  </div>
);

function TherapistProfilePage() {
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      therapistService.getTherapistById(Number(id))
        .then(data => {
          setTherapist({ ...data, assignedStudents: data.assignedStudents || [] });
        })
        .catch(() => {
          setError('No se pudo cargar el perfil del terapeuta.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!therapist) return <p>No se encontró el terapeuta.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <div className="flex justify-between items-center pb-6 border-b">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200">
            <FaUserMd size={50} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{therapist.fullName}</h2>
            <p className="text-lg text-gray-600">{therapist.specialty}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to={`/therapists/edit/${therapist.id}`}>
            <button className="py-2 px-5 text-white font-bold rounded-lg bg-yellow-500 hover:bg-yellow-600 transition-all flex items-center gap-2 shadow">
              <FaEdit />
              <span>Editar Perfil</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField icon={<FaIdCard />} label="No. de Identidad" value={therapist.identityNumber} />
        <InfoField icon={<FaEnvelope />} label="Correo Electrónico" value={therapist.email} />
        <InfoField icon={<FaPhone />} label="Teléfono" value={therapist.phone} />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Estudiantes Asignados</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre del Estudiante</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Jornada</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {therapist.assignedStudents && therapist.assignedStudents.length > 0 ? (
                therapist.assignedStudents.map(student => (
                  <tr key={student.id}>
                    <td className="px-5 py-4 font-medium text-gray-800">{student.fullName}</td>
                    <td className="px-5 py-4 text-gray-600">{student.jornada}</td>
                    <td className="px-5 py-4">
                      <Link to={`/students/${student.id}`} className="text-blue-600 hover:underline flex items-center gap-2">
                        <FaUserGraduate />
                        Ver Perfil
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-500">
                    Este terapeuta no tiene estudiantes asignados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TherapistProfilePage;