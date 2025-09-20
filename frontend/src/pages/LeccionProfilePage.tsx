// frontend/src/pages/LeccionProfilePage.tsx 
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import leccionService from '../services/leccionService';
import { FaBookOpen, FaEdit } from 'react-icons/fa';

interface LeccionDetail {
  id: number;
  title: string;
  isActive: boolean;
  category: string | null;
  keySkill: string | null;
  objective: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string | null;
    email: string;
  } | null;
}

const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="bg-gray-100 p-3 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500 font-semibold">{label}</p>
    <p className="text-base text-gray-800 whitespace-pre-line">{value?.trim() ? value : 'No especificado'}</p>
  </div>
);

const formatDate = (date?: string) => {
  if (!date) return 'No especificado';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'No especificado';
  return parsed.toLocaleString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${
      isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
        : 'border-red-200 bg-red-50 text-red-600'
    }`}
  >
    {isActive ? 'Activa' : 'Inactiva'}
  </span>
);

function LeccionProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<LeccionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Identificador de lección inválido.');
      setLoading(false);
      return;
    }

    leccionService
      .getLeccionById(Number(id))
      .then((data) => setLesson(data))
      .catch(() => setError('No se pudo cargar la lección.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Cargando lección...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!lesson) return <p>No se encontró la lección solicitada.</p>;

  const createdByLabel = lesson.createdBy?.name?.trim()
    ? lesson.createdBy?.name
    : lesson.createdBy?.email || 'No especificado';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <div className="flex flex-col gap-6 pb-6 border-b">
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center border-4 border-violet-200">
              <FaBookOpen size={48} className="text-violet-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{lesson.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <StatusBadge isActive={lesson.isActive} />
                {lesson.category && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-violet-200 bg-violet-50 text-violet-600">
                    {lesson.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
          <Link
            to={`/lecciones/edit/${lesson.id}`}
            className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
          >
            <FaEdit />
            Editar Lección
          </Link>
        </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Título" value={lesson.title} />
          <InfoField label="Categoría" value={lesson.category || 'Sin categoría'} />
          <InfoField label="Habilidad Clave" value={lesson.keySkill} />
          <InfoField label="Creada Por" value={createdByLabel} />
          <InfoField label="Fecha de Creación" value={formatDate(lesson.createdAt)} />
          <InfoField label="Última Actualización" value={formatDate(lesson.updatedAt)} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-700">Objetivo de la Lección</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 leading-relaxed">
          {lesson.objective?.trim() || 'No especificado'}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-700">Descripción Detallada</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 leading-relaxed whitespace-pre-line">
          {lesson.description?.trim() || 'No especificado'}
        </div>
      </section>
    </div>
  );
}

export default LeccionProfilePage;
