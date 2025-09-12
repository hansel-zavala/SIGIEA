// frontend/src/pages/EventsPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import eventService, { type Event } from "../services/eventService";
import { FaCalendarAlt, FaPlus, FaPencilAlt, FaTrash, FaTags } from "react-icons/fa";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    eventService.getAllEvents()
      .then(data => {
        setEvents(data);
      })
      .catch(() => {
        setError("No se pudo cargar la lista de eventos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleDelete = async (eventId: number) => {
    try {
      await eventService.deleteEvent(eventId);
      fetchEvents(); 
    } catch (err) {
      setError("No se pudo desactivar el evento.");
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


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <p>Cargando eventos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Eventos
        </h2>
        <Link to="/categories">
          <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-500 hover:to-gray-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
            <FaTags className="text-xl" />
            <span className="text-lg">Gestionar Categorías</span>
          </button>
        </Link>
        <Link to="/events/new">
            <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
              <FaPlus className="text-xl" />
              <span className="text-lg">Crear Nuevo Evento</span>
            </button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Título del Evento</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Fecha de Inicio</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Audiencia</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Categoría</th>
              <th className="px-5 py-3 font-medium text-gray-500 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600"><FaCalendarAlt /></div>
                      <span className="font-medium text-gray-800 text-x">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(event.startDate)}</td>
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
                    <div className="flex gap-4">
                      
                      <Link to={`/events/edit/${event.id}`} title="Editar Evento">
                        <FaPencilAlt className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                      </Link>
                      <button onClick={() => openDeleteDialog(event.id)} title="Desactivar Evento">
                        <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">
                  No hay eventos creados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
