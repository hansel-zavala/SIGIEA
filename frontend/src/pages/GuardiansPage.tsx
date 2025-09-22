// frontend/src/pages/GuardiansPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import guardianService from '../services/guardianService';
import SearchInput from "../components/ui/SearchInput";
import Pagination from '../components/ui/Pagination';
import { FaUserCircle, FaPencilAlt, FaTrash, FaUndo, FaSearch } from 'react-icons/fa';
import Badge from '../components/ui/Badge';
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ExportMenu from '../components/ExportMenu';
import { downloadBlob, inferFilenameFromResponse } from '../utils/downloadFile';
import { actionButtonStyles } from '../styles/actionButtonStyles';

interface Guardian {
  id: number;
  nombres: string;
  apellidos: string;
  fullName: string; 
  telefono: string;
  numeroIdentidad: string;
  parentesco: string;
  isActive: boolean;
  students: { id?: number; fullName?: string; nombres?: string; apellidos?: string; isActive?: boolean }[];
}

const GUARDIANS_PAGE_SIZE_KEY = 'guardians-list-page-size';

function GuardiansPage() {
  const { user } = useAuth();

  // Check permission
  const hasPermission = user && (user.role === 'ADMIN' || user.permissions?.['VIEW_GUARDIANS']);
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const stored = window.localStorage.getItem(GUARDIANS_PAGE_SIZE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  });
  const [statusFilter, setStatusFilter] = useState('active');
  const [confirmAction, setConfirmAction] = useState<"deactivate" | "reactivate" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectGuardianId, setSelectedStudentId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  const canEditGuardians = user?.role === 'ADMIN' || user?.permissions?.['EDIT_GUARDIANS'];
  const canDeleteGuardians = user?.role === 'ADMIN' || user?.permissions?.['DELETE_GUARDIANS'];
  const canExportGuardians = user?.role === 'ADMIN' || user?.permissions?.['EXPORT_GUARDIANS'];





  const fetchGuardians = () => {
      setLoading(true);
      guardianService.getAllGuardians(searchTerm, currentPage, itemsPerPage, statusFilter)
          .then(response => {
              const normalized = (response.data || []).map((g: any) => ({
                ...g,
                students: Array.isArray(g?.students)
                  ? g.students
                  : (g && g.student ? [g.student] : []),
              }));
              setGuardians(normalized);
              setTotalItems(response.total);
              setError("");
          })
          .catch(() => {
              setError('No se pudo cargar la lista de guardianes.');
          })
          .finally(() => {
              setLoading(false);
          });
  };

  useEffect(() => {
    const timerId = setTimeout(fetchGuardians, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, currentPage, itemsPerPage, statusFilter]);

  useEffect(() => {
    if (typeof window !== 'undefined' && itemsPerPage > 0) {
      window.localStorage.setItem(GUARDIANS_PAGE_SIZE_KEY, String(itemsPerPage));
    }
  }, [itemsPerPage]);

  const handleDelete = async (guardianId: number) => {
    try {
      await guardianService.deleteGuardian(guardianId);
      showToast({ message: 'Se eliminó correctamente.', type: 'error' });
      fetchGuardians();
    } catch (err) {
      setError('No se pudo desactivar al guardián.');
    }
  };

  const handleReactivate = async (guardianId: number) => {
    try {
      await guardianService.reactivateGuardian(guardianId);
      showToast({ message: 'Se reactivó correctamente.' }); 
      fetchGuardians(); 
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo reactivar al guardián.');
    }
  };

  const handleExportGuardians = async ({ status, format }: { status: string; format: string }) => {
    try {
      setIsExporting(true);
      const response = await guardianService.exportGuardians(status, format);
      const filename = inferFilenameFromResponse(response, `guardianes-${status}.csv`);
      downloadBlob(response.data, filename);
      showToast({ message: 'Exportación de padres/tutores generada correctamente.' });
    } catch (err) {
      console.error('Error al exportar guardianes', err);
      showToast({ message: 'No se pudo exportar la lista de padres.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (size: number) => {
      if (size <= 0) return;
      setItemsPerPage(size);
      setCurrentPage(1);
  };

  const openDeactivateDialog = (studentId: number) => {
    setSelectedStudentId(studentId);
    setConfirmAction("deactivate");
    setConfirmOpen(true);
  };

  const openReactivateDialog = (studentId: number) => {
    setSelectedStudentId(studentId);
    setConfirmAction("reactivate");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectGuardianId || !confirmAction) return;
    if (confirmAction === "deactivate") await handleDelete(selectGuardianId);
    if (confirmAction === "reactivate") await handleReactivate(selectGuardianId);
    setConfirmOpen(false);
    setSelectedStudentId(null);
    setConfirmAction(null);
  }; 

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Gestión de los Padres</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
        <div className="group relative flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow border border-gray-200 mb-4">
          <FaSearch className="text-gray-400" size={16} />
            <SearchInput
                type="text"
                className="text-base"
                placeholder="Buscar por nombre, identidad o estudiante..."
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
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mt-1">Estos botones son para filtrar la lista de padres por estado.</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => handleFilterChange('active')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'active' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Activos</button>
        <button onClick={() => handleFilterChange('inactive')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'inactive' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Inactivos</button>
        <button onClick={() => handleFilterChange('all')} className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'all' ? 'text-white font-bold bg-violet-500' : 'bg-gray-200'}`}>Todos</button>
      <div className="flex-1"></div>
      {canExportGuardians && (
        <ExportMenu
              defaultStatus={statusFilter}
              onExport={handleExportGuardians}
              statuses={[
                { value: 'all', label: 'Todos' },
                { value: 'active', label: 'Activos' },
                { value: 'inactive', label: 'Inactivos' },
              ]}
              triggerLabel={isExporting ? 'Exportando…' : 'Exportar'}
              disabled={isExporting}
            />
      )}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-xs text-gray-500 mt-1">Hacer click en la foto o nombre del Padre para ver perfil. </p>
        <p className="text-xs text-gray-500 mt-1">ACCIONES: El lápiz es para editar, el bote es para eliminar.</p>
      </div>


      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Nombre del Guardián</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">No. de Identidad</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Parentesco</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Estudiante Asociado</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Teléfono</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Estado</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr><td colSpan={7} className="text-center p-8 text-gray-500">Cargando...</td></tr>
            ) : guardians.length > 0 ? (
                guardians.map((guardian) => (
                  <tr key={guardian.id}>
                    <td className="px-5 py-4">
                      <Link to={`/guardians/${guardian.id}`} className="flex items-center gap-3 group">
                        <div className="text-gray-400 group-hover:text-violet-500">
                          <FaUserCircle size={40} />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 group-hover:underline group-hover:text-violet-600">
                            {guardian.fullName}
                          </span>
                          <span className="block text-gray-500 text-xs">ID: {guardian.id}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{guardian.numeroIdentidad}</td>
                    <td className="px-5 py-4 text-gray-500">{guardian.parentesco.replace('_', ' ')}</td>
                    <td className="px-5 py-4 text-gray-500">
                      {(() => {
                        const list = guardian.students || [];
                        const nameOf = (s: any) => s?.fullName || `${s?.nombres || ''} ${s?.apellidos || ''}`.trim() || 'Sin nombre';
                        if (list.length === 0) return '—';
                        return (
                          <div className="flex flex-wrap gap-1">
                            {list.map((s, idx) => {
                              const inactive = s?.isActive === false;
                              const chipClass = inactive
                                ? 'bg-gray-100 text-gray-400 px-2 py-0.5 rounded'
                                : 'bg-violet-50 text-violet-700 px-2 py-0.5 rounded';
                              return (
                                <span key={idx} className={chipClass} title={inactive ? 'Estudiante inactivo' : 'Estudiante activo'}>
                                  {nameOf(s)}
                                </span>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{guardian.telefono}</td>
                    <td className="px-5 py-4">
                      <Badge color={guardian.isActive ? "success" : "error"}>{guardian.isActive ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {canEditGuardians && (
                          <Link
                            to={`/guardians/edit/${guardian.id}`}
                            title="Editar Guardián"
                            className={actionButtonStyles.edit}
                          >
                            <FaPencilAlt className="text-lg" />
                          </Link>
                        )}
                        {canDeleteGuardians && (
                          guardian.isActive ? (
                            <button
                              onClick={() => openDeactivateDialog(guardian.id)}
                              title="Desactivar Guardián"
                              className={actionButtonStyles.delete}
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openReactivateDialog(guardian.id)}
                              title="Reactivar Guardián"
                              className={actionButtonStyles.reactivate}
                            >
                              <FaUndo className="text-lg" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
                <tr><td colSpan={7} className="text-center p-8 text-gray-500">No se encontraron guardianes.</td></tr>
            )}
          </tbody>
        </table>
        {guardians.length > 0 && (
          <div className="bborder-t border-gray-200 bg-gray-50 px-4 py-3">
        <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
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
        title={confirmAction === 'deactivate' ? 'Desactivar estudiante' : 'Reactivar estudiante'}
        description={
          confirmAction === 'deactivate'
            ? '¿Estás seguro que deseas desactivar a este estudiante? Podrás reactivarlo más adelante.'
            : '¿Estás seguro que deseas reactivar a este estudiante?'
        }
        confirmText={confirmAction === 'deactivate' ? 'Desactivar' : 'Reactivar'}
        confirmButtonClassName={
          confirmAction === 'deactivate'
            ? 'min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md'
            : 'min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md'
        }
      />
    </div>
  );
}

export default GuardiansPage;
