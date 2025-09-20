// frontend/src/pages/TemplatesPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import reportTemplateService, { type ReportTemplate } from '../services/reportTemplateService';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/ui/Pagination';

type StatusFilter = 'all' | 'draft' | 'published';

const TEMPLATES_PAGE_SIZE_KEY = 'templates-page-size';

function TemplatesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const { showToast } = useToast();

  const statusParam = (searchParams.get('status') as StatusFilter) || 'all';
  const [status, setStatus] = useState<StatusFilter>(statusParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const stored = window.localStorage.getItem(TEMPLATES_PAGE_SIZE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  });

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

  useEffect(() => {
    if (typeof window !== 'undefined' && itemsPerPage > 0) {
      window.localStorage.setItem(TEMPLATES_PAGE_SIZE_KEY, String(itemsPerPage));
    }
  }, [itemsPerPage]);

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

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / Math.max(itemsPerPage, 1)));
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [filtered.length, itemsPerPage]);

  const currentTemplates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, itemsPerPage]);

  const handlePublishToggle = async (tpl: ReportTemplate) => {
    try {
      const willPublish = !tpl.publishedAt;
      const updated = await reportTemplateService.publishTemplate(tpl.id, willPublish);
      setTemplates(prev => prev.map(t => t.id === tpl.id ? updated : t));
      showToast({ message: willPublish ? 'Plantilla publicada correctamente.' : 'Plantilla pasada a borrador.' });
    } catch {
      setError('No se pudo cambiar el estado de publicación.');
    }
  };

  const handleEdit = (tpl: ReportTemplate) => {
    navigate(`/templates/new?id=${tpl.id}`);
  };

  const handleDelete = async (tpl: ReportTemplate) => {
    const ok = confirm(`¿Eliminar la plantilla "${tpl.title}"? Se ocultará del sistema (borrado lógico).`);
    if (!ok) return;
    try {
      await reportTemplateService.deleteTemplate(tpl.id);
      setTemplates(prev => prev.filter(t => t.id !== tpl.id));
      showToast({ message: 'Se eliminó correctamente.', type: 'error' });
    } catch {
      setError('No se pudo eliminar la plantilla.');
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (size: number) => {
    if (size <= 0) return;
    setItemsPerPage(size);
    setCurrentPage(1);
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left  font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-4 py-2 text-left  font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-2 text-left  font-medium text-gray-500 uppercase tracking-wider">Actualizado</th>
                <th className="px-4 py-2 text-right  font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTemplates.length > 0 ? currentTemplates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-semibold text-gray-800">{t.title}</div>
                    {t.description && (
                      <div className="text-xs text-gray-500 line-clamp-1">{t.description}</div>
                    )}
                  </td>
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
                        onClick={() => handleEdit(t)}
                        title="Editar"
                      >Editar</button>
                      <button
                        className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDelete(t)}
                        title="Eliminar"
                      >Eliminar</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    {filtered.length === 0 ? 'No hay plantillas para este filtro.' : 'No hay plantillas en esta página.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          {filtered.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
              <Pagination
                itemsPerPage={itemsPerPage}
                totalItems={filtered.length}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TemplatesPage;
