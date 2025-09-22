// frontend/src/pages/GuardianProfilePage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import guardianService from '../services/guardianService';
import { FaUserCircle, FaEdit, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

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

const InfoField = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500 font-semibold">{label}</p>
    <p className="text-lg text-gray-800">{value || 'No especificado'}</p>
  </div>
);

function GuardianProfilePage() {
  const { user } = useAuth();
  const [guardian, setGuardian] = useState<GuardianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();

  const canViewStudents = user?.role === 'ADMIN' || user?.permissions?.['VIEW_STUDENTS'];
  const canEditGuardians = user?.role === 'ADMIN' || user?.permissions?.['EDIT_GUARDIANS'];

  useEffect(() => {
    if (id) {
      guardianService.getGuardianById(Number(id))
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
          setError('No se pudo cargar el perfil del guardián.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!guardian) return <p>No se encontró el guardián.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md ">
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
          {canEditGuardians && (
            <Link to={`/guardians/edit/${guardian.id}`}>
              <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
                <FaEdit />
                <span>Editar Padre</span>
              </button>
            </Link>
          )}
          {canViewStudents && (() => {
            const firstActive = guardian.students?.find(s => s.isActive !== false);
            if (!firstActive) return null;
            return (
              <Link to={`/students/${firstActive.id}`}>
                <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
                  <FaUserGraduate />
                  <span>Ver Perfil del Estudiante</span>
                </button>
              </Link>
            );
          })()}
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

export default GuardianProfilePage;
