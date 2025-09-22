import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import therapistService, { type TherapistProfile } from '../services/therapistService';
import guardianService from '../services/guardianService';
import { FaUserMd, FaUserCircle, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface GuardianProfile {
  id: number;
  fullName: string;
  nombres: string;
  apellidos: string;
  numeroIdentidad: string;
  telefono: string;
  parentesco: string;
  direccionEmergencia: string;
  students: {
    id: number;
    fullName?: string;
    nombres?: string;
    apellidos?: string;
    isActive?: boolean;
  }[];
}

const InfoField = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500 font-semibold">{label}</p>
    <p className="text-lg text-gray-800">{value || 'No especificado'}</p>
  </div>
);

function ProfilePage() {
  const { user } = useAuth();
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [guardian, setGuardian] = useState<GuardianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (user.role === 'THERAPIST' && user.therapistProfile?.id) {
      therapistService.getTherapistById(user.therapistProfile.id)
        .then(data => {
          setTherapist({ ...data, assignedStudents: data.assignedStudents || [] });
        })
        .catch(() => {
          setError('No se pudo cargar el perfil del terapeuta.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (user.role === 'PARENT' && user.guardian?.id) {
      guardianService.getGuardianById(user.guardian.id)
        .then(data => {
          const normalized = {
            ...data,
            students: Array.isArray(data?.students)
              ? data.students
              : (data?.student ? [data.student] : []),
          } as any;
          setGuardian(normalized);
        })
        .catch(() => {
          setError('No se pudo cargar el perfil del padre.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return <div>No se encontró información del usuario.</div>;
  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // For ADMIN or users without specific profiles
  if (user.role === 'ADMIN' || (!therapist && !guardian)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center pb-6 border-b">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center border-4 border-violet-200">
              <FaUserCircle size={50} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-lg text-gray-600">{user.role === 'ADMIN' ? 'Administrador' : user.role}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Nombre Completo" value={user.name} />
            <InfoField label="Rol" value={user.role === 'ADMIN' ? 'Administrador' : user.role} />
            {user.email && <InfoField label="Correo Electrónico" value={user.email} />}
            <InfoField label="ID de Usuario" value={user.id.toString()} />
          </div>
        </div>
      </div>
    );
  }

  // Therapist Profile
  if (therapist) {
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
            <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center border-4 border-violet-200">
              <FaUserMd size={50} className="text-violet-500" />
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
                <span>Editar Perfil</span>
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

        {therapist.assignedStudents && therapist.assignedStudents.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Estudiantes Asignados ({therapist.assignedStudents.length})</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre del Estudiante</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-left">Jornada</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-left">Género</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {therapist.assignedStudents.slice(0, 5).map(student => (
                      <tr key={student.id}>
                        <td className="px-5 py-4 font-medium text-gray-800">{student.fullName}</td>
                        <td className="px-5 py-4 text-gray-600">{student.jornada}</td>
                        <td className="px-5 py-4 text-gray-600">{student.genero}</td>
                        <td className="px-5 py-4 text-end pr-16">
                          <Link
                            to={`/students/${student.id}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 shadow-md"
                          >
                            Ver Perfil
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {therapist.assignedStudents.length > 5 && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center">
                  <Link to={`/therapists/${therapist.id}`} className="text-violet-600 hover:underline">
                    Ver todos los estudiantes asignados ({therapist.assignedStudents.length})
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Guardian Profile
  if (guardian) {
    const canViewStudents = user?.role === 'ADMIN' || user?.permissions?.['VIEW_STUDENTS'];

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center border-4 border-violet-200">
              <FaUserCircle size={80} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{guardian.fullName}</h2>
              <p className="text-md text-gray-500">{guardian.parentesco.replace('_', ' ')}</p>
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                {guardian.students && guardian.students.length > 0 ? (
                  guardian.students.map((s) => {
                    const name = s.fullName || `${s.nombres || ''} ${s.apellidos || ''}`.trim() || 'Sin nombre';
                    const inactive = s.isActive === false;
                    const chipClass = inactive
                      ? 'text-gray-400 bg-gray-100 px-2 py-1 rounded'
                      : canViewStudents
                        ? 'text-violet-600 hover:underline bg-violet-50 px-2 py-1 rounded'
                        : 'text-gray-400 bg-gray-100 px-2 py-1 rounded';
                    return inactive ? (
                      <span key={s.id} className={chipClass} title="Estudiante inactivo">{name}</span>
                    ) : canViewStudents ? (
                      <Link key={s.id} to={`/students/${s.id}`} className={chipClass}>{name}</Link>
                    ) : (
                      <span key={s.id} className={chipClass} title="Sin permisos para ver estudiantes">{name}</span>
                    );
                  })
                ) : (
                  <span className="text-gray-400">Sin estudiantes asociados</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link to={`/guardians/edit/${guardian.id}`}>
              <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
                <FaEdit />
                <span>Editar Perfil</span>
              </button>
            </Link>
            {canViewStudents && guardian.students?.find(s => s.isActive !== false) && (
              <Link to={`/students/${guardian.students.find(s => s.isActive !== false)?.id}`}>
                <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
                  <FaUserCircle />
                  <span>Ver Estudiante</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t border-violet-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Nombre Completo" value={guardian.fullName} />
            <InfoField label="Parentesco" value={guardian.parentesco.replace('_', ' ')} />
            <InfoField label="Número de Identidad" value={guardian.numeroIdentidad} />
            <InfoField label="Número de Teléfono" value={guardian.telefono} />
            <InfoField label="Dirección de Emergencia" value={guardian.direccionEmergencia} />
            <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500 font-semibold">Estudiantes Vinculados</p>
              {guardian.students && guardian.students.length > 0 ? (
                <ul className="list-disc list-inside text-lg text-gray-800">
                  {guardian.students.map(s => {
                    const name = s.fullName || `${s.nombres || ''} ${s.apellidos || ''}`.trim() || 'Sin nombre';
                    const inactive = s.isActive === false;
                    return (
                      <li key={s.id}>
                        {inactive ? (
                          <span className="text-gray-400" title="Estudiante inactivo">{name}</span>
                        ) : canViewStudents ? (
                          <Link to={`/students/${s.id}`} className="text-violet-600 hover:underline">{name}</Link>
                        ) : (
                          <span className="text-gray-400" title="Sin permisos para ver estudiantes">{name}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-lg text-gray-800">Sin estudiantes asociados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>No se pudo determinar el tipo de perfil.</div>;
}

export default ProfilePage;

