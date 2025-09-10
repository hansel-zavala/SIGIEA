// frontend/src/pages/TherapistProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import therapistService, { type TherapistProfile } from '../services/therapistService';
import { FaUserMd, FaEdit, FaUserGraduate } from 'react-icons/fa';


const InfoField = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500 font-semibold">{label}</p>
    <p className="text-lg text-gray-800">{value || 'No especificado'}</p>
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
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
            <button className="min-w-[220px] py-3 px-4 text-white font-bold rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
              <FaEdit />
              <span>Editar Terapeuta</span>
            </button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-4 pt-2">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Nombre Completo" value={therapist.fullName} />
            <InfoField label="Cargo / Puesto" value={therapist.specialty} />
            <InfoField label="Número de Identidad" value={therapist.identityNumber} />
            <InfoField label="Número de Teléfono" value={therapist.phone} />
            <InfoField label="Correo Electrónico" value={therapist.email} />
            <InfoField label="Fecha de Nacimiento" value={formatDate(therapist.dateOfBirth)} />
            <InfoField label="Lugar de Nacimiento" value={therapist.lugarNacimiento} />
            <InfoField label="Dirección de Domicilio" value={therapist.direccion} />
        </div>
      </div>


      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Estudiantes Asignados</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre del Estudiante</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">Jornada</th>
               
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {therapist.assignedStudents && therapist.assignedStudents.length > 0 ? (
                therapist.assignedStudents.map(student => (
                  <tr key={student.id}>
                    <td className="px-5 py-4 font-medium text-gray-800">{student.fullName}</td>
                    <td className="px-5 py-4 text-gray-600">{student.jornada}</td>
                    <td className="px-5 py-4 text-end">
                      <Link 
                        to={`/students/${student.id}`} 
                        className="inline-flex items-center  gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 shadow-md"
                      >
                        <FaUserGraduate />
                        Ver Perfil del Estudiante
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