// frontend/src/pages/LeccionesPage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import leccionService from "../services/leccionService";
import type { LeccionStatusFilter } from "../services/leccionService";
import Badge from "../components/ui/Badge";
import SearchInput from "../components/ui/SearchInput";
import { FaBook, FaPencilAlt, FaTrash, FaPlus, FaSearch, FaUndoAlt } from "react-icons/fa";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { useToast } from '../context/ToastContext';
import Pagination from "../components/ui/Pagination";
import { actionButtonStyles } from "../styles/actionButtonStyles";
import ExportMenu from "../components/ExportMenu";
import { downloadBlob, inferFilenameFromResponse } from "../utils/downloadFile";

interface LeccionSummary {
  id: number;
  title: string;
  objective: string | null;
  category: string | null;
  isActive: boolean;
}

const LESSONS_PAGE_SIZE_KEY = 'lecciones-items-per-page';

function LeccionesPage() {
  const [lecciones, setLecciones] = useState<LeccionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const stored = window.localStorage.getItem(LESSONS_PAGE_SIZE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  });
  const [statusFilter, setStatusFilter] = useState<LeccionStatusFilter>('active');
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const fetchLecciones = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await leccionService.getAllLecciones(statusFilter);
      setLecciones(data);
    } catch (err) {
      setError("No se pudo cargar la lista de lecciones.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const handleFilterChange = useCallback((value: LeccionStatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchLecciones();
  }, [fetchLecciones]);

  const handleDelete = async (leccionId: number) => {
    try {
      await leccionService.deleteLeccion(leccionId);
      showToast({ message: 'Lección desactivada correctamente.', type: 'error' });
      await fetchLecciones();
    } catch (err) {
      setError("No se pudo desactivar la lección.");
    }
  };

  const handleActivate = async (leccionId: number) => {
    try {
      await leccionService.activateLeccion(leccionId);
      showToast({ message: 'Lección reactivada correctamente.' });
      await fetchLecciones();
    } catch (err) {
      setError("No se pudo activar la lección.");
    }
  };

  const handleExportLecciones = async ({ status, format }: { status: string; format: string }) => {
    try {
      setIsExporting(true);
      const response = await leccionService.exportLecciones(status as LeccionStatusFilter, format);
      const filename = inferFilenameFromResponse(response, `lecciones-${status}.csv`);
      downloadBlob(response.data, filename);
      showToast({ message: 'Exportación de lecciones generada correctamente.' });
    } catch (err) {
      console.error('Error al exportar lecciones', err);
      showToast({ message: 'No se pudo exportar la lista de lecciones.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const openDeleteDialog = (leccionId: number) => {
    setSelectedLessonId(leccionId);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedLessonId) return;
    await handleDelete(selectedLessonId);
    setConfirmOpen(false);
    setSelectedLessonId(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LESSONS_PAGE_SIZE_KEY, String(itemsPerPage));
    }
  }, [itemsPerPage]);

  const filteredLecciones = useMemo(() => {
    const term = searchTerm.trim().toLowerCase(); 
    if (!term) return lecciones;
    return lecciones.filter((leccion) => {
      const titleMatch = leccion.title?.toLowerCase().includes(term);
      const categoryMatch = (leccion.category || "").toLowerCase().includes(term);
      return titleMatch || categoryMatch;
    });
  }, [lecciones, searchTerm]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredLecciones.length / Math.max(itemsPerPage, 1)));
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [filteredLecciones.length, itemsPerPage]);

  const currentLecciones = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredLecciones.slice(start, end);
  }, [filteredLecciones, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    if (size <= 0) return;
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Catálogo de Lecciones</h2>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="group relative flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow border border-gray-200">
              <FaSearch className="text-gray-400" size={16} />
              <SearchInput
                type="text"
                className="text-base"
                placeholder="Buscar por título o categoría..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  const validCharsRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s-]*$/;
                  if (validCharsRegex.test(value)) {
                    setSearchTerm(value);
                    setCurrentPage(1);
                  }
                }}
              />
              <span className="pointer-events-none absolute inset-x-4 bottom-[6px] h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-500 transition-transform duration-200 group-focus-within:scale-x-100" />
            </div>
          </div>
                
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Link to="/lecciones/new" className="md:ml-4">
              <button className="w-full min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duración-200 flex items-center justify-center gap-3 shadow-md md:w-auto">
                <FaPlus className="text-xl" />
                <span className="text-lg">Crear Nueva Lección</span>
              </button>
            </Link>
            <ExportMenu
              defaultStatus={statusFilter}
              onExport={handleExportLecciones}
              statuses={[
                { value: 'all', label: 'Todas' },
                { value: 'active', label: 'Activas' },
                { value: 'inactive', label: 'Inactivas' },
              ]}
              triggerLabel={isExporting ? 'Exportando…' : 'Exportar'}
              disabled={isExporting}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => handleFilterChange('active')}
          className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'active' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}
        >
          Activas
        </button>
        <button
          onClick={() => handleFilterChange('inactive')}
          className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'inactive' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}
        >
          Inactivas
        </button>
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'all' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}
        >
          Todas
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-xs text-gray-500 mt-1">Haz clic en el ícono o título de la lección para ver su perfil.</p>
        <p className="text-xs text-gray-500 mt-1">Acciones disponibles: editar o activar/desactivar la lección.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Título
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Categoría
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-500">Cargando lecciones...</td>
                </tr>
              ) : currentLecciones.length > 0 ? (
                currentLecciones.map((leccion) => (
                  <tr key={leccion.id}>
                    <td className="px-5 py-4">
                      <Link to={`/lecciones/${leccion.id}`} className="flex items-center gap-3 group">
                        <div className="text-blue-600 group-hover:text-violet-500 transition-colors">
                          <FaBook size={30} />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 group-hover:text-violet-600 group-hover:underline">
                            {leccion.title}
                          </span>
                          <span className="block text-gray-500 text-xs md:text-sm">
                            {leccion.objective || 'Sin objetivo definido'}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={leccion.category ? "info" : "warning"}>
                        {leccion.category || "Sin categoría"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/lecciones/edit/${leccion.id}`}
                          title="Editar"
                          className={actionButtonStyles.edit}
                        >
                          <FaPencilAlt className="text-lg" />
                        </Link>
                        {leccion.isActive ? (
                          <button
                            onClick={() => openDeleteDialog(leccion.id)}
                            title="Desactivar"
                            className={actionButtonStyles.delete}
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(leccion.id)}
                            title="Activar"
                            className={actionButtonStyles.reactivate}
                          >
                            <FaUndoAlt className="text-lg" />
                          </button>
                        )}
                    </div>
                  </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                    {error
                      ? 'No se pudieron cargar las lecciones.'
                      : 'No se encontraron lecciones con ese criterio.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredLecciones.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <Pagination
              itemsPerPage={itemsPerPage}
              totalItems={filteredLecciones.length}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Desactivar lección"
        description="¿Estás seguro que deseas desactivar esta lección? Podrás reactivarla creando una nueva si es necesario."
        confirmText="Desactivar"
        confirmButtonClassName="min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
      />
    </div>
  );
}

export default LeccionesPage;
