// frontend/src/pages/TemplatesPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import reportTemplateService, { type ReportTemplate } from '../services/reportTemplateService';

type StatusFilter = 'all' | 'draft' | 'published';

function TemplatesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  const statusParam = (searchParams.get('status') as StatusFilter) || 'all';
  const [status, setStatus] = useState<StatusFilter>(statusParam);

  useEffect(() => {
    setLoading(true);
    reportTemplateService
      .getAllTemplates()
      .then((data) => setTemplates(data))
      .catch(() => setError('No se pudieron cargar las plantillas.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (status === 'all') p.delete('status'); else p.set('status', status);
      return p;
    }, { replace: true });
  }, [status, setSearchParams]);

  const counts = useMemo(() => {
    const all = templates.length;
    const drafts = templates.filter(t => !t.publishedAt).length;
    const published = templates.filter(t => !!t.publishedAt).length;
    return { all, drafts, published };
  }, [templates]);

  const filtered = useMemo(() => {
    if (status === 'draft') return templates.filter(t => !t.publishedAt);
    if (status === 'published') return templates.filter(t => !!t.publishedAt);
    return templates;
  }, [templates, status]);

  const handlePublishToggle = async (tpl: ReportTemplate) => {
    try {
      const willPublish = !tpl.publishedAt;
      const updated = await reportTemplateService.publishTemplate(tpl.id, willPublish);
      setTemplates(prev => prev.map(t => t.id === tpl.id ? updated : t));
    } catch {
      alert('No se pudo cambiar el estado de publicación.');
    }
  };

  const handleClone = async (tpl: ReportTemplate) => {
    try {
      const cloned = await reportTemplateService.cloneTemplate(tpl.id);
      setTemplates(prev => [cloned, ...prev]);
      if (!cloned.publishedAt) {
        const goEdit = confirm('Plantilla clonada como borrador. ¿Deseas editarla ahora?');
        if (goEdit) navigate(`/templates/new?id=${cloned.id}`);
      }
    } catch {
      alert('No se pudo clonar la plantilla.');
    }
  };

  const handleDelete = async (tpl: ReportTemplate) => {
    const ok = confirm(`¿Eliminar la plantilla "${tpl.title}"? Se ocultará del sistema (borrado lógico).`);
    if (!ok) return;
    try {
      await reportTemplateService.deleteTemplate(tpl.id);
      setTemplates(prev => prev.filter(t => t.id !== tpl.id));
    } catch {
      alert('No se pudo eliminar la plantilla.');
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleString(); } catch { return d as string; }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Plantillas de Reporte</h2>
        <div className="flex gap-2">
          <button
            className="py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={() => setStatus('all')}
          >Todos ({counts.all})</button>
          <button
            className="py-2 px-4 rounded-md bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
            onClick={() => setStatus('draft')}
          >Borradores ({counts.drafts})</button>
          <button
            className="py-2 px-4 rounded-md bg-green-100 hover:bg-green-200 text-green-800"
            onClick={() => setStatus('published')}
          >Publicadas ({counts.published})</button>
          <button
            className="py-2 px-4 rounded-md bg-violet-500 hover:bg-violet-600 text-white font-semibold"
            onClick={() => navigate('/templates/new')}
          >Nueva Plantilla</button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actualizado</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-semibold text-gray-800">{t.title}</div>
                    {t.description && (
                      <div className="text-xs text-gray-500 line-clamp-1">{t.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-2">v{t.version}</td>
                  <td className="px-4 py-2">
                    {t.publishedAt ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Publicada</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Borrador</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{formatDate((t as any).updatedAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <button
                        className={`px-3 py-1 rounded-md text-white ${t.publishedAt ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
                        onClick={() => handlePublishToggle(t)}
                        title={t.publishedAt ? 'Despublicar' : 'Publicar'}
                      >{t.publishedAt ? 'Despublicar' : 'Publicar'}</button>
                      <button
                        className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleClone(t)}
                        title="Clonar"
                      >Clonar</button>
                      <button
                        className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDelete(t)}
                        title="Eliminar"
                      >Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-6">No hay plantillas para este filtro.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TemplatesPage;

