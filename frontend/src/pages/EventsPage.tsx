// frontend/src/pages/EventsPage.tsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import eventService, { type Event } from "../services/eventService";
import { FaCalendarAlt, FaPlus, FaPencilAlt, FaTrash, FaTags, FaSearch, FaUndo } from "react-icons/fa";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Pagination from "../components/ui/Pagination";
import SearchInput from "../components/ui/SearchInput";
import { actionButtonStyles } from "../styles/actionButtonStyles";
import ExportMenu from "../components/ExportMenu";
import { downloadBlob, inferFilenameFromResponse } from "../utils/downloadFile";

const EVENTS_PAGE_SIZE_KEY = 'events-page-size';

function EventsPage() {
  const { user } = useAuth();

  // Check permission
  const hasPermission = user && (user.role === 'ADMIN' || user.permissions?.['VIEW_EVENTS']);
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

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const stored = window.localStorage.getItem(EVENTS_PAGE_SIZE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  });
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const canCreateEvents = user?.role === 'ADMIN' || user?.permissions?.['CREATE_EVENTS'];
  const canEditEvents = user?.role === 'ADMIN' || user?.permissions?.['EDIT_EVENTS'];
  const canDeleteEvents = user?.role === 'ADMIN' || user?.permissions?.['DELETE_EVENTS'];
  const canExportEvents = user?.role === 'ADMIN' || user?.permissions?.['EXPORT_EVENTS'];
  const canManageCategories = user?.role === 'ADMIN' || user?.permissions?.['MANAGE_CATEGORIES'];

  const fetchEvents = (
    status: 'active' | 'inactive' | 'all' = statusFilter,
    search = searchTerm,
  ) => {
    setLoading(true);
    eventService.getAllEvents({ status, search })
      .then(data => {
        setEvents(data);
        setError("");
      })
      .catch(() => {
        setError("No se pudo cargar la lista de eventos.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents(statusFilter, searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [statusFilter, searchTerm]);

const handleDelete = async (eventId: number) => {
    try {
      await eventService.deleteEvent(eventId);
      showToast({ message: 'Se desactivó el evento correctamente.', type: 'error' });
      fetchEvents(statusFilter);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'No se pudo desactivar el evento.';
      showToast({ message, type: 'error' });
    }
  };

  const handleReactivate = async (eventId: number) => {
    try {
      await eventService.reactivateEvent(eventId);
      showToast({ message: 'Evento reactivado correctamente.' });
      fetchEvents(statusFilter);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'No se pudo reactivar el evento.';
      showToast({ message, type: 'error' });
    }
  };

  const handleExportEvents = async ({ status, format }: { status: string; format: string }) => {
    try {
      setIsExporting(true);
      const response = await eventService.exportEvents(status as 'active' | 'inactive' | 'all', format);
      const extension = format === 'excel' ? 'xlsx' : format;
      const filename = inferFilenameFromResponse(response, `eventos-${status}.${extension}`);
      downloadBlob(response.data, filename);
      showToast({ message: 'Exportación de eventos generada correctamente.' });
    } catch (err) {
      console.error('Error al exportar eventos', err);
      showToast({ message: 'No se pudo exportar la lista de eventos.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const openDeleteDialog = (eventId: number) => {
    setSelectedEventId(eventId);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedEventId) return;
    await handleDelete(selectedEventId);
    setConfirmOpen(false);
    setSelectedEventId(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && itemsPerPage > 0) {
      window.localStorage.setItem(EVENTS_PAGE_SIZE_KEY, String(itemsPerPage));
    }
  }, [itemsPerPage]);

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return events;
    return events.filter((eventItem) => {
      const titleMatch = eventItem.title.toLowerCase().includes(term);
      const categoryMatch = eventItem.category?.name?.toLowerCase().includes(term) ?? false;
      const audienceMatch = eventItem.audience?.toLowerCase().includes(term) ?? false;
      return titleMatch || categoryMatch || audienceMatch;
    });
  }, [events, searchTerm]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / Math.max(itemsPerPage, 1)));
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [filteredEvents.length, itemsPerPage]);

  const currentEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredEvents.slice(start, end);
  }, [filteredEvents, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (size: number) => {
    if (size <= 0) return;
    setItemsPerPage(size);
    setCurrentPage(1);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Gestión de Eventos</h2>
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-gray-500"></p>
        <p className="text-xs text-gray-500 pr-24">
          El botón de gestionar categorías ayuda a asignar colores rápidos a cada tipo de evento.
        </p>
        
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex-1">
          <div className="group relative flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow border border-gray-200">
            <FaSearch className="text-gray-400" size={16} />
            <SearchInput
              type="text"
              className="text-base"
              placeholder="Buscar por título, categoría o audiencia..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
            <span className="pointer-events-none absolute inset-x-4 bottom-[6px] h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-500 transition-transform duration-200 group-focus-within:scale-x-100" />
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {canManageCategories && (
            <Link to="/categories" className="md:ml-4">
              <button className="w-full min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-500 hover:to-gray-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md md:w-auto">
                <FaTags className="text-xl" />
                <span className="text-lg">Gestionar Categorías</span>
              </button>
            </Link>
          )}
          {canCreateEvents && (
            <Link to="/events/new" className="md:ml-3">
              <button className="w-full min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md md:w-auto">
                <FaPlus className="text-xl" />
                <span className="text-lg">Crear Nuevo Evento</span>
              </button>
            </Link>
          )}
        </div>
        <div className="md:ml-3">
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'active' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Activos</button>
          <button
            onClick={() => { setStatusFilter('inactive'); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'inactive' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Inactivos</button>
          <button
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm rounded-md ${statusFilter === 'all' ? 'text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md' : 'bg-gray-200'}`}>Todos</button>
          <div className="flex-1"></div>
          {canExportEvents && (
            <ExportMenu
              defaultStatus={statusFilter}
              onExport={handleExportEvents}
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

      <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-xs text-gray-500 mt-1"></p>
        <p className="text-xs text-gray-500 mt-1">ACCIONES: El lápiz es para editar, el bote es para desactivar y la flecha para reactivar.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Título del Evento</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Fecha de Inicio</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Fecha de Finalizacion</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Audiencia</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Categoría</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">Cargando eventos...</td>
              </tr>
            ) : currentEvents.length > 0 ? (
              currentEvents.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600"><FaCalendarAlt size={20}/></div>
                      <span className="font-medium text-gray-800">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(event.startDate)}</td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(event.endDate || event.startDate)}</td>
                  <td className="px-5 py-4 text-gray-600">{event.audience}</td>
                  <td className="px-5 py-4 text-gray-600 flex items-center gap-2">
                    {event.category?.color && (
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.category.color }}
                        title={event.category?.name}
                      />
                    )}
                    {event.category?.name}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {canEditEvents && (
                        <Link
                          to={`/events/edit/${event.id}`}
                          title="Editar Evento"
                          className={actionButtonStyles.edit}
                        >
                          <FaPencilAlt className="text-lg" />
                        </Link>
                      )}
                      {canDeleteEvents && (
                        event.isActive ? (
                          <button
                            onClick={() => openDeleteDialog(event.id)}
                            title="Desactivar Evento"
                            className={actionButtonStyles.delete}
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(event.id)}
                            title="Reactivar Evento"
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
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  {error
                    ? 'No se pudieron cargar los eventos.'
                    : 'No se encontraron eventos con ese criterio.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredEvents.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <Pagination
            itemsPerPage={itemsPerPage}
            totalItems={filteredEvents.length}
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
        title="Desactivar evento"
        description="¿Estás seguro que deseas desactivar este evento? Esta acción no eliminará los registros históricos."
        confirmText="Desactivar"
        confirmButtonClassName="min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
      />
    </div>
  );
}

export default EventsPage;
